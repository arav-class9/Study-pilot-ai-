import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  BookOpen,
  ShieldAlert,
  HelpCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Coffee,
  Brain,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useFocus } from '../../context/FocusContext';
import { fetchPomodoroSchedule } from '../../services/studyCoachClient';
import { PomodoroSchedulePlan, DaySchedule, PomodoroSession } from '../../types/studyCoach';
import { safeGetStorage, safeSetStorage } from '../../utils/storage';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';

const STORAGE_KEY = 'studypilot_coach_pomodoro_plan';
const COMPLETED_SESSIONS_KEY = 'studypilot_coach_completed_sessions';

const SAMPLE_PRESETS = [
  {
    label: 'Class 10 Science - High Weightage Units',
    subject: 'Science',
    topic: 'Electricity, Light & Life Processes',
    hours: 3,
    syllabus: [
      'Ohm\'s Law, Series & Parallel Combinations (High Marks)',
      'Joule\'s Heating & Commercial Unit of Energy',
      'Spherical Mirrors, Lenses & Lens Formula',
      'Nutrition, Respiration & Transport in Humans',
      'Chemical Reactions & Balanced Equations',
      'Complete Board Practice Test & Diagram Revision',
    ],
  },
  {
    label: 'Class 10 Mathematics - Final Sprint',
    subject: 'Mathematics',
    topic: 'Algebra & Trigonometry Mastery',
    hours: 4,
    syllabus: [
      'Quadratic Equations & Discriminant Method',
      'Arithmetic Progressions (Sum of n terms)',
      'Trigonometric Identities & Height & Distances',
      'Circles: Tangent Theorems & Proofs',
      'Surface Areas and Volumes: Frustum & Combinations',
      'Timed 80-Mark Sample Question Paper Drill',
    ],
  },
  {
    label: 'Class 9 Physics & Chemistry Sprint',
    subject: 'Science',
    topic: 'Motion, Force & Structure of Atom',
    hours: 2.5,
    syllabus: [
      'Equations of Motion by Graphical Method',
      'Newton\'s Laws of Motion & Momentum Conservation',
      'Work, Kinetic & Potential Energy Derivations',
      'Bohr\'s Model & Valency Calculations',
      'Revision & Formula Consolidation',
    ],
  },
];

