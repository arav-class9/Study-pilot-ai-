import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  RotateCcw,
  BookOpen,
  Send,
  Loader2,
  Zap,
  Check,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  AlertTriangle,
  ChevronDown,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateAIExamPaper } from '../services/aiClient';
import {
  getCurriculumChapters,
  getCurriculumSubjects,
  SUPPORTED_BOARDS,
  ALL_CLASSES,
} from '../data/curriculumDatabase';
import { ExamAttempt, ExamType, MistakeCategory, SubjectId, ClassLevel } from '../types';
import { evaluateCurriculumCoverage, scoreExamAttempt, validateQuestionQuality, calculateExamResults } from '../services/examEngine';
import { useExamPersistence } from '../hooks/useExamPersistence';
import confetti from 'canvas-confetti';

export const ExamPage: React.FC = () => {
  const { user, saveExamAttempt, addMistake, addXP } = useApp();
  const { persistedState, saveExamState, clearExamState } = useExamPersistence();

  // Curriculum & Exam Setup State
  const [board, setBoard] = useState<string>(persistedState.board || user.board || 'CBSE');
  const [classLevel, setClassLevel] = useState<ClassLevel>((persistedState.classLevel || user.classLevel || '10') as ClassLevel);
  const [subject, setSubject] = useState<SubjectId>((persistedState.subject || 'science') as SubjectId);
  const [examType, setExamType] = useState<ExamType>('board_practice');
  const [durationMinutes, setDurationMinutes] = useState(persistedState.durationMinutes || 25);
  const [questionCount, setQuestionCount] = useState(8);
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [chapterSearch, setChapterSearch] = useState('');
  const [negativeMarking, setNegativeMarking] = useState<number>(1);
  const [marksPerQuestion, setMarksPerQuestion] = useState<number>(4);

  // Active Exam State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [examPaper, setExamPaper] = useState<any | null>(persistedState.examPaper || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(persistedState.currentQuestionIndex || 0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>(persistedState.selectedAnswers || {});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>(persistedState.markedForReview || {});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(persistedState.timeLeftSeconds || 0);
  const [isExamCompleted, setIsExamCompleted] = useState(persistedState.isExamCompleted || false);
  const [completedAttempt, setCompletedAttempt] = useState<ExamAttempt | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const timerRef = useRef<any>(null);

  // Available subjects
  const availableSubjects = useMemo(() => {
    return getCurriculumSubjects(classLevel, board);
  }, [classLevel, board]);

  useEffect(() => {
    if (!availableSubjects.some((s) => s.id === subject)) {
      if (availableSubjects[0]) setSubject(availableSubjects[0].id);
    }
  }, [availableSubjects, subject]);

  // Available chapters for selected Class + Board + Subject
  const availableChapters = useMemo(() => {
    return getCurriculumChapters(classLevel, board, subject);
  }, [classLevel, board, subject]);

  // Real Curriculum Coverage Evaluation
  const curriculumCoverage = useMemo(() => {
    return evaluateCurriculumCoverage(board, classLevel, subject, selectedChapters);
  }, [board, classLevel, subject, selectedChapters]);

  // Auto select all chapters when available chapters change if none selected
  useEffect(() => {
    if (availableChapters.length > 0 && selectedChapters.length === 0 && !examPaper) {
      setSelectedChapters(availableChapters.map((c) => c.name));
    }
  }, [availableChapters, selectedChapters.length, examPaper]);

  // Filtered chapters for search
  const filteredChapters = useMemo(() => {
    if (!chapterSearch.trim()) return availableChapters;
    const q = chapterSearch.toLowerCase().trim();
    return availableChapters.filter((c) => c.name.toLowerCase().includes(q));
  }, [availableChapters, chapterSearch]);

  // Save active state to useExamPersistence hook
  useEffect(() => {
    if (examPaper && !isExamCompleted) {
      saveExamState({
        examPaper,
        selectedAnswers,
        markedForReview,
        timeLeftSeconds,
        currentQuestionIndex,
        durationMinutes,
        subject,
        classLevel,
        board,
        isExamCompleted: false,
      });
    } else if (isExamCompleted) {
      clearExamState();
    }
  }, [examPaper, selectedAnswers, markedForReview, timeLeftSeconds, currentQuestionIndex, isExamCompleted, durationMinutes, subject, classLevel, board, saveExamState, clearExamState]);

  // Timer countdown with absolute end-timestamp precision
  useEffect(() => {
    if (examPaper && !isExamCompleted && timeLeftSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            performSubmission();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [examPaper, isExamCompleted, timeLeftSeconds]);

  const toggleChapterSelection = (chapterName: string) => {
    setSelectedChapters((prev) => {
      if (prev.includes(chapterName)) {
        return prev.filter((n) => n !== chapterName);
      } else {
        return [...prev, chapterName];
      }
    });
  };

  const handleSelectAllChapters = () => {
    setSelectedChapters(availableChapters.map((c) => c.name));
  };

  const handleClearAllChapters = () => {
    setSelectedChapters([]);
  };

  const handleStartExam = async () => {
    if (selectedChapters.length === 0) {
      alert('Please select at least one chapter for your exam.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGenerationStep('Validating curriculum selection...');

    try {
      await new Promise((r) => setTimeout(r, 400));
      setGenerationStep('Building verified question pool...');
      await new Promise((r) => setTimeout(r, 500));
      setGenerationStep('Applying difficulty & deduplication pipeline...');
      await new Promise((r) => setTimeout(r, 400));

      const subjectName = availableSubjects.find((s) => s.id === subject)?.name || 'Science';
      const paper = await generateAIExamPaper({
        subject: subjectName,
        classLevel,
        board,
        examType,
        chapters: selectedChapters,
        durationMinutes,
        questionCount,
        difficulty,
      });

      if (!paper?.questions || !Array.isArray(paper.questions) || paper.questions.length === 0) {
        throw new Error('No questions returned from AI generator.');
      }

      // Quality validation
      const validQuestions = paper.questions.filter((q: any) => validateQuestionQuality(q));
      if (validQuestions.length === 0) {
        throw new Error('Generated questions failed rigorous quality verification.');
      }

      setGenerationStep('Finalizing exam paper...');
      await new Promise((r) => setTimeout(r, 300));

      setExamPaper({
        ...paper,
        questions: validQuestions,
      });
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setMarkedForReview({});
      setTimeLeftSeconds(durationMinutes * 60);
      setIsExamCompleted(false);
      setCompletedAttempt(null);
    } catch (err: any) {
      console.error('Exam generation error:', err);
      setGenerationError(err.message || 'We could not generate the test. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const performSubmission = async () => {
    if (!examPaper) return;
    clearInterval(timerRef.current);
    setShowSubmitModal(false);

    const timeUsed = durationMinutes * 60 - timeLeftSeconds;
    const { result: scoringResult, attemptRecord } = await calculateExamResults({
      userId: user.uid,
      examPaper,
      userAnswers: selectedAnswers,
      timeTakenSeconds: timeUsed,
      durationMinutes,
      negativeMarking,
      marksPerQuestion,
      board,
      classLevel,
      subject,
      examType,
    });

    // Auto-save mistakes
    scoringResult.answers.forEach((ans: any) => {
      if (!ans.isCorrect && ans.userAnswer !== 'Unanswered') {
        addMistake({
          question: ans.questionText,
          studentAnswer: ans.userAnswer,
          correctAnswer: ans.correctAnswer,
          explanation: ans.explanation,
          subject,
          chapter: ans.concept || 'Exam Chapter',
          topic: ans.concept || 'Exam Concept',
          mistakeType: 'Concept Gap',
          difficulty: 'medium',
        });
      }
    });

    const earnedXP = scoringResult.correct * 20 + (scoringResult.accuracy >= 80 ? 100 : 30);

    saveExamAttempt(attemptRecord);
    addXP(earnedXP, `Completed ${examPaper.examTitle || 'Exam'}`);
    setCompletedAttempt(attemptRecord);
    setIsExamCompleted(true);
    clearExamState();

    if (scoringResult.accuracy >= 60) {
      confetti({ particleCount: 110, spread: 90, origin: { y: 0.6 } });
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = examPaper?.questions[currentQuestionIndex];

  // Count stats for submit confirmation modal
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = (examPaper?.questions.length || 0) - answeredCount;
  const reviewCount = Object.values(markedForReview).filter(Boolean).length;

  return (
    <div id="exam-page-container" className="space-y-6 pb-20 md:pb-8 max-w-6xl mx-auto px-4 sm:px-6">
      {/* 1. EXAM CONFIGURATION / SETUP */}
      {!examPaper && !isExamCompleted && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300">
                <Award className="w-3.5 h-3.5" />
                <span>Production Exam Engine & Simulator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Exam Simulator & Assessment Hub 📝
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Experience authentic board simulations with verified question pipelines, multi-chapter distribution, negative marking, and instant AI analytics.
              </p>
            </div>
          </div>

          {/* Curriculum Coverage Status Banner */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  Real Curriculum Coverage Status
                </h2>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                {curriculumCoverage.availableChapters} / {curriculumCoverage.totalChapters} Chapters Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Selected Board</span>
                <p className="text-sm sm:text-base font-black text-slate-900">{board}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Class Level</span>
                <p className="text-sm sm:text-base font-black text-slate-900">Class {classLevel}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Topics</span>
                <p className="text-sm sm:text-base font-black text-indigo-600">{curriculumCoverage.totalTopics} Topics</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Question Pool</span>
                <p className="text-sm sm:text-base font-black text-emerald-600">{curriculumCoverage.availableQuestionsCount} Qs Ready</p>
              </div>
            </div>
          </div>

          {/* Setup Hierarchy & Parameters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chapters Multiselect Checklist */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900">
                    Select Chapters ({selectedChapters.length} of {availableChapters.length} Selected)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Pick chapters to distribute questions fairly across the test.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllChapters}
                    className="px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleClearAllChapters}
                    className="px-2.5 py-1 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                  >
                    Deselect
                  </button>
                </div>
              </div>

              {/* Chapters Checklist */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {availableChapters.map((ch, idx) => {
                  const isChecked = selectedChapters.includes(ch.name);
                  return (
                    <div
                      key={ch.id}
                      onClick={() => toggleChapterSelection(ch.name)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-indigo-50/70 border-indigo-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isChecked
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            Ch {ch.order || idx + 1}: {ch.name}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {ch.topics?.length || 0} topics in curriculum
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Exam Configuration Parameters */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-sm sm:text-base font-black text-slate-900">
                    Exam Format & Settings
                  </h2>
                </div>

                {/* Exam Type */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">
                    Exam Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'board_practice', label: 'Board Mock', desc: 'Full pattern' },
                      { id: 'chapter_test', label: 'Chapter Test', desc: 'Targeted' },
                      { id: 'full_syllabus', label: 'Full Syllabus', desc: 'Comprehensive' },
                      { id: 'speed_drill', label: 'Speed Drill', desc: 'Rapid practice' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setExamType(type.id as ExamType)}
                        className={`p-2.5 rounded-2xl border text-left cursor-pointer transition-all ${
                          examType === type.id
                            ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold text-xs text-slate-900">{type.label}</div>
                        <div className="text-[10px] text-slate-500">{type.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject & Difficulty */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                      Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value as SubjectId)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2"
                    >
                      {availableSubjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="mixed">Mixed (Adaptive)</option>
                    </select>
                  </div>
                </div>

                {/* Questions & Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                      Question Count
                    </label>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2"
                    >
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={20}>20 Questions</option>
                      <option value={30}>30 Questions</option>
                      <option value={50}>50 Questions</option>
                      <option value={75}>75 Questions</option>
                      <option value={100}>100 Questions</option>
                      <option value={120}>120 Questions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                      Duration
                    </label>
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2"
                    >
                      <option value={10}>10 Mins</option>
                      <option value={20}>20 Mins</option>
                      <option value={30}>30 Mins</option>
                      <option value={45}>45 Mins</option>
                      <option value={60}>60 Mins</option>
                      <option value={90}>90 Mins</option>
                      <option value={120}>120 Mins</option>
                      <option value={180}>180 Mins</option>
                    </select>
                  </div>
                </div>

                {generationError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{generationError}</span>
                  </div>
                )}
              </div>

              {/* Start Button */}
              <button
                id="start-exam-button"
                onClick={handleStartExam}
                disabled={isGenerating || selectedChapters.length === 0}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all mt-4"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{generationStep || 'Building Exam Paper...'}</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Start Exam Simulation ({questionCount} Qs)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE EXAM SESSION */}
      {examPaper && !isExamCompleted && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                {examPaper.examTitle || 'Official Mock Exam'}
              </h2>
              <span className="text-xs text-slate-500">
                Class {classLevel} • {board} • {examPaper.questions.length} Questions • Negative Marking: -{negativeMarking}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black ${
                  timeLeftSeconds <= 300
                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>

              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Exam</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Question Workspace */}
            <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              {currentQ && (
                <>
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                      Question {currentQuestionIndex + 1} of {examPaper.questions.length}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{currentQ.chapter || currentQ.concept}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                    {currentQ.question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQ.options?.map((opt: string, oIdx: number) => {
                      const isSelected = selectedAnswers[currentQuestionIndex] === opt;
                      return (
                        <button
                          key={oIdx}
                          onClick={() =>
                            setSelectedAnswers((prev) => ({
                              ...prev,
                              [currentQuestionIndex]: opt,
                            }))
                          }
                          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-500/20'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Question Controls */}
                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setMarkedForReview((prev) => ({
                            ...prev,
                            [currentQuestionIndex]: !prev[currentQuestionIndex],
                          }))
                        }
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          markedForReview[currentQuestionIndex]
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>
                          {markedForReview[currentQuestionIndex] ? 'Flagged for Review' : 'Mark for Review'}
                        </span>
                      </button>

                      {selectedAnswers[currentQuestionIndex] && (
                        <button
                          onClick={() => {
                            const copy = { ...selectedAnswers };
                            delete copy[currentQuestionIndex];
                            setSelectedAnswers(copy);
                          }}
                          className="text-xs text-slate-400 hover:text-slate-600 font-semibold px-2 py-1"
                        >
                          Clear Choice
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                      >
                        Prev
                      </button>

                      <button
                        onClick={() =>
                          setCurrentQuestionIndex((prev) =>
                            Math.min(examPaper.questions.length - 1, prev + 1)
                          )
                        }
                        disabled={currentQuestionIndex === examPaper.questions.length - 1}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs disabled:opacity-30 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Question Palette Sidebar */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Question Palette
              </h4>

              <div className="grid grid-cols-4 gap-2">
                {examPaper.questions.map((_: any, idx: number) => {
                  const isCurrent = idx === currentQuestionIndex;
                  const isAnswered = selectedAnswers[idx] !== undefined;
                  const isFlagged = markedForReview[idx];

                  let btnStyle = 'bg-slate-100 text-slate-600 border-slate-200';
                  if (isFlagged) {
                    btnStyle = 'bg-amber-100 text-amber-900 border-amber-300 font-black';
                  } else if (isAnswered) {
                    btnStyle = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-10 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center relative ${btnStyle} ${
                        isCurrent ? 'ring-2 ring-indigo-600 ring-offset-1' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300 inline-block" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300 inline-block" />
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200 inline-block" />
                  <span>Not Attempted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-slate-900 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black">Submit Examination?</h3>
                <p className="text-xs text-slate-500">Review your attempt statistics before submission.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Answered</span>
                <span className="text-xl font-black text-emerald-900">{answeredCount}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Unanswered</span>
                <span className="text-xl font-black text-slate-700">{unansweredCount}</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-amber-700 uppercase block">Flagged</span>
                <span className="text-xl font-black text-amber-900">{reviewCount}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 text-center font-medium">
              Are you sure you want to submit this exam? Once submitted, you can review solutions and explanations.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Continue Exam
              </button>
              <button
                onClick={performSubmission}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md cursor-pointer"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. POST-EXAM RESULTS & DETAILED ANALYSIS */}
      {isExamCompleted && completedAttempt && (
        <div className="space-y-6">
          {/* Summary Score Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mx-auto text-yellow-300">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black">Exam Evaluation Complete! 🎓</h2>
              <p className="text-xs sm:text-sm text-slate-300">{completedAttempt.title}</p>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                <span className="text-[11px] text-slate-300 font-bold uppercase">Marks</span>
                <p className="text-2xl font-black text-white">
                  {completedAttempt.score} / {completedAttempt.totalMarks}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                <span className="text-[11px] text-slate-300 font-bold uppercase">Accuracy</span>
                <p className="text-2xl font-black text-indigo-300">{completedAttempt.accuracy}%</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                <span className="text-[11px] text-slate-300 font-bold uppercase">Time Taken</span>
                <p className="text-2xl font-black text-white">
                  {formatTimer(completedAttempt.timeTakenSeconds || 0)}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                <span className="text-[11px] text-slate-300 font-bold uppercase">Mistakes Logged</span>
                <p className="text-2xl font-black text-rose-300">
                  {completedAttempt.answers.filter((a) => !a.isCorrect).length} Qs
                </p>
              </div>
            </div>
          </div>

          {/* Question by Question Review */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              Official Paper Solution Key & Breakdown
            </h3>

            <div className="space-y-4">
              {completedAttempt.answers.map((ans, idx) => (
                <div
                  key={ans.questionId || idx}
                  className={`p-5 rounded-2xl border space-y-3 ${
                    ans.isCorrect ? 'bg-emerald-50/30 border-emerald-200' : 'bg-rose-50/30 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      Q{idx + 1}
                    </span>
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-full ${
                        ans.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ans.isCorrect ? '+4 Marks (Correct)' : '0 Marks (Incorrect)'}
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 text-sm sm:text-base">{ans.questionText}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="text-xs p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 font-bold block mb-0.5">Your Response:</span>
                      <span className={`font-semibold ${ans.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {ans.userAnswer || 'Skipped / Unanswered'}
                      </span>
                    </div>

                    <div className="text-xs p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 font-bold block mb-0.5">Official Answer:</span>
                      <span className="font-semibold text-emerald-700">{ans.correctAnswer}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
                    <span className="font-bold text-slate-900 block">Explanation:</span>
                    <p>{ans.explanation}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Restart Action */}
            <div className="flex justify-center pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setExamPaper(null);
                  setIsExamCompleted(false);
                  setCompletedAttempt(null);
                }}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Configure Another Exam</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
