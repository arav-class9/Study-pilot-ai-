import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClassLevel, SubjectId } from '../../types';
import { Sparkles, Check, ArrowRight, BookOpen, Clock, Target, Rocket, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OnboardingModal: React.FC = () => {
  const { user, isOnboarded, completeOnboarding } = useApp();
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState(user.name !== 'Student Pilot' ? user.name : '');
  const [classLevel, setClassLevel] = useState<ClassLevel>(user.classLevel || '9');
  const [board, setBoard] = useState(user.board || 'CBSE');
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectId[]>(user.subjects || ['math', 'science', 'english']);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(user.goals || ['Improve school marks', 'Master CBSE concepts']);
  const [dailyMinutes, setDailyMinutes] = useState(user.dailyStudyMinutes || 60);

  if (isOnboarded) return null;

  const handleToggleSubject = (sub: SubjectId) => {
    if (selectedSubjects.includes(sub)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleToggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((g) => g !== goal));
      }
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleFinish = () => {
    completeOnboarding({
      name: name.trim() || 'Pilot Scholar',
      classLevel,
      board,
      subjects: selectedSubjects,
      goals: selectedGoals,
      dailyStudyMinutes: dailyMinutes,
    });
  };

  const classes: ClassLevel[] = ['6', '7', '8', '9', '10', '11', '12'];

  const subjectOptions: { id: SubjectId; label: string; desc: string }[] = [
    { id: 'math', label: 'Mathematics', desc: 'Algebra, Geometry, Trigonometry, Calculus' },
    { id: 'science', label: 'Science', desc: 'Physics, Chemistry & Biology integrated foundation' },
    { id: 'english', label: 'English', desc: 'Grammar, Literature, Reading & Writing' },
    { id: 'social_science', label: 'Social Science', desc: 'History, Civics, Geography & Economics' },
    { id: 'physics', label: 'Physics', desc: 'Mechanics, Optics, Thermodynamics & Electricity' },
    { id: 'chemistry', label: 'Chemistry', desc: 'Physical, Organic & Inorganic Reactions' },
    { id: 'biology', label: 'Biology', desc: 'Genetics, Physiology & Ecology' },
  ];

  const goalOptions = [
    'Improve school marks & rank top 5%',
    'Prepare for Board / Final exams',
    'Strengthen core concepts & numericals',
    'Competitive exam preparation (JEE/NEET/Olympiad)',
  ];

  const timeOptions = [
    { label: '30 Minutes', value: 30, desc: 'Quick daily concept booster' },
    { label: '1 Hour', value: 60, desc: 'Balanced revision & 1 quiz' },
    { label: '2 Hours', value: 120, desc: 'Deep focus: Learn, Practice & Recovery' },
    { label: '3 Hours', value: 180, desc: 'Rigorous exam prep & test series' },
    { label: '4+ Hours', value: 240, desc: 'Intensive competitive sprint' },
  ];

  return (
    <div
      id="onboarding-overlay"
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto"
      >
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-gradient-to-r from-indigo-600 to-sky-500 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 flex-1">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Welcome to StudyPilot AI 🚀
                  </h2>
                  <p className="text-slate-600 font-medium mt-1.5 text-sm sm:text-base">
                    Your personal AI study coach for CBSE & NCERT mastery.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2.5 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">1</span>
                    <span><strong>Ask doubts</strong> via text, image scan, or formula</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">2</span>
                    <span><strong>AI Weakness Radar</strong> detects where you lose marks</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">3</span>
                    <span><strong>20-Minute Recovery Plans</strong> turn weak concepts into strengths</span>
                  </div>
                </div>

                <div className="text-left space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Your Student Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-slate-900 text-sm font-medium"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    What class are you in?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Select your standard to tailor curriculum questions & notes.
                  </p>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {classes.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setClassLevel(cls)}
                      className={`p-3 rounded-2xl border font-extrabold text-base transition-all cursor-pointer ${
                        classLevel === cls
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {cls}th
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Education Board
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['CBSE', 'ICSE', 'State Board'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBoard(b)}
                        className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                          board === b
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    Which subjects do you study?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Select all that apply for your Class {classLevel} syllabus.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto p-1">
                  {subjectOptions.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub.id);
                    return (
                      <div
                        key={sub.id}
                        onClick={() => handleToggleSubject(sub.id)}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{sub.label}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{sub.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    What is your primary academic goal?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    StudyPilot AI adapts its coach tone and quiz difficulty accordingly.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {goalOptions.map((goal) => {
                    const isSelected = selectedGoals.includes(goal);
                    return (
                      <div
                        key={goal}
                        onClick={() => handleToggleGoal(goal)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-semibold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Target className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span className="text-sm">{goal}</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    How much time can you study each day?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    We will architect your personalized study planner timetable.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {timeOptions.map((opt) => {
                    const isSelected = dailyMinutes === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => setDailyMinutes(opt.value)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-semibold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Clock className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <div>
                            <p className="text-sm font-bold">{opt.label}</p>
                            <p className="text-[11px] text-slate-500">{opt.desc}</p>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Back
            </button>
          ) : (
            <span className="text-xs text-slate-600 font-medium">Step 1 of 5</span>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all cursor-pointer"
            >
              <Rocket className="w-4 h-4" />
              <span>Launch My StudyPilot</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