export const PomodoroScheduleTab: React.FC = () => {
  const { user, addXP } = useApp();
  const { openZen, setMode, toggleTimer, isRunning } = useFocus();

  // Form inputs
  const [subject, setSubject] = useState(user.selectedSubject || 'Science');
  const [topic, setTopic] = useState('Light, Electricity & Life Processes');
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });
  const [dailyHours, setDailyHours] = useState<number>(3);
  const [syllabusInput, setSyllabusInput] = useState<string>(
    'Ohm\'s Law and Electrical Power\nSpherical Mirrors and Ray Diagrams\nHuman Circulatory System & Excretion\nCarbon Bonds & Functional Groups\nFull Mock Paper Revision'
  );

  // Output & state
  const [plan, setPlan] = useState<PomodoroSchedulePlan | null>(null);
  const [completedSessions, setCompletedSessions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true, 2: true });

  // Load persisted plan
  useEffect(() => {
    const saved = safeGetStorage(STORAGE_KEY);
    if (saved) {
      try {
        setPlan(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to parse saved Pomodoro plan');
      }
    }
    const savedCompleted = safeGetStorage(COMPLETED_SESSIONS_KEY);
    if (savedCompleted) {
      try {
        setCompletedSessions(JSON.parse(savedCompleted));
      } catch (e) {
        console.warn('Failed to parse completed sessions');
      }
    }
  }, []);

  const handleGenerate = async (presetOverride?: typeof SAMPLE_PRESETS[0]) => {
    setIsLoading(true);
    setErrorMessage(null);

    const sSubject = presetOverride?.subject || subject;
    const sTopic = presetOverride?.topic || topic;
    const sHours = presetOverride?.hours || dailyHours;
    const sSyllabus = presetOverride
      ? presetOverride.syllabus
      : syllabusInput.split('\n').map((s) => s.trim()).filter(Boolean);

    try {
      const generated = await fetchPomodoroSchedule({
        subject: sSubject,
        topic: sTopic,
        syllabus: sSyllabus,
        examDate,
        dailyStudyHours: sHours,
        classLevel: user.classLevel || '10',
      });

      setPlan(generated);
      safeSetStorage(STORAGE_KEY, JSON.stringify(generated));

      // Expand first 2 days
      const expanded: Record<number, boolean> = {};
      generated.schedule.forEach((d, idx) => {
        expanded[d.dayNumber] = idx < 2;
      });
      setExpandedDays(expanded);
      toast.success('Pomodoro timetable generated successfully!');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate Pomodoro timetable. Please retry.');
      toast.error('Could not generate schedule. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSession = (sessionId: string) => {
    setCompletedSessions((prev) => {
      const isNowCompleted = !prev[sessionId];
      const updated = { ...prev, [sessionId]: isNowCompleted };
      safeSetStorage(COMPLETED_SESSIONS_KEY, JSON.stringify(updated));

      if (isNowCompleted) {
        addXP(25);
        toast.success('+25 XP for finishing a Pomodoro study block!', { icon: '🍅' });
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.85 } });
      }
      return updated;
    });
  };

  const toggleDayExpansion = (dayNumber: number) => {
    setExpandedDays((prev) => ({ ...prev, [dayNumber]: !prev[dayNumber] }));
  };

  const handleStartTimer = (session: PomodoroSession) => {
    setMode('focus');
    if (!isRunning) {
      toggleTimer();
    }
    openZen();
    toast.success(`Pomodoro session started: ${session.durationMinutes}m focus on "${session.title}"!`, { icon: '⏱️' });
  };

  // Metrics
  const totalPlanSessions = plan
    ? plan.schedule.reduce((acc, d) => acc + d.sessions.filter((s) => s.type !== 'break').length, 0)
    : 0;
  const completedCount = Object.keys(completedSessions).filter((id) => completedSessions[id]).length;
  const progressPercent = totalPlanSessions > 0 ? Math.min(100, Math.round((completedCount / totalPlanSessions) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Pomodoro 25+5 Methodology</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Daily Study Plan & Pomodoro Timetable
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Construct a high-retention schedule using 25-minute Pomodoro focus blocks and 5-minute restorative breaks.
              High-weight and difficult topics are prioritized first, with mandatory buffers reserved for revision and tests.
            </p>
          </div>

          {/* Quick Stats Pill */}
          {plan && (
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 self-start md:self-auto">
              <div className="text-center px-2">
                <div className="text-xs text-slate-500 font-medium">Completed</div>
                <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                  {completedCount} <span className="text-xs text-slate-400 font-normal">/ {totalPlanSessions}</span>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="text-center px-2">
                <div className="text-xs text-slate-500 font-medium">Revision Buffer</div>
                <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {plan.overview.revisionBufferHours}h
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar if plan exists */}
        {plan && totalPlanSessions > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              <span>Pomodoro Sessions Progress</span>
              <span>{progressPercent}% Complete ({completedCount} of {totalPlanSessions} sessions)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-indigo-600 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Inputs / Configuration */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Schedule Parameters
        </h3>

        {/* Quick Presets */}
        <div className="mb-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Load Quick Class 9–10 Board Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSubject(preset.subject);
                  setTopic(preset.topic);
                  setDailyHours(preset.hours);
                  setSyllabusInput(preset.syllabus.join('\n'));
                  handleGenerate(preset);
                }}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium transition-colors cursor-pointer"
              >
                {preset.label}
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
              placeholder="e.g. Science, Mathematics, Social Studies"
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Available Daily Hours ({dailyHours} hrs / {Math.floor((dailyHours * 60) / 30)} Pomodoros)
            </label>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={dailyHours}
              onChange={(e) => setDailyHours(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 mt-2"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
              <span>1 hr</span>
              <span>4 hrs</span>
              <span>8 hrs</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Syllabus / Chapters to Cover (One topic per line)
          </label>
          <textarea
            rows={3}
            value={syllabusInput}
            onChange={(e) => setSyllabusInput(e.target.value)}
            placeholder="Enter syllabus topics or paste chapters from your textbook..."
            className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Designing Pomodoro Schedule...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Day-by-Day Pomodoro Timetable</span>
              </>
            )}
          </button>

          {plan && (
            <button
              type="button"
              onClick={() => {
                setPlan(null);
                setCompletedSessions({});
                safeSetStorage(STORAGE_KEY, '');
                safeSetStorage(COMPLETED_SESSIONS_KEY, '');
                toast('Schedule cleared', { icon: '🧹' });
              }}
              className="text-xs text-slate-400 hover:text-rose-500 transition cursor-pointer"
            >
              Reset Schedule
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
            <button
              onClick={() => handleGenerate()}
              className="ml-auto font-bold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Generated Schedule View */}
      {plan && (
        <div className="space-y-4">
          {/* Strategy Card */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-900/60">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                  Cognitive Optimization Strategy
                </h4>
                <p className="text-xs text-indigo-800 dark:text-indigo-300/90 mt-1 leading-relaxed">
                  {plan.overview.strategySummary}
                </p>
                <div className="flex flex-wrap gap-2 mt-2.5">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-indigo-200/60 dark:bg-indigo-800/60 text-indigo-900 dark:text-indigo-200">
                    High Priority Focus:
                  </span>
                  {plan.overview.highPriorityTopics.map((top, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-medium border border-indigo-200 dark:border-indigo-800"
                    >
                      {top}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Days Accordion */}
          <div className="space-y-3">
            {plan.schedule.map((day) => {
              const isExpanded = !!expandedDays[day.dayNumber];
              const dayPomodoroSessions = day.sessions.filter((s) => s.type !== 'break');
              const dayCompletedCount = dayPomodoroSessions.filter((s) => completedSessions[s.id]).length;
              const isDayAllDone = dayPomodoroSessions.length > 0 && dayCompletedCount === dayPomodoroSessions.length;

              return (
                <div
                  key={day.dayNumber}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all shadow-sm ${
                    isDayAllDone
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Day Header Bar */}
                  <div
                    onClick={() => toggleDayExpansion(day.dayNumber)}
                    className="p-4 sm:px-6 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isDayAllDone
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isDayAllDone ? <Check className="w-5 h-5" /> : `D${day.dayNumber}`}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Day {day.dayNumber}: {day.dailyTheme}
                          </h4>
                          {day.revisionBufferMinutes > 0 && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                              <ShieldAlert className="w-3 h-3" />
                              {day.revisionBufferMinutes}m Buffer Reserved
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {dayCompletedCount} / {dayPomodoroSessions.length} focus sessions checked
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-xs text-slate-400 hidden sm:block">
                        {isExpanded ? 'Collapse' : 'Expand Sessions'}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Sessions List */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                      {day.sessions.map((session, sIdx) => {
                        const isDone = !!completedSessions[session.id];
                        const isBreak = session.type === 'break';
                        const isBuffer = session.type === 'revision_buffer';
                        const isMock = session.type === 'mock_test';

                        if (isBreak) {
                          return (
                            <div
                              key={session.id || sIdx}
                              className="flex items-center gap-3 py-2 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400"
                            >
                              <Coffee className="w-4 h-4 text-amber-500 shrink-0" />
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                5-Min Restorative Break:
                              </span>
                              <span className="truncate">{session.tips || 'Step away, hydrate, and stretch.'}</span>
                              <span className="ml-auto font-mono text-[11px] text-slate-400 shrink-0">5m</span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={session.id || sIdx}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all gap-3 ${
                              isDone
                                ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80'
                                : isBuffer
                                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                                : isMock
                                ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50'
                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Checkbox */}
                              <button
                                type="button"
                                onClick={() => handleToggleSession(session.id)}
                                className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                  isDone
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                                }`}
                              >
                                {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`text-xs font-bold ${
                                      isDone
                                        ? 'line-through text-slate-400 dark:text-slate-500'
                                        : 'text-slate-900 dark:text-white'
                                    }`}
                                  >
                                    {session.title}
                                  </span>
                                  {session.priority === 'high' && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 uppercase">
                                      High Weight
                                    </span>
                                  )}
                                  {isBuffer && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 uppercase">
                                      Buffer Time
                                    </span>
                                  )}
                                  {isMock && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 uppercase">
                                      Practice Test
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  <span className="font-medium text-slate-700 dark:text-slate-300">Topic: </span>
                                  {session.topic}
                                </div>
                                {session.tips && (
                                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic flex items-center gap-1">
                                    <span>Tip:</span> {session.tips}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                              <span className="text-xs font-mono font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {session.durationMinutes} min
                              </span>
                              <button
                                type="button"
                                onClick={() => handleStartTimer(session)}
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 font-semibold transition cursor-pointer"
                                title="Launch 25m Focus Timer"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Focus</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
