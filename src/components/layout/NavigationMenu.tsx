import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useFocus } from '../../context/FocusContext';
import {
  Compass,
  BookOpen,
  HelpCircle,
  FileText,
  Award,
  Calendar,
  Radar,
  Sparkles,
  Timer,
  BarChart3,
  MessageSquare,
  Repeat,
  ChevronDown,
  GraduationCap,
  Target,
} from 'lucide-react';

export const NavigationMenu: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const { openZen, openAnalytics } = useFocus();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const featureCategories = [
    {
      title: 'Core Study Hubs',
      items: [
        { id: 'home', label: 'Dashboard', icon: Compass, desc: 'Overview & daily streak' },
        { id: 'learn', label: 'Learn & Lessons', icon: BookOpen, desc: 'Interactive AI chapters' },
        { id: 'roadmap', label: 'Study Plan', icon: Calendar, desc: 'AI personalized milestone roadmap' },
      ],
    },
    {
      title: 'Practice & Testing',
      items: [
        { id: 'flashcards', label: 'Flashcards', icon: Repeat, desc: 'Spaced repetition memory' },
        { id: 'quizzes', label: 'Interactive Quiz', icon: HelpCircle, desc: 'Dynamic adaptive questions' },
        { id: 'test', label: 'Practice Test', icon: FileText, desc: 'Timed chapter mock exams' },
        { id: 'exam', label: 'Final Exam Mode', icon: Award, desc: 'Comprehensive board exam simulation' },
      ],
    },
    {
      title: 'AI Intelligence & Tracking',
      items: [
        { id: 'tutor', label: 'AI Socratic Tutor', icon: MessageSquare, desc: 'Conversational mentor & solver' },
        { id: 'radar', label: 'Weakness Radar', icon: Radar, desc: 'Pinpoint knowledge gaps' },
        { id: 'analytics', label: 'Study Analytics', icon: BarChart3, desc: 'Pomodoro logs & XP breakdown' },
      ],
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        id="unified-navigation-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
      >
        <GraduationCap className="w-4 h-4" />
        <span className="hidden md:inline">Explore Features</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-[480px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 z-50 animate-fadeIn text-slate-800 dark:text-slate-100 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                🚀
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  StudyPilot AI Feature Directory
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Quick access to all learning modes and test tools
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>

          {/* Categories Grid */}
          <div className="space-y-4">
            {featureCategories.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-1">
                  {cat.title}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as any);
                          setIsOpen(false);
                        }}
                        className={`flex items-start gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white border border-slate-200/60 dark:border-slate-700/60'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl mt-0.5 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{item.label}</p>
                          <p
                            className={`text-[10px] truncate ${
                              isActive ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Quick Launch Bar */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setIsOpen(false);
                openZen();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-bold border border-purple-200 dark:border-purple-800 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Timer className="w-3.5 h-3.5" /> Zen Focus Mode
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                openAnalytics();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" /> Study Analytics
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
