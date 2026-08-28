import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useFocus } from '../../context/FocusContext';
import {
  Menu,
  Home,
  MapPin,
  Repeat,
  HelpCircle,
  MessageSquare,
  BarChart3,
  Settings,
  Sparkles,
  Timer,
  Music,
  Maximize2,
  Moon,
  Sun,
  Search,
  Bell,
  Zap,
  ChevronDown,
  BookOpen,
  CheckSquare,
  Trophy,
} from 'lucide-react';

export const MasterMenuBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isDarkMode,
    toggleDarkMode,
    setIsUpgradeModalOpen,
  } = useApp();

  const {
    openZen,
    openAnalytics,
    toggleTimer,
    isRunning,
    timeLeft,
    mode,
    setMode,
  } = useFocus();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const navItems = [
    { id: 'home', label: 'Dashboard & Home', icon: Home },
    { id: 'roadmap', label: 'AI Study Roadmap', icon: MapPin },
    { id: 'flashcards', label: 'Spaced Repetition Flashcards', icon: Repeat },
    { id: 'quizzes', label: 'Interactive Quizzes & Practice', icon: HelpCircle },
    { id: 'tutor', label: 'AI Socratic Tutor', icon: MessageSquare },
    { id: 'analytics', label: 'Progress & Stats Analytics', icon: BarChart3 },
    { id: 'settings', label: 'App Settings & Profile', icon: Settings },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        id="master-menu-bar-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
      >
        <Menu className="w-4 h-4" />
        <span className="hidden sm:inline">App Features Menu</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Master Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-fadeIn text-slate-800 dark:text-slate-100 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                ⚡
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  StudyPilot Master Menu
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">All app features & tools in one place</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </div>

          <div className="space-y-4">
            {/* Section 1: Navigation Tabs */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 px-1">
                Navigation & Study Hubs
              </span>
              <div className="grid grid-cols-1 gap-1 pt-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setIsOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Pomodoro & Focus Quick Suite */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-500 px-1">
                Focus & Pomodoro Suite
              </span>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Timer className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold capitalize">{mode.replace('_', ' ')} Timer</span>
                  </div>
                  <span className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {formatTime(timeLeft)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={toggleTimer}
                    className={`py-1.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${
                      isRunning ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' : 'bg-indigo-600 hover:bg-indigo-500'
                    }`}
                  >
                    {isRunning ? 'Pause Timer' : 'Start Focus'}
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      openZen();
                    }}
                    className="py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Maximize2 className="w-3 h-3" /> Zen Mode
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: Utilities & App Actions */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 px-1">
                Utilities & Preferences
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    openAnalytics();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>Study Analytics</span>
                </button>

                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsUpgradeModalOpen(true);
                  }}
                  className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Upgrade to StudyPilot Pro</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
