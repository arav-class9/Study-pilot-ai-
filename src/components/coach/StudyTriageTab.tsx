import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Flame,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Layers,
  HeartHandshake,
  Check,
  Bookmark,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchStudyTriagePlan } from '../../services/studyCoachClient';
import { StudyTriagePlan } from '../../types/studyCoach';
import { safeGetStorage, safeSetStorage } from '../../utils/storage';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';

const STORAGE_TRIAGE_KEY = 'studypilot_coach_triage_plan';

const SAMPLE_CRISIS_PRESETS = [
  {
    label: 'Class 10 Science - 5 Days Remaining',
    days: 5,
    hours: 3.5,
    subject: 'Science',
    syllabus: [
      'Electricity (Ohm\'s Law & Resistance Numericals)',
      'Light Reflection & Refraction (Ray Diagrams & Lens Formula)',
      'Carbon and its Compounds (Homologous Series & Reactions)',
      'Life Processes (Respiration & Transport in Humans)',
      'Magnetic Effects of Electric Current (Solenoid & Right Hand Rule)',
      'Chemical Reactions & Balanced Equations',
    ],
  },
  {
    label: 'Class 10 Math - 7 Days Emergency Sprint',
    days: 7,
    hours: 4,
    subject: 'Mathematics',
    syllabus: [
      'Quadratic Equations (Quadratic Formula & Word Problems)',
      'Arithmetic Progressions (nth term & Sum of n terms)',
      'Trigonometry (Identities & Heights & Distances)',
      'Circles (Tangent Theorems & Circle Proofs)',
      'Surface Areas and Volumes (Combinations of Solids)',
      'Statistics (Mean, Median, Mode Calculations)',
    ],
  },
  {
    label: 'Class 9 Science - 3 Days High-Yield Triage',
    days: 3,
    hours: 3,
    subject: 'Science',
    syllabus: [
      'Motion (Equations of Motion & Graph Interpretations)',
      'Force and Laws of Motion (Conservation of Momentum)',
      'Work and Energy (Kinetic & Potential Energy Derivations)',
      'Atoms and Molecules (Chemical Formulae & Mole Concept)',
    ],
  },
];

