import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';

export interface MindmapInput {
  chapterName: string;
  subject: string;
  classLevel?: string;
}

export interface MindmapNode {
  id: string;
  label: string;
  description: string;
  category: 'core' | 'formula' | 'example' | 'trap';
  children?: string[]; // IDs of connected child nodes
}

export interface MindmapData {
  centralTopic: string;
  subject: string;
  summary: string;
  nodes: MindmapNode[];
}

export async function generateChapterMindmap(input: MindmapInput): Promise<MindmapData> {
  const systemInstruction = `You are StudyPilot AI, an expert CBSE/NCERT and K-12 academic curriculum designer.
Generate a detailed hierarchical concept mindmap for Chapter: "${input.chapterName}" (${input.subject}, Class ${input.classLevel || '10'}).
Return a JSON response with:
1. "centralTopic": The main chapter name.
2. "subject": The subject name.
3. "summary": A 2-sentence overview of the chapter's core weightage in board exams.
4. "nodes": An array of 6 to 9 rich concept nodes. Each node must have:
   - "id": string (e.g., "node-1")
   - "label": string (short punchy title)
   - "description": string (clear explanation with formula or key NCERT point)
   - "category": 'core' | 'formula' | 'example' | 'trap'
   - "children": array of connected node IDs (optional)`;

  const promptText = `Generate the concept mindmap JSON for Chapter: "${input.chapterName}" in ${input.subject}.`;

  try {
    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            centralTopic: { type: Type.STRING },
            subject: { type: Type.STRING },
            summary: { type: Type.STRING },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  children: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['id', 'label', 'description', 'category'],
              },
            },
          },
          required: ['centralTopic', 'subject', 'summary', 'nodes'],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error('Mindmap generation error:', error);
    return {
      centralTopic: input.chapterName,
      subject: input.subject,
      summary: `Master the essential concepts of ${input.chapterName} for your board examinations with high-yield study notes and problem-solving techniques.`,
      nodes: [
        {
          id: 'n1',
          label: 'Core Definition & Principles',
          description: `Fundamental laws and definitions governing ${input.chapterName}.`,
          category: 'core',
        },
        {
          id: 'n2',
          label: 'Key Formulas & Theorems',
          description: 'Essential mathematical and scientific relations required for numericals.',
          category: 'formula',
        },
        {
          id: 'n3',
          label: 'Important Board Examples',
          description: 'Frequently repeated NCERT and previous year board questions.',
          category: 'example',
        },
        {
          id: 'n4',
          label: 'Common Exam Traps',
          description: 'Watch out for sign conventions, unit conversions, and trick questions.',
          category: 'trap',
        },
      ],
    };
  }
}
