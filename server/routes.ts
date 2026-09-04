import { Router } from 'express';
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

export const apiRouter = Router();
apiRouter.use(requireAuth);

// Notes Chat (Chat with your Notes)
apiRouter.post('/notes-chat', async (req, res) => {
  try {
    const { question, notesContent, chapterName, subject, classLevel } = req.body;
    const result = await chatWithNotes({
      question,
      notesContent,
      chapterName: chapterName || 'Chapter Notes',
      subject: subject || 'Science',
      classLevel,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /notes-chat error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to chat with notes' });
  }
});

// 1. Solve Doubt (Text or Image Multimodal + Verification)
apiRouter.post('/doubt', async (req, res) => {
  try {
    const { questionText, imageBase64, imageMimeType, subject, classLevel, chapter } = req.body;
    const result = await solveDoubt({
      questionText,
      imageBase64,
      imageMimeType,
      subject,
      classLevel,
      chapter,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /doubt error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to solve doubt' });
  }
});

// 2. Adaptive Quiz Generator
apiRouter.post('/quiz', async (req, res) => {
  try {
    const { subject, classLevel, chapter, topic, difficulty, count, weakConcepts } = req.body;
    const result = await generateQuiz({
      subject: subject || 'Science',
      classLevel: classLevel || '9',
      chapter,
      topic,
      difficulty: difficulty || 'medium',
      count: Number(count) || 5,
      weakConcepts,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /quiz error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate quiz' });
  }
});

// 3. Master Notes Generator
apiRouter.post('/notes', async (req, res) => {
  try {
    const { subject, classLevel, chapter, topic, detailLevel } = req.body;
    const result = await generateNotes({
      subject: subject || 'Science',
      classLevel: classLevel || '9',
      chapter: chapter || 'Overview',
      topic,
      detailLevel: detailLevel || 'medium',
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /notes error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate notes' });
  }
});

// 4. AI Weakness Radar & 20-min Recovery Plan
apiRouter.post('/weakness-plan', async (req, res) => {
  try {
    const { topicName, subjectName, classLevel, accuracy, recentMistakes } = req.body;
    const result = await generateWeaknessRecoveryPlan({
      topicName: topicName || 'Work and Energy',
      subjectName: subjectName || 'Science',
      classLevel: classLevel || '9',
      accuracy: Number(accuracy) || 45,
      recentMistakes,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /weakness-plan error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create recovery plan' });
  }
});

// 5. AI Study Planner Timetable
apiRouter.post('/study-plan', async (req, res) => {
  try {
    const { classLevel, dailyStudyMinutes, subjects, weakTopics, examDate, preferredTimeOfDay } = req.body;
    const result = await generateStudyPlan({
      classLevel: classLevel || '9',
      dailyStudyMinutes: Number(dailyStudyMinutes) || 120,
      subjects: subjects || ['Mathematics', 'Science'],
      weakTopics,
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
apiRouter.post('/mistake-analysis', async (req, res) => {
  try {
    const { questionText, studentAnswer, correctAnswer, subject, classLevel, chapter } = req.body;
    const result = await analyzeMistake({
      questionText,
      studentAnswer,
      correctAnswer,
      subject,
      classLevel,
      chapter,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /mistake-analysis error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to analyze mistake' });
  }
});

// 7. Full Mock Test & Exam Paper Generator
apiRouter.post('/exam', async (req, res) => {
  try {
    const { subject, classLevel, board, examType, chapters, durationMinutes, questionCount, difficulty } = req.body;
    const result = await generateExamPaper({
      subject: subject || 'Science',
      classLevel: classLevel || '9',
      board: board || 'CBSE',
      examType: examType || 'board_practice',
      chapters: chapters || ['Electricity', 'Light'],
      durationMinutes: Number(durationMinutes) || 30,
      questionCount: Number(questionCount) || 10,
      difficulty: difficulty || 'medium',
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /exam error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate exam' });
  }
});

// 8. Handwritten Solution Checker
apiRouter.post('/handwriting', async (req, res) => {
  try {
    const { imageBase64, mimeType, problemStatement, subject, classLevel } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Image is required' });
    }
    const result = await checkHandwrittenSolution({
      imageBase64,
      mimeType,
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
apiRouter.post('/recommendation', async (req, res) => {
  try {
    const { weakTopics, dueRevisionCount, daysToExam, availableMinutes, classLevel, board } = req.body;
    const result = await generateStudyRecommendation({
      weakTopics,
      dueRevisionCount: Number(dueRevisionCount) || 0,
      daysToExam: Number(daysToExam) || 30,
      availableMinutes: Number(availableMinutes) || 45,
      classLevel: classLevel || '9',
      board: board || 'CBSE',
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /recommendation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate recommendation' });
  }
});

// 10. AI Quality Evaluation Benchmark Telemetry
apiRouter.get('/benchmark', async (req, res) => {
  try {
    const result = await runAIEvaluationBenchmark();
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /benchmark error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to run benchmark' });
  }
});

// 11. Global Search Endpoint (Curriculum, Notes, Questions)
apiRouter.all('/search', async (req, res) => {
  try {
    const query = (req.method === 'POST' ? req.body.query : req.query.q) as string || '';
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
apiRouter.post('/mindmap', async (req, res) => {
  try {
    const { chapterName, subject, classLevel } = req.body;
    const result = await generateChapterMindmap({
      chapterName: chapterName || 'Sample Chapter',
      subject: subject || 'Science',
      classLevel,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /mindmap error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate mindmap' });
  }
});

// 13. AI Oral Viva Voce Simulator Turn
apiRouter.post('/viva-voice', async (req, res) => {
  try {
    const { chapterName, subject, studentAnswer, questionNumber } = req.body;
    const result = await conductVivaVoiceTurn({
      chapterName: chapterName || 'Sample Chapter',
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
apiRouter.post('/feynman-explain', async (req, res) => {
  try {
    const { topic, subject, studentExplanation } = req.body;
    const result = await evaluateFeynmanExplanation({
      topic: topic || 'General Concept',
      subject: subject || 'Science',
      studentExplanation: studentExplanation || '',
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API /feynman-explain error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to evaluate Feynman explanation' });
  }
});

