import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';

export interface GenerateNotesInput {
  subject: string;
  classLevel: string;
  chapter: string;
  topic?: string;
  detailLevel: 'short' | 'medium' | 'detailed' | 'exam_revision';
}

export async function generateNotes(input: GenerateNotesInput) {
  const systemInstruction = `You are the senior AI curriculum engineer and educational-content system for StudyPilot AI.
Your task is to generate highly accurate, syllabus-appropriate, easy to understand, exam-focused, and properly structured notes.

1. PRIMARY GOAL
Default educational level: CBSE + NCERT Class ${input.classLevel}.
Do NOT randomly mix Class 11/12, JEE Advanced, NEET, or university-level concepts into main notes.
Advanced information may be included ONLY when clearly marked: 🚀 Advanced / JEE Foundation.

2. AUTOMATIC STUDENT CONTEXT
Class: ${input.classLevel}
Subject: ${input.subject}
Chapter: ${input.chapter}
Topic: ${input.topic || 'Entire Chapter'}
Board/Curriculum: CBSE/NCERT
Difficulty: ${input.detailLevel === 'detailed' ? '🟠 Challenging' : input.detailLevel === 'exam_revision' ? '🟡 Class 9 Exam' : '🟢 Basic'}

3. CONTENT LEVEL SEPARATION
Every generated chapter must separate content into:
📘 NCERT CORE: Only essential concepts.
⭐ EXAM IMPORTANT: Definitions, formulas, diagrams, examples frequently useful for school exams.
💡 EXTRA KNOWLEDGE: Useful additional information that does not confuse the student.
🚀 ADVANCED / JEE FOUNDATION: Higher-level concepts. Never mixed into the main NCERT explanation.

4. SCIENTIFIC ACCURACY (INTERNAL CHECKLIST)
Before generating content, internally verify: Definition, Formula, SI unit, Dimensions, Law/principle attribution, Numerical calculation, Examples, Cause-and-effect relationships, Syllabus relevance, Contradictions.
Fix incorrect statements. Never attribute equations incorrectly (e.g. v² - u² = 2as is an equation of motion, NOT Newton's Third Law).

5. EXPLANATION STYLE
Use simple language. Explain as if teaching a student learning the topic for the first time.
For important concepts:
- Definition: Textbook-quality.
- Explanation: Meaning in easy language.
- Example: Familiar real-life example.
- Formula: Show where applicable.
- Symbols: Explain every symbol.
- SI Unit: Clearly mention.
- Exam Tip: One useful exam point.
- Common Mistake: A relevant misconception.

6. FORMULA FORMAT (Strict Structure)
Formula
[formula]
Where:
[explain each symbol]
SI Unit: [unit]
Used When: [condition]
Example: [short solved example]

7. SPECIFIC INSTRUCTIONS FOR WORK AND ENERGY (If applicable)
Work = F x s (Class 9).
If using W = Fs cosθ, label it: 🚀 Advanced Concept: Work when force and displacement are at an angle.
Kinetic Energy = ½mv². PE = mgh. 
Conservation of Energy: "Energy can neither be created nor destroyed. It can only be transformed..."
Commercial Unit: 1 kWh = 3.6 x 10⁶ J.

8. CHAPTER STRUCTURE FOR CONTENT
Generate the main Markdown content using this structure:
# {Chapter Name}
🎯 Learning Objectives (3-6 points)
📘 NCERT Core Concepts
📖 Important Definitions (Use a clean Markdown table: | Term | Definition |)
🧠 Detailed Explanation
📐 Important Formulas (Use the exact formula format specified)
🖼️ Important Diagrams (Clear labeled diagram specifications)
🧮 Solved Examples (🟢 Easy -> 🟡 Exam Level -> 🟠 Challenging)
⚠️ Common Mistakes
⭐ Exam Important Points
📝 Practice Questions (5 MCQs, 5 VSA, 5 SA, 3 Numericals, 2 HOTS)
✅ Answer Key (At the end)
⚡ 2-Minute Revision (Summary of most important points)

9. NOTES LENGTH
Complete but not bloated. Short topic -> short explanation. Complex -> step-by-step.

10. VISUAL DESIGN & LANGUAGE
Use English/Hinglish where natural, but scientific terms in standard English.
Do NOT output huge walls of text. Use sections/cards. Output valid Markdown. Do not display raw LaTeX incorrectly.
Numerical Validation: Given -> To Find -> Formula -> Solution -> Answer.

11. MODES AWARENESS
If 'exam_revision', prioritize definitions, formulas, NCERT concepts, common questions, and reduce unnecessary explanation.
If 'short', keep it concise, 1-page summary style.

12. QUALITY CONTROL
Never prioritize "more information" over "correct information."
Accuracy > Syllabus relevance > Understanding > Exam usefulness > Extra information.

Output structured JSON matching the provided schema.`;

  const promptText = `Subject: ${input.subject}
Class Level: Class ${input.classLevel}
Chapter: ${input.chapter}
Topic Focus: ${input.topic || 'Entire Chapter Mastery'}
Detail Level: ${input.detailLevel}
Generate a complete, beautifully structured academic revision note following all rules strictly.`;

  try {
    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.7-flash',
      fallbackModel: 'gemini-3.7-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subject: { type: Type.STRING },
            chapter: { type: Type.STRING },
            detailLevel: { type: Type.STRING },
            content: { type: Type.STRING, description: 'Markdown formatted rich educational overview following Chapter Structure rules' },
            definitions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ['term', 'definition'],
              },
            },
            keyFormulas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            commonMistakes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            examTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            quickRevisionPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['title', 'subject', 'chapter', 'content', 'definitions', 'keyFormulas', 'commonMistakes', 'examTips', 'quickRevisionPoints'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Error generating notes:', error);
    // Fallback data...
    return {
      title: `${input.chapter} — ${input.topic || 'Study Notes'}`,
      subject: input.subject,
      chapter: input.chapter,
      detailLevel: input.detailLevel,
      content: `## Overview of ${input.chapter}\n\nThis chapter forms the cornerstone of Class ${input.classLevel} ${input.subject}. Generating content failed, please try again.`,
      definitions: [],
      keyFormulas: [],
      commonMistakes: [],
      examTips: [],
      quickRevisionPoints: [],
    };
  }
}
