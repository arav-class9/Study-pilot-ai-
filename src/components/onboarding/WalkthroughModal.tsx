import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Home,
  Bot,
  BookOpen,
  CheckCircle2,
  Target,
  CalendarDays,
  FileCheck2,
  Clock,
  Check,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const WalkthroughModal: React.FC = () => {
  const { setActiveTab } = useApp();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem('studypilot_walkthrough_seen');
    const onboarded = localStorage.getItem('studypilot_onboarded');
    if (!hasSeen && onboarded === 'true') {
      setIsOpen(true);
    }

    // Expose global event or handler if needed
    const handleOpenTour = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };
    window.addEventListener('open-study-tour', handleOpenTour);
    return () => {
      window.removeEventListener('open-study-tour', handleOpenTour);
    };
  }, []);

  const steps = [
    {
      title: 'Welcome to StudyPilot AI! 🚀',
      subtitle: 'Your intelligent study coach engineered for CBSE & NCERT academic mastery.',
      description: 'Let us take a quick 1-minute guided tour of the main navigation features so you can study smarter and score higher.',
      icon: Sparkles,
      color: 'from-indigo-600 to-purple-600',
      tab: 'home',
    },
    {
      title: '1. Dashboard (Your Command Center)',
      subtitle: 'Track your daily streak, level XP, and immediate study tasks.',
      description: 'Your Home tab gives you a real-time overview of your academic momentum, study time goals, and instant access to top priority topics.',
      icon: Home,
      color: 'from-blue-600 to-indigo-600',
      tab: 'home',
    },
    {
      title: '2. AI Tutor & Handwritten Doubt Solver',
      subtitle: 'Never stay stuck on a difficult math or science problem.',
      description: 'Ask any question in plain language or snap a photo of a handwritten homework problem. Our AI tutor provides step-by-step intuitive breakdowns.',
      icon: Bot,
      color: 'from-purple-600 to-pink-600',
      tab: 'tutor',
    },
    {
      title: '3. Learn Hub & Study Notes',
      subtitle: 'Master CBSE & NCERT curriculum chapters with AI-generated notes.',
      description: 'Explore comprehensive chapter summaries, key formulas, flashcards, and generate custom study sheets instantly with a single click.',
      icon: BookOpen,
      color: 'from-emerald-600 to-teal-600',
      tab: 'learn',
    },
    {
      title: '4. Adaptive Practice & Weakness Radar',
      subtitle: 'Identify knowledge gaps before your exams do.',
      description: 'Take intelligent practice quizzes calibrated to your level. The Weakness Radar automatically targets where you lose marks and builds 20-minute recovery drills.',
      icon: Target,
      color: 'from-amber-600 to-orange-600',
      tab: 'radar',
    },
    {
      title: '5. Study Plan & Exam Mode',
      subtitle: 'Stay perfectly organized with automated timetables & mock exams.',
      description: 'Get a daily study timetable tailored to your exam date. Test your speed and accuracy under real exam conditions with full-length mock papers.',
      icon: CalendarDays,
      color: 'from-indigo-600 to-sky-600',
      tab: 'plan',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setActiveTab(steps[next].tab);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      setActiveTab(steps[prev].tab);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('studypilot_walkthrough_seen', 'true');
    setIsOpen(false);
    setActiveTab('home');
  };

  if (!isOpen) return null;

  const current = steps[currentStep];
  const IconComponent = current.icon;

  return (
    <div
      id="walkthrough-overlay"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto"
      >
        {/* Header Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 flex">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-full transition-all duration-300 ${
                idx <= currentStep ? 'bg-indigo-600' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 text-center">
          <div className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${current.color} text-white flex items-center justify-center mx-auto shadow-xl`}>
            <IconComponent className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900">
              Step {currentStep + 1} of {steps.length}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
              {current.title}
            </h2>
            <p className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
              {current.subtitle}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {current.description}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleFinish}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer px-2 py-1"
            >
              Skip Tour
            </button>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition-all cursor-pointer"
          >
            <span>{currentStep === steps.length - 1 ? 'Get Started!' : 'Next Feature'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
