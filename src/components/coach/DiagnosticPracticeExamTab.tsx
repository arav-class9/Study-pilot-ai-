import React, { useState, useEffect, useRef } from 'react';
import {
  FileCheck2,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ChevronRight,
  BookOpen,
  Layers,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Target,
  Send,
  History,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchDiagnosticPracticeExam, submitGradeDiagnosticExam } from '../../services/studyCoachClient';
import { DiagnosticExamPaper, DiagnosticExamResult } from '../../types/studyCoach';
import { safeGetStorage, safeSetStorage } from '../../utils/storage';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';

const STORAGE_DIAG_RESULTS = 'studypilot_coach_diagnostic_results';

const SAMPLE_DIAG_TOPICS = [
  { label: 'Electricity: Circuits & Power', subject: 'Science', topic: 'Electricity and Electrical Power', difficulty: 'board_standard' },
  { label: 'Light: Refraction & Lenses', subject: 'Science', topic: 'Light Reflection and Refraction', difficulty: 'board_standard' },
  { label: 'Metals & Non-Metals', subject: 'Science', topic: 'Metals, Chemical Reactivity & Extraction', difficulty: 'medium' },
  { label: 'Life Processes: Excretion & Circulation', subject: 'Science', topic: 'Human Circulatory & Excretory Systems', difficulty: 'hard' },
  { label: 'Quadratic Equations & Roots', subject: 'Mathematics', topic: 'Quadratic Equations & Word Problems', difficulty: 'board_standard' },
];

