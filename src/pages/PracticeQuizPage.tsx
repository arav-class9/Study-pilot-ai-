import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { generateAIQuiz } from '../services/aiClient';
import {
  getCurriculumChapters,
  getCurriculumSubjects,
  SUPPORTED_BOARDS,
  ALL_CLASSES,
} from '../data/curriculumDatabase';
import { DifficultyLevel, QuizQuestion, SubjectId, ClassLevel, MistakeCategory } from '../types';
import {
  Brain,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Zap,
  Award,
  Loader2,
  AlertTriangle,
  BookOpen,
  Compass,
  Search,
  Filter,
  Flame,
  Check,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export const PracticeQuizPage: React.FC = () => {
  const { user, recordQuizAttempt, checkAndConsumeUsage, addXP, addMistake } = useApp();

  // Curriculum Hierarchy Selection
  const [selectedBoard, setSelectedBoard] = useState<string>(user.board || 'CBSE');
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(user.classLevel || '10');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('science');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quiz Configurations
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [quizMode, setQuizMode] = useState<'practice' | 'timed'>('practice');

  // Active Quiz State
  const [quizState, setQuizState] = useState<'idle' | 'validating' | 'generating' | 'active' | 'completed' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [xpAwarded, setXpAwarded] = useState<number>(0);
  const [mistakesSaved, setMistakesSaved] = useState(false);

  // Available subjects for selected Class & Board
  const availableSubjects = useMemo(() => {
    return getCurriculumSubjects(selectedClass, selectedBoard);
  }, [selectedClass, selectedBoard]);

  // Ensure selectedSubject is valid
  useEffect(() => {
    if (!availableSubjects.some((s) => s.id === selectedSubject)) {
      if (availableSubjects[0]) {
        setSelectedSubject(availableSubjects[0].id);
      }
    }
  }, [availableSubjects, selectedSubject]);

  // Available chapters for selected Class + Board + Subject (No slicing limits!)
  const availableChapters = useMemo(() => {
    return getCurriculumChapters(selectedClass, selectedBoard, selectedSubject);
  }, [selectedClass, selectedBoard, selectedSubject]);

  // Default select first chapter if none selected or not matching
  useEffect(() => {
    if (availableChapters.length > 0) {
      if (!selectedChapterId || !availableChapters.some((c) => c.id === selectedChapterId)) {
        setSelectedChapterId(availableChapters[0].id);
      }
    } else {
      setSelectedChapterId('');
    }
  }, [availableChapters, selectedChapterId]);

  // Current selected Chapter object
  const activeChapterObj = useMemo(() => {
    return availableChapters.find((c) => c.id === selectedChapterId) || availableChapters[0];
  }, [availableChapters, selectedChapterId]);

  // Filtered chapters for display list
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return availableChapters;
    const q = searchQuery.toLowerCase().trim();
    return availableChapters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.topics.some((t) => t.name.toLowerCase().includes(q) || t.keyConcepts.some((k) => k.toLowerCase().includes(q)))
    );
  }, [availableChapters, searchQuery]);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (quizState === 'active') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizState]);

  const handleStartQuiz = async () => {
    if (!selectedSubject) {
      alert('Please select a valid subject first.');
      return;
    }
    if (!activeChapterObj) {
      alert('Please select a chapter first.');
      return;
    }
    if (!checkAndConsumeUsage('quizGenerations')) return;

    // Stage 3: Validate Question Availability
    setQuizState('validating');
    setErrorMessage('');

    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!activeChapterObj.name || (activeChapterObj.topics && activeChapterObj.topics.length === 0)) {
      setQuizState('failed');
      setErrorMessage('Selected chapter lacks required topics for question generation. Please pick another chapter.');
      return;
    }

    // Stage 4: Generate / Fetch
    setQuizState('generating');
    setMistakesSaved(false);

    try {
      const subjectName = availableSubjects.find((s) => s.id === selectedSubject)?.name || 'Science';
      const chapterName = activeChapterObj?.name || 'General Chapter';

      const result = await generateAIQuiz({
        subject: subjectName,
        classLevel: selectedClass,
        chapter: chapterName,
        difficulty,
        count: questionCount,
      });

      if (!result?.questions || result.questions.length === 0) {
        throw new Error('No questions returned from AI quiz generator or question bank is currently offline.');
      }

      setQuestions(result.questions);
      setCurrentIdx(0);
      setSelectedAnswers({});
      setMarkedForReview({});
      setShowExplanation(false);
      setTimerSeconds(0);
      
      // Stage 5: Quiz Start
      setQuizState('active');
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      setQuizState('failed');
      setErrorMessage(err.message || 'Failed to generate quiz questions. Please check your connection and retry.');
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (quizMode === 'practice' && selectedAnswers[currentIdx] !== undefined) {
      // already answered in instant mode
      return;
    }
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionIndex,
    }));
    if (quizMode === 'practice') {
      setShowExplanation(true);
    }
  };

  const toggleReviewFlag = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentIdx]: !prev[currentIdx],
    }));
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrev = () => {
    setShowExplanation(false);
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const finishQuiz = () => {
    let correctCount = 0;
    const weakTopicsMap: Record<string, number> = {};

    questions.forEach((q, idx) => {
      const userChoice = selectedAnswers[idx];
      if (userChoice === q.correctAnswerIndex) {
        correctCount++;
      } else {
        weakTopicsMap[q.topic || activeChapterObj?.name || 'Topic'] =
          (weakTopicsMap[q.topic || activeChapterObj?.name || 'Topic'] || 0) + 1;
      }
    });

    const total = questions.length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const earnedXP = correctCount * 25 + (accuracy >= 80 ? 50 : 15);

    setXpAwarded(earnedXP);

    const attempt = {
      id: `attempt-${Date.now()}`,
      quizId: `quiz-${Date.now()}`,
      userId: user.uid,
      subjectId: selectedSubject,
      chapterName: activeChapterObj?.name || 'Chapter',
      topicName: questions[0]?.topic || activeChapterObj?.name || 'General',
      difficulty,
      score: correctCount,
      totalQuestions: total,
      accuracy,
      timeTakenSeconds: timerSeconds,
      xpEarned: earnedXP,
      completedAt: new Date().toISOString(),
      questionsSummary: questions.map((q, idx) => ({
        questionId: q.id,
        isCorrect: selectedAnswers[idx] === q.correctAnswerIndex,
        selectedOption: selectedAnswers[idx] ?? -1,
        correctOption: q.correctAnswerIndex,
      })),
    };

    recordQuizAttempt(attempt);
    addXP(earnedXP, `Completed ${activeChapterObj?.name || 'Chapter'} Quiz`);

    if (accuracy >= 60) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    setQuizState('completed');
  };

  const handleSaveMistakesToNotebook = () => {
    if (mistakesSaved) return;

    let savedCount = 0;
    questions.forEach((q, idx) => {
      const userChoice = selectedAnswers[idx];
      if (userChoice !== q.correctAnswerIndex) {
        const studentAns = userChoice !== undefined ? q.options[userChoice] : 'Unanswered / Skipped';
        const mistakeCat: MistakeCategory =
          q.concept?.toLowerCase().includes('formula') || q.concept?.toLowerCase().includes('law')
            ? 'Formula Confusion'
            : q.concept?.toLowerCase().includes('calculation')
            ? 'Calculation Error'
            : 'Concept Gap';

        addMistake({
          question: q.question,
          studentAnswer: studentAns,
          correctAnswer: q.correctAnswer || (q.options && q.correctAnswerIndex !== undefined ? q.options[q.correctAnswerIndex] : '') || 'Correct Option',
          explanation: q.explanation,
          subject: selectedSubject,
          chapter: activeChapterObj?.name || q.chapter || 'Chapter',
          topic: q.topic || q.concept || 'Concept',
          mistakeType: mistakeCat,
          difficulty,
        });
        savedCount++;
      }
    });

    setMistakesSaved(true);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];
  const userSelected = selectedAnswers[currentIdx];
  const isAnswered = userSelected !== undefined;

  return (
    <div id="practice-quiz-page" className="space-y-6 pb-20 md:pb-8 max-w-6xl mx-auto">
      {/* 1. QUIZ SETUP & CURRICULUM EXPLORER */}
      {quizState === 'idle' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300">
                  <Brain className="w-3.5 h-3.5" />
                  <span>Curriculum-Aligned Adaptive Practice</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Smart Quiz & Practice Drills 🎯
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Select your Board, Class, and Subject to practice authentic textbook chapters with step-by-step verified explanations.
                </p>
              </div>

              {activeChapterObj && (
                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 shrink-0 flex flex-col items-start gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
                    Active Selection
                  </span>
                  <div className="font-extrabold text-white text-base max-w-xs truncate">
                    {activeChapterObj.name}
                  </div>
                  <span className="text-xs text-indigo-200">
                    Class {selectedClass} • {selectedBoard} • {availableSubjects.find((s) => s.id === selectedSubject)?.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Curriculum Cascading Hierarchy Controls */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Compass className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Step 1: Choose Board, Class & Subject
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Board Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Educational Board
                </label>
                <div className="relative">
                  <select
                    id="quiz-board-select"
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-indigo-300 text-slate-900 text-xs sm:text-sm font-semibold rounded-2xl px-3.5 py-2.5 appearance-none focus:bg-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
                  >
                    {SUPPORTED_BOARDS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.country})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Class Level Selector (Classes 1 to 12) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Class Level (1 - 12)
                </label>
                <div className="relative">
                  <select
                    id="quiz-class-select"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value as ClassLevel)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-indigo-300 text-slate-900 text-xs sm:text-sm font-semibold rounded-2xl px-3.5 py-2.5 appearance-none focus:bg-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
                  >
                    {ALL_CLASSES.map((c) => (
                      <option key={c.level} value={c.level}>
                        {c.label} ({c.stage})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Subject Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Subject
                </label>
                <div className="relative">
                  <select
                    id="quiz-subject-select"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value as SubjectId)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-indigo-300 text-slate-900 text-xs sm:text-sm font-semibold rounded-2xl px-3.5 py-2.5 appearance-none focus:bg-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
                  >
                    {availableSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Subject Pill Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {availableSubjects.map((s) => {
                const isSel = selectedSubject === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubject(s.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all border cursor-pointer ${
                      isSel
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapter Selector & Quiz Config Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chapters List Column */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-sm sm:text-base font-black text-slate-900">
                    Step 2: Select Chapter ({filteredChapters.length})
                  </h2>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search chapters or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Chapters Cards */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredChapters.length > 0 ? (
                  filteredChapters.map((ch, idx) => {
                    const isSelected = activeChapterObj?.id === ch.id;
                    return (
                      <div
                        key={ch.id}
                        onClick={() => setSelectedChapterId(ch.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-500 shadow-xs ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              Ch {ch.order || idx + 1}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm">{ch.name}</h3>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2">{ch.description}</p>
                          {ch.topics && ch.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {ch.topics.map((t) => (
                                <span
                                  key={t.id}
                                  className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                                >
                                  {t.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 mt-1">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
                    <p className="text-sm font-semibold text-slate-600">No chapters match your search.</p>
                    <p className="text-xs text-slate-400 mt-1">Try a different keyword or change subject/class.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quiz Configuration Column */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-sm sm:text-base font-black text-slate-900">
                    Step 3: Quiz Settings
                  </h2>
                </div>

                {/* Mode Select */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">
                    Practice Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setQuizMode('practice')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        quizMode === 'practice'
                          ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-900">Learning Drill</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Instant explanations</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuizMode('timed')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        quizMode === 'timed'
                          ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-900">Timed Test</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Final score review</div>
                    </button>
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['easy', 'medium', 'hard', 'challenge'] as DifficultyLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setDifficulty(lvl)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all border cursor-pointer ${
                          difficulty === lvl
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Count */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">
                    Question Count
                  </label>
                  <div className="flex items-center gap-2">
                    {[5, 10, 15, 20].map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => setQuestionCount(cnt)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          questionCount === cnt
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cnt} Qs
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Quiz Action */}
              <button
                id="start-quiz-now-btn"
                onClick={handleStartQuiz}
                disabled={!activeChapterObj}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Launch Chapter Quiz ({questionCount} Qs)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2A. VALIDATING QUESTION AVAILABILITY STATE */}
      {quizState === 'validating' && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4 max-w-lg mx-auto my-12">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          <h2 className="text-xl font-black text-slate-900">Validating Question Availability...</h2>
          <p className="text-xs text-slate-500">
            Checking chapter curriculum topics and question repository readiness for {activeChapterObj?.name || 'selected chapter'}.
          </p>
        </div>
      )}

      {/* 2B. GENERATING / LOADING STATE */}
      {quizState === 'generating' && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4 max-w-lg mx-auto my-12">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          <h2 className="text-xl font-black text-slate-900">Generating AI Quiz Questions...</h2>
          <p className="text-xs text-slate-500">
            Synthesizing curriculum-aligned questions and step-by-step explanations for {activeChapterObj?.name || 'selected chapter'}.
          </p>
        </div>
      )}

      {/* 2C. FAILED / ERROR STATE */}
      {quizState === 'failed' && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-rose-200 shadow-xl space-y-5 max-w-lg mx-auto my-12">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">Quiz Generation Failed</h2>
            <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-2xl border border-rose-100 font-medium">
              {errorMessage || 'Unable to generate questions for this chapter right now.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleStartQuiz}
              className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Retry Generation
            </button>
            <button
              onClick={() => setQuizState('idle')}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
            >
              Choose Another Chapter
            </button>
          </div>
        </div>
      )}

      {/* 3. ACTIVE QUIZ SESSION */}
      {quizState === 'active' && currentQ && (
        <div className="space-y-6">
          {/* Top Progress & Stats Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-xs text-slate-600 font-bold hidden sm:inline-block">
                {activeChapterObj?.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleReviewFlag}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  markedForReview[currentIdx]
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {markedForReview[currentIdx] ? (
                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{markedForReview[currentIdx] ? 'Marked' : 'Review Later'}</span>
              </button>

              <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-black">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatTimer(timerSeconds)}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {currentQ.concept || currentQ.topic || 'Concept Question'}
              </span>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {currentQ.difficulty || difficulty}
              </span>
            </div>

            <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = userSelected === oIdx;
                const isCorrect = oIdx === currentQ.correctAnswerIndex;
                const showInstantResult = quizMode === 'practice' && isAnswered;

                let btnClass = 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-800';

                if (showInstantResult) {
                  if (isCorrect) {
                    btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20';
                  } else if (isSelected && !isCorrect) {
                    btnClass = 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20';
                  }
                } else if (isSelected) {
                  btnClass = 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-500/20';
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${btnClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold">{opt}</span>
                    </div>

                    {showInstantResult && (
                      <div className="shrink-0">
                        {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                        {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Explanation Card (In Practice Mode) */}
            {quizMode === 'practice' && showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl border space-y-2.5 ${
                  userSelected === currentQ.correctAnswerIndex
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/60 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wide">
                  <HelpCircle className="w-4 h-4" />
                  <span>
                    {userSelected === currentQ.correctAnswerIndex ? 'Correct Explanation' : 'Solution Breakdown'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                  {currentQ.explanation}
                </p>
                {currentQ.hint && (
                  <p className="text-xs font-semibold text-slate-600 bg-white/60 p-2.5 rounded-xl">
                    💡 Concept Key: {currentQ.hint}
                  </p>
                )}
              </motion.div>
            )}

            {/* Navigation Controls */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={finishQuiz}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Finish Quiz</span>
                    <Trophy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. COMPLETED QUIZ SCORECARD & REVIEW */}
      {quizState === 'completed' && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mx-auto text-yellow-300">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black">Quiz Completed! 🎉</h2>
              <p className="text-xs sm:text-sm text-slate-300">
                {activeChapterObj?.name || 'Chapter'} • Class {selectedClass} ({selectedBoard})
              </p>
            </div>

            {/* Score Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                <span className="text-[11px] text-slate-300 font-bold uppercase">Score</span>
                <p className="text-2xl font-black text-white">
                  {questions.filter((q, idx) => selectedAnswers[idx] === q.correctAnswerIndex).length} / {questions.length}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                <span className="text-[11px] text-slate-300 font-bold uppercase">Accuracy</span>
                <p className="text-2xl font-black text-indigo-300">
                  {Math.round(
                    (questions.filter((q, idx) => selectedAnswers[idx] === q.correctAnswerIndex).length /
                      questions.length) *
                      100
                  )}%
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                <span className="text-[11px] text-slate-300 font-bold uppercase">Time</span>
                <p className="text-2xl font-black text-white">{formatTimer(timerSeconds)}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                <span className="text-[11px] text-slate-300 font-bold uppercase">XP Gained</span>
                <p className="text-2xl font-black text-yellow-400">+{xpAwarded} XP</p>
              </div>
            </div>

            {/* Mistake Notebook Sync Action */}
            {questions.some((q, idx) => selectedAnswers[idx] !== q.correctAnswerIndex) && (
              <div className="pt-2">
                <button
                  onClick={handleSaveMistakesToNotebook}
                  disabled={mistakesSaved}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer ${
                    mistakesSaved
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {mistakesSaved ? 'Saved to Mistakes Notebook ✓' : 'Save Incorrect Answers to Mistake Notebook'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Detailed Question Review */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              Full Answer Review & Explanations
            </h3>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userChoice = selectedAnswers[idx];
                const isCorrect = userChoice === q.correctAnswerIndex;

                return (
                  <div
                    key={q.id || idx}
                    className={`p-5 rounded-2xl border space-y-3 ${
                      isCorrect ? 'bg-emerald-50/30 border-emerald-200' : 'bg-rose-50/30 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                          Q{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{q.concept || q.topic}</span>
                      </div>
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-full ${
                          isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isCorrect ? 'Correct (+25 XP)' : 'Incorrect'}
                      </span>
                    </div>

                    <p className="font-bold text-slate-900 text-sm sm:text-base">{q.question}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="text-xs p-3 rounded-xl bg-white border border-slate-200">
                        <span className="text-slate-400 font-bold block mb-0.5">Your Answer:</span>
                        <span className={`font-semibold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {userChoice !== undefined ? q.options[userChoice] : 'Skipped / Unanswered'}
                        </span>
                      </div>

                      <div className="text-xs p-3 rounded-xl bg-white border border-slate-200">
                        <span className="text-slate-400 font-bold block mb-0.5">Correct Answer:</span>
                        <span className="font-semibold text-emerald-700">{q.correctAnswer}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
                      <span className="font-bold text-slate-900 block">Explanation:</span>
                      <p>{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Post Quiz Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => setQuizState('idle')}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Practice Another Chapter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
