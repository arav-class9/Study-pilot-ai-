import { Router, Request, Response } from 'express';
import { requireAuth } from './middleware.js';
import { solveDoubt } from './services/doubtSolver.js';
import { generateQuiz } from './services/quizGenerator.js';
import { generateNotes } from './services/notesGenerator.js';
import { generateWeaknessRecoveryPlan } from './services/weaknessRecovery.js';
import { generateStudyPlan } from './services/studyPlanner.js';
import { analyzeMistake } from './services/mistakeAnalysis.js';
import { generateExamPaper } from './services/examGenerator.js';
import { checkHandwrittenSolution } from './services/handwrittenChecker.js';
import { generateStudyRecommendation } from './services/recommendationEngine.js';
import { runAIEvaluationBenchmark } from './services/aiEvaluation.js';
import { searchCurriculumAndNotes } from './services/searchService.js';
import { chatWithNotes } from './services/notesChat.js';
import { generateChapterMindmap } from './services/mindmapService.js';
import { conductVivaVoiceTurn } from './services/vivaVoiceService.js';
import { evaluateFeynmanExplanation } from './services/feynmanService.js';
import { generateNCERTPageQuiz, NCERTPageQuizValidationError } from './services/ncertPageQuizService.js';
import { fetchOrGenerateNCERTPageContent } from './services/ncertPageContentService.js';
import { processUploadedBookPage, NCERTOcrValidationError } from './services/ncertPageOcrService.js';
import { processNCERTSelectionAction } from './services/ncertSelectionActions.js';
import { generateFullBookTest } from './services/ncertFullBookTestService.js';

export const apiRouter = Router();
apiRouter.use(requireAuth);

// Notes Chat (Chat with your Notes)
apiRouter.post('/notes-chat', async (req: Request, res: Response) => {
  try {
    const { question, notesContent, chapterName, subject, classLevel } = req.body;
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Question is required.' });
    }
    if (!notesContent || typeof notesContent !== 'string' || notesContent.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Notes content is required to ask questions.' });
    }

    const result = await chatWithNotes({
      question: question.trim(),
      notesContent: notesContent.trim(),
      chapterName: chapterName || 'Chapter Notes',
      subject: subject || 'Science',
      classLevel: classLevel || '10',
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /notes-chat error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to chat with notes' });
  }
});

// 1. Solve Doubt (Text or Image Multimodal + Verification)
apiRouter.post('/doubt', async (req: Request, res: Response) => {
  try {
    const { questionText, imageBase64, imageMimeType, subject, classLevel, chapter } = req.body;
    const hasText = Boolean(questionText && String(questionText).trim().length > 0);
    const hasImage = Boolean(imageBase64 && String(imageBase64).trim().length > 0);

    if (!hasText && !hasImage) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either a question description or an image of the academic problem.',
      });
    }

    const result = await solveDoubt({
      questionText: hasText ? String(questionText).trim() : undefined,
      imageBase64: hasImage ? String(imageBase64).trim() : undefined,
      imageMimeType: imageMimeType || 'image/jpeg',
      subject: subject || 'Science',
      classLevel: String(classLevel || '10'),
      chapter,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /doubt error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to solve doubt' });
  }
});