export const DiagnosticPracticeExamTab: React.FC = () => {
  const { user, addXP, addMistake } = useApp();

  // Setup inputs
  const [subject, setSubject] = useState(user.selectedSubject || 'Science');
  const [topic, setTopic] = useState('Electricity and Electrical Power');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'board_standard'>('board_standard');

  // Exam taking state
  const [examPaper, setExamPaper] = useState<DiagnosticExamPaper | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [isExamActive, setIsExamActive] = useState(false);

  // Result state
  const [examResult, setExamResult] = useState<DiagnosticExamResult | null>(null);
  const [pastResults, setPastResults] = useState<DiagnosticExamResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Loading & error
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timerRef = useRef<any>(null);

  // Load past results from storage
  useEffect(() => {
    const raw = safeGetStorage(STORAGE_DIAG_RESULTS);
    if (raw) {
      try {
        setPastResults(JSON.parse(raw));
      } catch (e) {
        console.warn('Failed to parse diagnostic exam results');
      }
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isExamActive && timeLeftSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isExamActive, timeLeftSeconds]);

  const handleStartExam = async (override?: typeof SAMPLE_DIAG_TOPICS[0]) => {
    setIsGenerating(true);
    setErrorMessage(null);
    setExamResult(null);
    setStudentAnswers({});

    const sSubject = override?.subject || subject;
    const sTopic = override?.topic || topic;
    const sDiff = override?.difficulty || difficulty;

    try {
      const paper = await fetchDiagnosticPracticeExam({
        subject: sSubject,
        topic: sTopic,
        difficulty: sDiff,
        classLevel: user.classLevel || '10',
      });

      setExamPaper(paper);
      setTimeLeftSeconds((paper.durationMinutes || 20) * 60);
      setIsExamActive(true);
      toast.success('Practice exam started! Answers are hidden until submission.');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Could not generate practice exam. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoSubmit = () => {
    toast('Time has expired! Submitting exam for grading...', { icon: '⏰' });
    handleSubmitExam();
  };

  const handleSubmitExam = async () => {
    if (!examPaper) return;

    clearInterval(timerRef.current);
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await submitGradeDiagnosticExam({
        subject: examPaper.subject,
        topic: examPaper.topic,
        questions: examPaper.questions,
        studentAnswers,
        examTitle: examPaper.examTitle,
      });

      setExamResult(result);
      setIsExamActive(false);

      // Save to past results
      setPastResults((prev) => {
        const updated = [result, ...prev];
        safeSetStorage(STORAGE_DIAG_RESULTS, JSON.stringify(updated.slice(0, 10)));
        return updated;
      });

      // Award XP
      const xpEarned = Math.max(30, Math.round(result.percentage * 0.8));
      addXP(xpEarned);

      if (result.percentage >= 70) {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
        toast.success(`Exam Graded! Score: ${result.percentage}% (+${xpEarned} XP)`, { icon: '🎉' });
      } else {
        toast(`Exam Graded! Identified ${result.weakSubtopics.length} weak subtopics to review.`, { icon: '📊' });
      }

      // Record mistakes into mistake notebook
      result.mistakeExplanations.forEach((mistake) => {
        try {
          addMistake({
            question: `[${mistake.subtopic}] Exam Question #${mistake.questionNumber}`,
            questionText: `[${mistake.subtopic}] Exam Question #${mistake.questionNumber}`,
            studentAnswer: mistake.studentMistake,
            correctAnswer: mistake.correction,
            explanation: `Identified weak spot during diagnostic test. Review ${mistake.subtopic}.`,
            subject: examPaper.subject as any,
            topic: mistake.subtopic,
            category: 'conceptual' as any,
            suggestedAction: 'Review formula and re-solve exemplar questions',
          });
        } catch (e) {
          // ignore if subject type doesn't strictly match
        }
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to grade exam attempt. Please retry.');
      toast.error('Grading failed. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const unansweredCount = examPaper
    ? examPaper.questions.filter((q) => !studentAnswers[q.id]?.trim()).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-900/60 mb-2">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Exam Simulation & Diagnostics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Practice Exam & Weak-Spot Diagnostics
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Simulate realistic board examinations with 4 MCQs and 3 Short-Answer questions. Answers are hidden during the test.
              Upon submission, AI auto-grades your answers, diagnoses weak subtopics, and builds an actionable revision plan.
            </p>
          </div>

          {pastResults.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition cursor-pointer self-start md:self-auto"
            >
              <History className="w-4 h-4" />
              <span>Diagnostic Reports History ({pastResults.length})</span>
            </button>
          )}
        </div>

        {/* History Drawer */}
        {showHistory && pastResults.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Recent Diagnostic Reports:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {pastResults.map((r, i) => (
                <div
                  key={r.id || i}
                  onClick={() => {
                    setExamResult(r);
                    setExamPaper(null);
                    setShowHistory(false);
                  }}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 cursor-pointer transition text-xs"
                >
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {r.examTitle || r.topic}
                  </div>
                  <div className="flex items-center justify-between text-slate-500 mt-1">
                    <span className="font-semibold text-indigo-600">{r.percentage}% Score</span>
                    <span>{r.weakSubtopics.length} Weak Spots</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Setup Form (when not taking exam) */}
      {!isExamActive && !examResult && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Configure Practice Exam
          </h3>

          {/* Quick Presets */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Standard Board Exam Sets:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_DIAG_TOPICS.map((st, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSubject(st.subject);
                    setTopic(st.topic);
                    setDifficulty(st.difficulty as any);
                    handleStartExam(st);
                  }}
                  disabled={isGenerating}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-purple-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium transition cursor-pointer"
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Science, Mathematics"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Topic / Chapter Focus
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Electricity, Circuits & Resistance"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="easy">Foundation (Direct Conceptual)</option>
                <option value="medium">Standard (NCERT Exercise Level)</option>
                <option value="board_standard">Board Examination Standard</option>
                <option value="hard">High-Order Thinking (HOTS)</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleStartExam()}
              disabled={isGenerating || !topic.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-purple-600 hover:bg-purple-700 transition shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Drafting Board Practice Exam...</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>Generate & Start Practice Exam</span>
                </>
              )}
            </button>
            <span className="text-xs text-slate-400">
              Format: 4 MCQs (1 mark each) + 3 Short Answer Questions (2 marks each)
            </span>
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
              <button
                onClick={() => handleStartExam()}
                className="ml-auto font-bold underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active Exam Paper Interface */}
      {isExamActive && examPaper && (
        <div className="space-y-6">
          {/* Exam Header Bar with Countdown Timer */}
          <div className="sticky top-20 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Exam in Progress • Answers Hidden
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {examPaper.examTitle}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer Pill */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border ${
                  timeLeftSeconds <= 180
                    ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Grading Attempt...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Exam</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>You have {unansweredCount} unanswered questions remaining. You can answer or submit now.</span>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-6">
            {examPaper.questions.map((q, idx) => {
              const currentAns = studentAnswers[q.id] || '';
              const isMCQ = q.type === 'mcq';

              return (
                <div
                  key={q.id || idx}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {isMCQ ? 'Multiple Choice' : 'Short-Answer Analytical'}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        Subtopic: {q.subtopic}
                      </span>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                    </span>
                  </div>

                  {/* Question Text */}
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {q.question}
                  </p>

                  {/* Answer Inputs (MCQ vs Short Answer) */}
                  {isMCQ && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = currentAns === opt;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() =>
                              setStudentAnswers((prev) => ({ ...prev, [q.id]: opt }))
                            }
                            className={`text-left p-3 rounded-xl border text-xs transition cursor-pointer flex items-start gap-2.5 ${
                              isSelected
                                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-600 text-purple-900 dark:text-purple-200 font-semibold ring-1 ring-purple-500'
                                : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-300'
                            }`}
                          >
                            <span className="font-mono font-bold text-slate-400 shrink-0">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {!isMCQ && (
                    <div className="pt-1">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        Write your structured explanation (include core formulas and key keywords):
                      </label>
                      <textarea
                        rows={4}
                        value={currentAns}
                        onChange={(e) =>
                          setStudentAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        placeholder="State your answer clearly with scientific terms and step-by-step reasoning..."
                        className="w-full px-4 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Submit Banner */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500">
              Double-check all questions before submitting. All answers will be graded by AI.
            </span>
            <button
              type="button"
              onClick={handleSubmitExam}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-purple-600 hover:bg-purple-700 transition shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Exam...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit & Generate Diagnostics</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Evaluated Diagnostic Report View */}
      {examResult && (
        <div className="space-y-6">
          {/* Diagnostic Scorecard Header */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Diagnostic Exam Report & Analysis
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {examResult.examTitle}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Topic: {examResult.topic} • Submitted at{' '}
                  {new Date(examResult.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div className="flex items-center gap-4 self-start md:self-auto">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">Score Achieved</div>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                    {examResult.totalMarksAwarded} / {examResult.totalMarksPossible}
                  </div>
                </div>
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border ${
                    examResult.percentage >= 70
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {examResult.percentage}%
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setExamResult(null);
                  setExamPaper(null);
                }}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 underline cursor-pointer"
              >
                ← Take Another Practice Exam
              </button>
            </div>
          </div>

          {/* Weak-Spot Diagnostics Panel */}
          {examResult.weakSubtopics.length > 0 && (
            <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl p-6 border border-rose-200 dark:border-rose-900/50 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h4 className="text-sm font-bold text-rose-950 dark:text-rose-200 uppercase tracking-wider">
                  Weak-Spot Diagnostics ({examResult.weakSubtopics.length} Areas Identified)
                </h4>
              </div>
              <p className="text-xs text-rose-800 dark:text-rose-300/90 leading-relaxed">
                Our diagnostic engine identified specific conceptual vulnerabilities where marks were lost. Focus your revision here immediately:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {examResult.weakSubtopics.map((ws, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 text-xs space-y-1.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {ws.subtopic}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          ws.severity === 'critical'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {ws.severity} priority (-{ws.marksLost} marks)
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {ws.diagnosticReason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Targeted Revision Plan */}
          {examResult.targetedRevisionPlan.length > 0 && (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-900/50 space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                  Targeted Revision Recommendations
                </h4>
              </div>

              <div className="space-y-2.5">
                {examResult.targetedRevisionPlan.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 text-xs flex items-start justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {step.subtopic}
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                          {step.actionableStep}
                        </div>
                      </div>
                    </div>

                    <span className="font-mono font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded shrink-0">
                      {step.recommendedTimeMinutes} min
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question-by-Question Graded Review */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
              Itemized Question-by-Question Grading
            </h4>

            <div className="space-y-4">
              {examResult.questionGrades.map((g, idx) => (
                <div
                  key={g.questionId || idx}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    g.isCorrect
                      ? 'bg-emerald-50/20 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/50'
                      : 'bg-rose-50/20 border-rose-200 dark:bg-rose-950/10 dark:border-rose-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {g.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span className="font-bold text-slate-900 dark:text-white">
                        Question #{g.questionNumber} ({g.subtopic})
                      </span>
                    </div>

                    <span
                      className={`font-bold px-2 py-0.5 rounded-full ${
                        g.isCorrect
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {g.marksAwarded} / {g.maxMarks} Marks
                    </span>
                  </div>

                  <div className="space-y-1.5 pl-6">
                    <div>
                      <span className="font-semibold text-slate-500">Your Answer: </span>
                      <span className="text-slate-900 dark:text-white">{g.studentAnswer || '(No Answer)'}</span>
                    </div>
                    {!g.isCorrect && (
                      <div>
                        <span className="font-semibold text-slate-500">Expected Answer / Key Rubric: </span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                          {g.correctOrSampleAnswer}
                        </span>
                      </div>
                    )}
                    <div className="text-slate-600 dark:text-slate-400 italic">
                      {g.feedback}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
