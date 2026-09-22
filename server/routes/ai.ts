import { Router, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { Type, Schema } from '@google/genai';
import { generateContentWithRetry, safeJsonParse } from '../gemini.js';
import { authenticateAndEnforceQuota, AuthenticatedQuotaRequest } from '../middleware/quotaAuth.js';
import { executeDeepResearch, DeepResearchInput } from '../services/deepResearchEngine.js';
import { STUDYPILOT_MASTER_TUTOR_PROMPT } from '../services/tutorPrompt.js';

export const aiRouterExtended = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Please upload PNG, JPEG, WebP, or a PDF document.'));
    }
  },
});

export interface FormulaSolverResponse {
  problemText: string;
  steps: string[];
  finalAnswer: string;
  keyFormulas: string[];
  commonPitfalls: string[];
}

const formulaSolutionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    problemText: {
      type: Type.STRING,
      description: 'The extracted or recognized mathematical/scientific problem statement transcribed cleanly with LaTeX math syntax.',
    },
    steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Ordered step-by-step mathematical reasoning, derivations, and calculations. Every equation or formula MUST be enclosed in LaTeX math tags ($...$ or $$...$$).',
    },
    finalAnswer: {
      type: Type.STRING,
      description: 'The final, concise conclusion or numerical answer with SI units and variable names in LaTeX formatting.',
    },
    keyFormulas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of key curriculum formulas, laws, or theorems applied in this derivation in LaTeX.',
    },
    commonPitfalls: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of frequent mistakes, unit conversion traps, or student misconceptions to avoid for this problem type.',
    },
  },
  required: ['problemText', 'steps', 'finalAnswer', 'keyFormulas', 'commonPitfalls'],
};

/**
 * Multi-Modal Formula Solver Endpoint
 * POST /api/ai/solve-formula
 */
aiRouterExtended.post(
  '/solve-formula',
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
      next();
    });
  },
  authenticateAndEnforceQuota,
  async (req: AuthenticatedQuotaRequest, res: Response): Promise<void> => {
    try {
      const file = req.file;
      const problemTextPrompt = req.body.problemText || req.body.prompt || '';
      const subject = req.body.subject || 'mathematics';
      const classLevel = req.body.classLevel || '10';

      if (!file && (!problemTextPrompt || problemTextPrompt.trim().length === 0)) {
        res.status(400).json({
          success: false,
          error: 'Please upload an image/PDF file or provide a problem text to solve.',
        });
        return;
      }

      const contents: any[] = [];

      if (file) {
        if (file.mimetype.startsWith('image/')) {
          // Process image with sharp: normalize, auto-rotate, resize to max 1600px, compress to jpeg
          const optimizedImageBuffer = await sharp(file.buffer)
            .rotate() // auto-orient based on EXIF
            .resize({
              width: 1600,
              height: 1600,
              fit: 'inside',
              withoutEnlargement: true,
            })
            .jpeg({ quality: 85, mozjpeg: true })
            .toBuffer();

          contents.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: optimizedImageBuffer.toString('base64'),
            },
          });
        } else if (file.mimetype === 'application/pdf') {
          // Direct PDF buffer handling
          contents.push({
            inlineData: {
              mimeType: 'application/pdf',
              data: file.buffer.toString('base64'),
            },
          });
        }
      }

      let promptInstruction = `Solve this ${subject} problem (Class ${classLevel} NCERT / CBSE curriculum standard) step-by-step.
Ground all mathematical principles, theorems, and definitions strictly in standard high school curriculum.
Format all mathematical expressions, variables, formulas, and numeric calculations in clean standard LaTeX ($...$ for inline and $$...$$ for display).
Ensure every step is pedagogically clear and complete.`;

      if (problemTextPrompt && problemTextPrompt.trim().length > 0) {
        promptInstruction += `\n\nStudent-provided context or transcribed text:\n"${problemTextPrompt.trim()}"`;
      }

      contents.push({ text: promptInstruction });

      const response = await generateContentWithRetry({
        primaryModel: 'gemini-3.8-flash',
        fallbackModel: 'gemini-flash-latest',
        contents,
        config: {
          systemInstruction: `You are an expert STEM educator, mathematician, and NCERT / CBSE curriculum authority.
${STUDYPILOT_MASTER_TUTOR_PROMPT}
State the direct final answer and core formula first in the very first step. Solve step-by-step with clear LaTeX typesetting and zero hallucinations. Always return valid JSON matching the exact schema.`,
          responseMimeType: 'application/json',
          responseSchema: formulaSolutionSchema,
          temperature: 0.2,
        },
      });

      const parsedData: FormulaSolverResponse = safeJsonParse(response.text);

      res.json({
        success: true,
        data: parsedData,
        remainingQuota: req.remainingQuota,
        tier: req.userTier,
      });
    } catch (error: any) {
      console.error('[FORMULA SOLVER ERROR]:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to analyze and solve formula.',
      });
    }
  }
);

/**
 * AI Deep Research Engine Endpoint
 * POST /api/ai/deep-research
 */
aiRouterExtended.post(
  '/deep-research',
  authenticateAndEnforceQuota,
  async (req: AuthenticatedQuotaRequest, res: Response): Promise<void> => {
    try {
      const { query, classLevel, subject, depth, language } = req.body || {};

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Research query is required.',
        });
        return;
      }

      const input: DeepResearchInput = {
        query: query.trim(),
        classLevel: classLevel || '10',
        subject: subject || 'General Science',
        depth: depth || 'deep',
        language: language || 'en',
      };

      const result = await executeDeepResearch(input);

      res.json({
        success: true,
        data: result,
        remainingQuota: req.remainingQuota,
        tier: req.userTier,
      });
    } catch (error: any) {
      console.error('[DEEP RESEARCH API ERROR]:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to complete AI deep research.',
      });
    }
  }
);