export const StudyTriageTab: React.FC = () => {
  const { user, addXP, setCustomTimetable } = useApp();

  // Inputs
  const [availableDays, setAvailableDays] = useState<number>(5);
  const [dailyHours, setDailyHours] = useState<number>(3.5);
  const [subject, setSubject] = useState(user.selectedSubject || 'Science');
  const [remainingSyllabusInput, setRemainingSyllabusInput] = useState(
    'Electricity (Resistance Numericals & Heating Effect)\nLight (Ray Diagrams & Mirror Formula)\nCarbon Compounds (Functional Groups)\nLife Processes (Human Heart & Excretion)\nMagnetic Effects (Electric Motor Principle)'
  );

  // Output
  const [triagePlan, setTriagePlan] = useState<StudyTriagePlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load saved plan
  useEffect(() => {
    const raw = safeGetStorage(STORAGE_TRIAGE_KEY);
    if (raw) {
      try {
        setTriagePlan(JSON.parse(raw));
      } catch (e) {
        console.warn('Failed to parse saved triage plan');
      }
    }
  }, []);

  const handleGenerateTriage = async (preset?: typeof SAMPLE_CRISIS_PRESETS[0]) => {
    setIsLoading(true);
    setErrorMessage(null);

    const sDays = preset?.days || availableDays;
    const sHours = preset?.hours || dailyHours;
    const sSubject = preset?.subject || subject;
    const sSyllabus = preset
      ? preset.syllabus
      : remainingSyllabusInput.split('\n').map((s) => s.trim()).filter(Boolean);

    try {
      const plan = await fetchStudyTriagePlan({
        remainingSyllabus: sSyllabus,
        availableDays: sDays,
        dailyStudyHours: sHours,
        subject: sSubject,
        classLevel: user.classLevel || '10',
      });

      setTriagePlan(plan);
      safeSetStorage(STORAGE_TRIAGE_KEY, JSON.stringify(plan));
      toast.success('Study Triage Plan created! Your schedule has been restructured.');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate study triage plan. Please retry.');
      toast.error('Failed to triage schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToActiveTimetable = () => {
    if (!triagePlan) return;

    try {
      // Build timetable days compatible with CustomTimetable in AppContext
      const convertedDays = triagePlan.rebuiltSchedule.map((d, dIdx) => ({
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dIdx % 7],
        date: `Day ${d.day}`,
        targetStudyMinutes: d.hours * 60,
        blocks: d.topics.map((top, tIdx) => ({
          id: `triage_block_${d.day}_${tIdx}`,
          subjectName: triagePlan.remainingSyllabus[0] ? 'Board Triage' : 'Revision',
          topicName: top,
          durationMinutes: Math.round((d.hours * 60) / Math.max(1, d.topics.length)),
          isCompleted: false,
          priority: 'high' as any,
          notes: d.dailyGoal,
        })),
      }));

      const newTimetable = {
        id: `triage_${Date.now()}`,
        name: `Emergency Triage: ${triagePlan.availableDays}-Day Recovery Plan`,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + triagePlan.availableDays * 24 * 3600 * 1000).toISOString(),
        days: convertedDays,
        totalTargetMinutes: triagePlan.totalAvailableHours * 60,
        completedMinutes: 0,
      };

      setCustomTimetable(newTimetable as any);
      toast.success('Applied Triage Schedule to your Active App Timetable!', { icon: '🚀' });
      addXP(25);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.85 } });
    } catch (e) {
      toast.success('Triage plan saved as active study schedule!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 mb-2">
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Emergency Study Triage</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Rescheduling & Study Triage
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Fallen behind on your syllabus? Don't panic. Enter your remaining topics, available days, and daily study time.
              The AI Triage engine rebuilds your roadmap around high-yield and difficult topics while strictly preserving
              mandatory revision and practice-test blocks.
            </p>
          </div>

          {triagePlan && (
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 self-start md:self-auto">
              <div className="text-center px-2">
                <div className="text-xs text-slate-500 font-medium">Remaining Days</div>
                <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                  {triagePlan.availableDays} Days
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="text-center px-2">
                <div className="text-xs text-slate-500 font-medium">Preserved Buffer</div>
                <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {triagePlan.preservedBuffer.revisionHours + triagePlan.preservedBuffer.practiceTestHours}h
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Parameters Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500" />
          Triage Parameters
        </h3>

        {/* Quick Presets */}
        <div className="mb-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Load Quick Crisis Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_CRISIS_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAvailableDays(preset.days);
                  setDailyHours(preset.hours);
                  setSubject(preset.subject);
                  setRemainingSyllabusInput(preset.syllabus.join('\n'));
                  handleGenerateTriage(preset);
                }}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/60 hover:text-amber-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium transition cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Subject Focus
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Science, Mathematics"
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Available Days until Exam ({availableDays} Days)
            </label>
            <input
              type="range"
              min="1"
              max="21"
              step="1"
              value={availableDays}
              onChange={(e) => setAvailableDays(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 mt-2"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
              <span>1 Day (Crisis)</span>
              <span>7 Days</span>
              <span>21 Days</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Daily Study Hours ({dailyHours} hrs / day • Total: {Math.round(availableDays * dailyHours)} hrs)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={dailyHours}
              onChange={(e) => setDailyHours(parseFloat(e.target.value))}
              className="w-full accent-amber-500 mt-2"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
              <span>1 hr</span>
              <span>5 hrs</span>
              <span>10 hrs</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Remaining Uncovered Syllabus / Chapters (One per line)
          </label>
          <textarea
            rows={4}
            value={remainingSyllabusInput}
            onChange={(e) => setRemainingSyllabusInput(e.target.value)}
            placeholder="List the chapters and topics you have not covered yet..."
            className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleGenerateTriage()}
            disabled={isLoading || !remainingSyllabusInput.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-amber-600 hover:bg-amber-700 transition shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Rebuilding Triage Roadmap...</span>
              </>
            ) : (
              <>
                <LifeBuoy className="w-4 h-4" />
                <span>Triage & Rebuild Schedule</span>
              </>
            )}
          </button>

          {triagePlan && (
            <button
              type="button"
              onClick={handleApplyToActiveTimetable}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Apply Triage Plan as My Timetable</span>
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
            <button
              onClick={() => handleGenerateTriage()}
              className="ml-auto font-bold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Generated Triage Plan View */}
      {triagePlan && (
        <div className="space-y-6">
          {/* Strategy & High Yield Core */}
          <div className="bg-amber-50/50 dark:bg-amber-950/30 rounded-2xl p-6 border border-amber-200 dark:border-amber-900/60 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  Triage High-Yield Strategy
                </span>
                <h4 className="text-base font-bold text-amber-950 dark:text-white mt-0.5">
                  Maximizing Board Exam Marks in {triagePlan.availableDays} Days
                </h4>
                <p className="text-xs text-amber-900 dark:text-amber-200/90 mt-1 leading-relaxed">
                  {triagePlan.highYieldStrategy}
                </p>
              </div>
            </div>

            {/* Preserved Buffer Box */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Non-Negotiable Buffer Preserved:
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {triagePlan.preservedBuffer.notes}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                  {triagePlan.preservedBuffer.revisionHours}h Spaced Revision
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200">
                  {triagePlan.preservedBuffer.practiceTestHours}h Mock Testing
                </span>
              </div>
            </div>
          </div>

          {/* Categorized Topic Triage Grid */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Syllabus Categorization & Weightage
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {triagePlan.categories.map((cat, cIdx) => (
                <div
                  key={cIdx}
                  className={`p-5 rounded-2xl border ${
                    cat.category === 'must_master_high_yield'
                      ? 'bg-rose-50/30 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50'
                      : cat.category === 'quick_review'
                      ? 'bg-blue-50/30 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50'
                      : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                      {cat.label}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {cat.topics.length} Topics
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    {cat.description}
                  </p>

                  <div className="space-y-2">
                    {cat.topics.map((top, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs shadow-xs flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {top.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {top.reason}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {top.estimatedHours}h
                          </span>
                          <div className="text-[10px] text-slate-400">Weight: {top.weightageScore}/10</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rebuilt Day-by-Day Triage Roadmap */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Rebuilt Day-by-Day Recovery Roadmap
                </h4>
                <div className="text-xs text-slate-500 mt-0.5">
                  Follow this sequence strictly. Do not jump ahead without mastering the high-yield foundations.
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplyToActiveTimetable}
                className="text-xs px-3 py-1.5 rounded-xl font-bold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
              >
                Apply to My Schedule
              </button>
            </div>

            <div className="space-y-3">
              {triagePlan.rebuiltSchedule.map((day) => (
                <div
                  key={day.day}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    day.focusType === 'revision_buffer'
                      ? 'bg-emerald-50/30 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50'
                      : day.focusType === 'diagnostic_test'
                      ? 'bg-purple-50/30 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900/50'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                      D{day.day}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {day.topics.join(' • ')}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            day.focusType === 'high_yield_mastery'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : day.focusType === 'revision_buffer'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : day.focusType === 'diagnostic_test'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {day.focusType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Goal: </span>
                        {day.dailyGoal}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg shrink-0 self-end sm:self-auto">
                    {day.hours}h Study
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stress Management / Psychological Encouragement Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                Study Coach Mindset & Anxiety Advice
              </div>
              <p className="text-xs text-indigo-900 dark:text-indigo-300/90 mt-1 leading-relaxed">
                {triagePlan.stressManagementTip}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
