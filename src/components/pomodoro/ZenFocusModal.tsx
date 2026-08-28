import React, { useEffect, useState, useMemo } from 'react';
import { useFocus } from '../../context/FocusContext';
import { AmbientSoundControls } from './AmbientSoundControls';
import { FocusTasks } from './FocusTasks';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Minimize2,
  Flame,
  Brain,
  Coffee,
  Sparkles,
  BookOpen,
  ListTodo,
  Music,
} from 'lucide-react';

const STUDY_QUOTES = [
  { quote: 'Focus is not about saying yes, it is about saying no to a hundred other things.', author: 'Steve Jobs' },
  { quote: 'Live as if you were to die tomorrow. Learn as if you were to live forever.', author: 'Mahatma Gandhi' },
  { quote: 'Energy and persistence conquer all things.', author: 'Benjamin Franklin' },
  { quote: 'The expert in anything was once a beginner.', author: 'Helen Hayes' },
  { quote: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
  { quote: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
];

export const ZenFocusModal: React.FC = () => {
  const {
    isZenOpen,
    closeZen,
    mode,
    timeLeft,
    isRunning,
    toggleTimer,
    resetTimer,
    setMode,
    selectedSubject,
    progressPercent,
    completedSessions,
    totalFocusedMinutes,
  } = useFocus();

  const [activeTab, setActiveTab] = useState<'timer' | 'tasks' | 'sounds'>('timer');
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Rotate quotes every 60 seconds
  useEffect(() => {
    if (!isZenOpen) return;
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % STUDY_QUOTES.length);
    }, 45000);
    return () => clearInterval(interval);
  }, [isZenOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenOpen) {
        closeZen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenOpen, closeZen]);

  if (!isZenOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const modeConfig = {
    focus: { name: 'Focus Session', color: 'text-indigo-400', stroke: '#6366f1', icon: Flame },
    deep: { name: 'Deep Study', color: 'text-purple-400', stroke: '#a855f7', icon: Brain },
    short_break: { name: 'Short Break', color: 'text-emerald-400', stroke: '#10b981', icon: Coffee },
    long_break: { name: 'Long Break', color: 'text-sky-400', stroke: '#0ea5e9', icon: Coffee },
  };

  const currentMode = modeConfig[mode];
  const ModeIcon = currentMode.icon;
  const currentQuote = STUDY_QUOTES[quoteIndex];

  // SVG Circular metrics
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-10 text-white select-none animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
            <ModeIcon className={`w-5 h-5 ${currentMode.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
                Zen Focus Mode
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold uppercase">
                {selectedSubject}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-400">{currentMode.name}</p>
          </div>
        </div>

        {/* Exit Zen Mode */}
        <button
          onClick={closeZen}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl border border-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Exit Zen (Esc)</span>
        </button>
      </div>

      {/* Main Focus Centerpiece */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full my-4">
        {/* Mode Selector Tabs in Zen */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl mb-8">
          <button
            onClick={() => setMode('focus')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'focus' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            25m Focus
          </button>
          <button
            onClick={() => setMode('deep')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'deep' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            50m Deep
          </button>
          <button
            onClick={() => setMode('short_break')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'short_break' || mode === 'long_break'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Break
          </button>
        </div>

        {/* Circular Progress Display */}
        <div className="relative flex items-center justify-center">
          <svg className="w-72 h-72 sm:w-80 sm:h-80 -rotate-90 transform">
            {/* Background Ring */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-slate-800/80"
              fill="transparent"
            />
            {/* Active Progress Ring */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke={currentMode.stroke}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-linear"
              fill="transparent"
            />
          </svg>

          {/* Centered Digital Counter */}
          <div className="absolute flex flex-col items-center justify-center space-y-2">
            <span className="text-5xl sm:text-6xl font-mono font-black tracking-tight text-white drop-shadow-md">
              {formatTime(timeLeft)}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
              {isRunning ? (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  In Flow State
                </span>
              ) : (
                <span>Paused</span>
              )}
            </div>
          </div>
        </div>

        {/* Main Floating Action Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-4 rounded-2xl font-black text-base flex items-center gap-3 transition-all cursor-pointer shadow-xl transform active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 ml-0.5" />
                <span>Start Focus</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Tray (Quote & Multi-Tool drawers) */}
      <div className="w-full max-w-4xl mx-auto">
        {/* Inspiring quote */}
        <div className="text-center max-w-xl mx-auto space-y-1 mb-4">
          <p className="text-xs sm:text-sm text-slate-300 font-serif italic leading-relaxed">
            "{currentQuote.quote}"
          </p>
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
            — {currentQuote.author}
          </p>
        </div>

        {/* Bottom utility toggle bar */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab(activeTab === 'sounds' ? 'timer' : 'sounds')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              activeTab === 'sounds'
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Ambient Sounds</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'tasks' ? 'timer' : 'tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Micro Goals</span>
          </button>
        </div>

        {/* Expandable Sound Drawer in Zen */}
        {activeTab === 'sounds' && (
          <div className="mt-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-md mx-auto animate-fadeIn">
            <AmbientSoundControls compact={true} />
          </div>
        )}

        {/* Expandable Tasks Drawer in Zen */}
        {activeTab === 'tasks' && (
          <div className="mt-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-md mx-auto animate-fadeIn">
            <FocusTasks />
          </div>
        )}
      </div>
    </div>
  );
};
