import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';

export interface ProcessUploadedPageInput {
  image?: string; // base64 data url or raw base64
  text?: string;
  classLevel?: string;
  subject?: string;
  chapterHint?: string;
}

export interface ProcessedUploadedPageResult {
  detectedClass: string;
  detectedSubject: string;
  detectedChapter: string;
  detectedPageNumber: number;
  sectionTitle: string;
  transcribedText: string;
  paragraphs: string[];
  keyConcepts: string[];
  formulas: string[];
  ncertHighlights: string[];
  inTextQuestions: string[];
  confidence: number;
}

export class NCERTOcrValidationError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 422) {
    super(message);
    this.name = 'NCERTOcrValidationError';
    this.statusCode = statusCode;
  }
}

export async function processUploadedBookPage(input: ProcessUploadedPageInput): Promise<ProcessedUploadedPageResult> {
  const hasImage = Boolean(input.image && input.image.trim().length > 0);
  const hasText = Boolean(input.text && input.text.trim().length > 0);

  if (!hasImage && !hasText) {
    throw new NCERTOcrValidationError('Please provide a photo or text excerpt of your NCERT book page.', 400);
  }

  // If text only was provided, validate minimum substantive length
  if (!hasImage && hasText) {
    const cleanText = (input.text || '').trim();
    if (cleanText.length < 50) {
      throw new NCERTOcrValidationError(
        'The provided textbook excerpt is too short (minimum 50 characters required). Please paste a complete section or paragraph.',
        400
      );
    }
  }

  const systemInstruction = `You are a high-precision NCERT Textbook OCR & Educational Content Extractor for StudyPilot AI.
Your absolute directive is to extract ONLY the text and figures that are ACTUALLY visible on the uploaded page image or excerpt.

STRICT ACCURACY RULES:
1. Transcribe ONLY text that is visibly legible on this physical textbook page. Preserve headings, paragraph text, equations, and numbered activities exactly.
2. DO NOT invent, hallucinate, synthesize, or append outside textbook knowledge, unseen chapters, or placeholder text.
3. If the image is blurry, poorly lit, cut off, unreadable, or not an authentic NCERT textbook page, you MUST return a confidence score lower than 50 and set transcribedText to reflect only what is genuinely readable.
4. Calculate a realistic "confidence" score between 0 and 100 based on text clarity, contrast, and transcription completeness.
5. Extract keyConcepts, formulas, highlights, and in-text questions ONLY if they are explicitly mentioned in the transcribed text.`;

  let contents: any;

  if (hasImage) {
    let cleanBase64 = input.image!;
    let mimeType = 'image/jpeg';

    if (cleanBase64.startsWith('data:')) {
      const match = cleanBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        cleanBase64 = match[2];
      }
    }

    contents = [
      {
        role: 'user',
        parts: [
          {
            text: `Extract and transcribe the visible text from this physical NCERT textbook page photo.
Adhere strictly to visible text only. Do not hallucinate content that is not visible.
Context hints (if applicable): Class: ${input.classLevel || 'Unknown'}, Subject: ${input.subject || 'Unknown'}, Chapter: ${input.chapterHint || 'Unknown'}`,
          },
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
        ],
      },
    ];
  } else {
    contents = `Analyze and structure this authentic NCERT textbook page text excerpt:
${input.text}

Context hints: Class: ${input.classLevel || 'Unknown'}, Subject: ${input.subject || 'Unknown'}, Chapter: ${input.chapterHint || 'Unknown'}

Transcribe faithfully and extract key elements strictly from this provided excerpt.`;
  }

  let responseText = '';
  try {
    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedClass: { type: Type.STRING },
            detectedSubject: { type: Type.STRING },
            detectedChapter: { type: Type.STRING },
            detectedPageNumber: { type: Type.INTEGER },
            sectionTitle: { type: Type.STRING },
            transcribedText: { type: Type.STRING },
            paragraphs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            keyConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            formulas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            ncertHighlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            inTextQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            confidence: { type: Type.NUMBER, description: 'Realistic OCR transcription confidence score from 0 to 100' },
          },
          required: ['detectedChapter', 'sectionTitle', 'transcribedText', 'paragraphs', 'confidence'],
        },
      },
    });
    responseText = response.text || '{}';
  } catch (error: any) {
    console.error('OCR analysis failed:', error);
    throw new NCERTOcrValidationError(
      `OCR service failed to process the page image: ${error.message || 'Image processing error'}. Please try uploading a clearer image.`
    );
  }

  let parsed: any;
  try {
    parsed = JSON.parse(responseText);
  } catch (err) {
    throw new NCERTOcrValidationError('Failed to parse OCR response from textbook analyzer.');
  }

  const transcribedText = (parsed.transcribedText || '').trim();
  const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0;

  // Enforce OCR confidence validation
  if (confidence < 60) {
    throw new NCERTOcrValidationError(
      `OCR confidence score (${confidence}%) is too low. The book page photo may be blurry, shadowed, or unreadable. Please upload a clear, well-lit photo of an NCERT textbook page.`
    );
  }

  // Enforce sufficient extracted text validation
  if (transcribedText.length < 60) {
    throw new NCERTOcrValidationError(
      'Insufficient readable textbook text was detected on this page (less than 60 characters). Please ensure the full page text is visible and well-aligned.'
    );
  }

  // Filter valid paragraphs
  const paragraphs = Array.isArray(parsed.paragraphs) && parsed.paragraphs.length > 0
    ? parsed.paragraphs.map((p: any) => String(p || '').trim()).filter((p: string) => p.length > 0)
    : [transcribedText];

  return {
    detectedClass: parsed.detectedClass || input.classLevel || '10',
    detectedSubject: parsed.detectedSubject || input.subject || 'science',
    detectedChapter: parsed.detectedChapter || input.chapterHint || 'NCERT Chapter',
    detectedPageNumber: parsed.detectedPageNumber && parsed.detectedPageNumber > 0 ? parsed.detectedPageNumber : 1,
    sectionTitle: parsed.sectionTitle || 'NCERT Page Section',
    transcribedText,
    paragraphs: paragraphs.length > 0 ? paragraphs : [transcribedText],
    keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts.map((k: any) => String(k).trim()).filter(Boolean) : [],
    formulas: Array.isArray(parsed.formulas) ? parsed.formulas.map((f: any) => String(f).trim()).filter(Boolean) : [],
    ncertHighlights: Array.isArray(parsed.ncertHighlights) ? parsed.ncertHighlights.map((h: any) => String(h).trim()).filter(Boolean) : [],
    inTextQuestions: Array.isArray(parsed.inTextQuestions) ? parsed.inTextQuestions.map((q: any) => String(q).trim()).filter(Boolean) : [],
    confidence: Math.round(confidence),
  };
}