// 2. Adaptive Quiz Generator
apiRouter.post('/quiz', async (req: Request, res: Response) => {
  try {
    const { subject, classLevel, chapter, topic, difficulty, count, weakConcepts } = req.body;
    const safeCount = Math.max(3, Math.min(20, Number(count) || 5));
    const safeDifficulty = ['easy', 'medium', 'hard', 'challenge'].includes(difficulty)
      ? difficulty
      : 'medium';

    const result = await generateQuiz({
      subject: subject || 'Science',
      classLevel: String(classLevel || '10'),
      chapter,
      topic,
      difficulty: safeDifficulty,
      count: safeCount,
      weakConcepts: Array.isArray(weakConcepts) ? weakConcepts : undefined,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /quiz error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate quiz' });
  }
});

// 3. Master Notes Generator
apiRouter.post('/notes', async (req: Request, res: Response) => {
  try {
    const { subject, classLevel, chapter, topic, detailLevel } = req.body;
    if (!chapter || String(chapter).trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Chapter name is required to generate notes.' });
    }

    const safeDetailLevel = ['short', 'medium', 'detailed', 'exam_revision'].includes(detailLevel)
      ? detailLevel
      : 'medium';

    const result = await generateNotes({
      subject: subject || 'Science',
      classLevel: String(classLevel || '10'),
      chapter: String(chapter).trim(),
      topic,
      detailLevel: safeDetailLevel,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /notes error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate notes' });
  }
});

// 4. AI Weakness Radar & 20-min Recovery Plan
apiRouter.post('/weakness-plan', async (req: Request, res: Response) => {
  try {
    const { topicName, subjectName, classLevel, accuracy, recentMistakes } = req.body;
    if (!topicName || String(topicName).trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Topic name is required for weakness recovery.' });
    }

    const result = await generateWeaknessRecoveryPlan({
      topicName: String(topicName).trim(),
      subjectName: subjectName || 'Science',
      classLevel: String(classLevel || '10'),
      accuracy: Number(accuracy) || 45,
      recentMistakes: Array.isArray(recentMistakes) ? recentMistakes : undefined,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /weakness-plan error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create recovery plan' });
  }
});

// 5. AI Study Planner Timetable
apiRouter.post('/study-plan', async (req: Request, res: Response) => {
  try {
    const { classLevel, dailyStudyMinutes, subjects, weakTopics, examDate, preferredTimeOfDay } = req.body;
    const safeMinutes = Math.max(30, Math.min(600, Number(dailyStudyMinutes) || 120));

    const result = await generateStudyPlan({
      classLevel: String(classLevel || '10'),
      dailyStudyMinutes: safeMinutes,
      subjects: Array.isArray(subjects) && subjects.length > 0 ? subjects : ['Mathematics', 'Science'],
      weakTopics: Array.isArray(weakTopics) ? weakTopics : undefined,
      examDate,
      preferredTimeOfDay,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /study-plan error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate study plan' });
  }
});

// 6. Mistake Analysis & Classification
apiRouter.post('/mistake-analysis', async (req: Request, res: Response) => {
  try {
    const { questionText, studentAnswer, correctAnswer, subject, classLevel, chapter } = req.body;
    if (!questionText || !studentAnswer || !correctAnswer) {
      return res.status(400).json({
        success: false,
        error: 'Question text, student answer, and correct answer are all required.',
      });
    }

    const result = await analyzeMistake({
      questionText: String(questionText).trim(),
      studentAnswer: String(studentAnswer).trim(),
      correctAnswer: String(correctAnswer).trim(),
      subject: subject || 'Science',
      classLevel: String(classLevel || '10'),
      chapter,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /mistake-analysis error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to analyze mistake' });
  }
});

// 7. Full Mock Test & Exam Paper Generator
apiRouter.post('/exam', async (req: Request, res: Response) => {
  try {
    const { subject, classLevel, board, examType, chapters, durationMinutes, questionCount, difficulty } = req.body;
    const safeCount = Math.max(3, Math.min(50, Number(questionCount) || 10));
    const safeDuration = Math.max(10, Math.min(180, Number(durationMinutes) || 30));

    const result = await generateExamPaper({
      subject: subject || 'Science',
      classLevel: String(classLevel || '10'),
      board: board || 'CBSE',
      examType: examType || 'board_practice',
      chapters: Array.isArray(chapters) && chapters.length > 0 ? chapters : ['Core Curriculum'],
      durationMinutes: safeDuration,
      questionCount: safeCount,
      difficulty: difficulty || 'medium',
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /exam error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate exam' });
  }
});

// 8. Handwritten Solution Checker
apiRouter.post('/handwriting', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, problemStatement, subject, classLevel } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string' || imageBase64.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Handwritten solution image is required' });
    }
    const result = await checkHandwrittenSolution({
      imageBase64: imageBase64.trim(),
      mimeType: mimeType || 'image/jpeg',
      problemStatement,
      subject,
      classLevel,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /handwriting error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to check handwriting' });
  }
});

// 9. Personalized Recommendation Engine
apiRouter.post('/recommendation', async (req: Request, res: Response) => {
  try {
    const { weakTopics, dueRevisionCount, daysToExam, availableMinutes, classLevel, board } = req.body;
    const result = await generateStudyRecommendation({
      weakTopics: Array.isArray(weakTopics) ? weakTopics : [],
      dueRevisionCount: Number(dueRevisionCount) || 0,
      daysToExam: Number(daysToExam) || 30,
      availableMinutes: Number(availableMinutes) || 45,
      classLevel: String(classLevel || '10'),
      board: board || 'CBSE',
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /recommendation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate recommendation' });
  }
});

// 10. AI Quality Evaluation Benchmark Telemetry
apiRouter.get('/benchmark', async (req: Request, res: Response) => {
  try {
    const result = await runAIEvaluationBenchmark();
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /benchmark error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to run benchmark' });
  }
});

// 11. Global Search Endpoint (Curriculum, Notes, Questions)
apiRouter.all('/search', async (req: Request, res: Response) => {
  try {
    const query = ((req.method === 'POST' ? req.body.query : req.query.q) as string) || '';
    const classLevel = (req.method === 'POST' ? req.body.classLevel : req.query.classLevel) as string;
    const notes = req.method === 'POST' ? req.body.notes : undefined;

    const results = await searchCurriculumAndNotes({ query, classLevel, notes });
    res.json({ success: true, data: results });
  } catch (error: any) {
    console.error('API /search error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to perform search' });
  }
});

// 12. AI Chapter Mindmap Generator
apiRouter.post('/mindmap', async (req: Request, res: Response) => {
  try {
    const { chapterName, subject, classLevel } = req.body;
    if (!chapterName || String(chapterName).trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Chapter name is required to generate a mindmap.' });
    }
    const result = await generateChapterMindmap({
      chapterName: String(chapterName).trim(),
      subject: subject || 'Science',
      classLevel: classLevel || '10',
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /mindmap error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate mindmap' });
  }
});

// 13. AI Oral Viva Voce Simulator Turn
apiRouter.post('/viva-voice', async (req: Request, res: Response) => {
  try {
    const { chapterName, subject, studentAnswer, questionNumber } = req.body;
    const result = await conductVivaVoiceTurn({
      chapterName: chapterName || 'NCERT Chapter',
      subject: subject || 'Science',
      studentAnswer: studentAnswer || 'No answer provided',
      questionNumber: Number(questionNumber) || 1,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /viva-voice error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to process viva voice turn' });
  }
});

// 14. AI Feynman Technique Explainer
apiRouter.post('/feynman-explain', async (req: Request, res: Response) => {
  try {
    const { topic, subject, studentExplanation } = req.body;
    if (!topic || !studentExplanation) {
      return res.status(400).json({
        success: false,
        error: 'Topic and your student explanation are both required for Feynman evaluation.',
      });
    }
    const result = await evaluateFeynmanExplanation({
      topic: String(topic).trim(),
      subject: subject || 'Science',
      studentExplanation: String(studentExplanation).trim(),
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /feynman-explain error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to evaluate Feynman explanation' });
  }
});

// 15. NCERT Page Quiz Generator (generates interactive MCQs strictly from page text)
apiRouter.post('/ncert-page-quiz', async (req: Request, res: Response) => {
  try {
    const {
      bookId,
      chapterId,
      chapterName,
      subject,
      classLevel,
      pageNumber,
      questionCount,
      count,
      mode,
      difficulty,
      pageContent,
    } = req.body;

    // 1. Boundary validation on pageNumber
    if (pageNumber === undefined || pageNumber === null || pageNumber === '') {
      return res.status(400).json({
        success: false,
        code: 'INVALID_REQUEST',
        message: 'pageNumber is required and must be a positive integer.',
      });
    }

    const parsedPageNumber = Number(pageNumber);
    if (!Number.isInteger(parsedPageNumber) || parsedPageNumber <= 0 || isNaN(parsedPageNumber)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_REQUEST',
        message: 'pageNumber must be a positive integer greater than zero.',
      });
    }

    // 2. Normalize question count
    const rawCount = questionCount !== undefined ? questionCount : count;
    let targetCount = 5;
    if (rawCount !== undefined && rawCount !== null) {
      const parsedCount = Number(rawCount);
      if (isNaN(parsedCount) || !Number.isInteger(parsedCount) || parsedCount <= 0) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_REQUEST',
          message: 'questionCount must be a positive integer.',
        });
      }
      targetCount = parsedCount;
    }

    // 3. Normalize mode and difficulty
    const normalizedMode = mode === 'adaptive' || difficulty === 'adaptive' ? 'adaptive' : 'standard';
    const normalizedDifficulty = difficulty || (normalizedMode === 'adaptive' ? 'adaptive' : 'medium');

    console.log(`[NCERT QUIZ] request payload: page=${parsedPageNumber}, count=${targetCount}, mode=${normalizedMode}, chapter=${chapterName || chapterId || 'unspecified'}`);

    const questions = await generateNCERTPageQuiz({
      bookId: bookId ? String(bookId).trim() : undefined,
      chapterId: chapterId ? String(chapterId).trim() : undefined,
      chapterName: chapterName ? String(chapterName).trim() : 'NCERT Chapter',
      subject: subject ? String(subject).trim() : 'Science',
      classLevel: String(classLevel || '10'),
      pageNumber: parsedPageNumber,
      questionCount: targetCount,
      count: targetCount,
      mode: normalizedMode,
      difficulty: normalizedDifficulty,
      pageContent: typeof pageContent === 'string' && pageContent.trim().length > 0 ? pageContent.trim() : undefined,
    });

    res.json({ success: true, data: questions });
  } catch (error: any) {
    console.error('[NCERT QUIZ] API /ncert-page-quiz error:', error);
    const code = error.code || (error instanceof NCERTPageQuizValidationError ? error.code : 'INTERNAL_ERROR');
    let statusCode = error.statusCode;
    if (!statusCode) {
      if (code === 'PAGE_CONTENT_NOT_FOUND') statusCode = 404;
      else if (code === 'EMPTY_PAGE_CONTENT') statusCode = 422;
      else if (code === 'INVALID_REQUEST') statusCode = 400;
      else if (error instanceof NCERTPageQuizValidationError) statusCode = error.statusCode;
      else statusCode = 500;
    }
    const message = error.message || 'Failed to generate NCERT page quiz from the provided content.';

    res.status(statusCode).json({
      success: false,
      code,
      message,
      error: message,
    });
  }
});

// 16. NCERT Page Content Fetcher/Generator
apiRouter.post('/ncert-page-content', async (req: Request, res: Response) => {
  try {
    const { classLevel, subject, chapterName, pageNumber } = req.body;
    if (!chapterName) {
      return res.status(400).json({ success: false, error: 'chapterName is required.' });
    }

    const content = await fetchOrGenerateNCERTPageContent({
      classLevel: String(classLevel || '10'),
      subject: subject || 'Science',
      chapterName: String(chapterName).trim(),
      pageNumber: Number(pageNumber) || 1,
    });
    res.json({ success: true, data: content });
  } catch (error: any) {
    console.error('API /ncert-page-content error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch NCERT page content' });
  }
});

// 17. NCERT Uploaded Book Page OCR & Analyzer
apiRouter.post('/ncert-page-ocr', async (req: Request, res: Response) => {
  try {
    const { image, text, classLevel, subject, chapterHint } = req.body;
    const hasImage = Boolean(image && String(image).trim().length > 0);
    const hasText = Boolean(text && String(text).trim().length > 0);

    if (!hasImage && !hasText) {
      return res.status(400).json({
        success: false,
        error: 'Either an image photo or text excerpt must be provided.',
      });
    }

    const result = await processUploadedBookPage({
      image: hasImage ? String(image).trim() : undefined,
      text: hasText ? String(text).trim() : undefined,
      classLevel,
      subject,
      chapterHint,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /ncert-page-ocr error:', error);
    const statusCode = error instanceof NCERTOcrValidationError ? error.statusCode : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to process uploaded NCERT textbook page.',
    });
  }
});

// 18. NCERT Text Selection Actions (Notes, Explanations, Strict Quizzes from Selected Excerpt)
apiRouter.post('/ncert-selection-actions', async (req: Request, res: Response) => {
  try {
    const { actionType, selectedText, pageNumber, chapterName, subject, classLevel } = req.body;

    if (!selectedText || typeof selectedText !== 'string' || selectedText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'selectedText is required to perform action.',
      });
    }

    if (!['notes', 'explain', 'quiz'].includes(actionType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid actionType. Supported values: "notes", "explain", "quiz".',
      });
    }

    const result = await processNCERTSelectionAction({
      actionType,
      selectedText: selectedText.trim(),
      pageNumber: Number(pageNumber) || 1,
      chapterName: chapterName || 'NCERT Chapter',
      subject: subject || 'Science',
      classLevel: String(classLevel || '10'),
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /ncert-selection-actions error:', error);
    const statusCode = error instanceof NCERTPageQuizValidationError ? error.statusCode : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to process selected textbook content.',
    });
  }
});

// 19. NCERT Full Book & Multi-Chapter Comprehensive Mock Test
apiRouter.post('/ncert-fullbook-test', async (req: Request, res: Response) => {
  try {
    const { bookTitle, classLevel, subject, pages, questionCount } = req.body;

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'pages array with textbook excerpts is required to generate test.',
      });
    }

    const result = await generateFullBookTest({
      bookTitle: bookTitle || 'NCERT Textbook',
      classLevel: String(classLevel || '10'),
      subject: subject || 'Science',
      pages,
      questionCount: Number(questionCount) || 10,
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /ncert-fullbook-test error:', error);
    const statusCode = error instanceof NCERTPageQuizValidationError ? error.statusCode : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to generate comprehensive NCERT test.',
    });
  }
});

