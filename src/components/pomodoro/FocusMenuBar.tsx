import React, { useState, useRef, useEffect } from 'react';
import { useFocus } from '../../context/FocusContext';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Timer,
  Volume2,
  VolumeX,
  ListTodo,
  BarChart2,
  Maximize2,
  Moon,
  Sun,
  Flame,
  Coffee,
  Brain,
  Sparkles,
  ChevronDown,
  Music,
  CheckCircle2,
} from 'lucide-react';
import { AmbientSoundType, PomodoroMode } from '../../types';

export const FocusMenuBar: React.FC = () => {
  const {
    mode,
    timeLeft,
    isRunning,
    toggleTimer,
    resetTimer,
    setMode,
    openZen,
    openAnalytics,
    ambientSound,
    setAmbientSound,
    ambientVolume,
    setAmbientVolume,
    isAmbientPlaying,
    toggleAmbientPlaying,
    tasks,
    isMiniWidgetVisible,
    setIsMiniWidgetVisible,
  } = useFocus();

  const { isDarkMode, toggleDarkMode } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
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

  const completedGoalsCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Bar trigger button */}
      <button
        id="study-menu-bar-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
      >
        <Menu className="w-4 h-4 text-indigo-600" />
        <span className="hidden sm:inline">Study Menu Bar</span>
        <span className="font-mono bg-indigo-200/60 px-1.5 py-0.5 rounded text-[11px]">
          {formatTime(timeLeft)}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu Bar Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 z-50 animate-fadeIn text-slate-800">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                🎯
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Focus & Study Control Center
                </h3>
                <p className="text-[10px] text-slate-500">All study modes, sounds & analytics</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 rounded-lg hover:bg-slate-100"
            >
              Close
            </button>
          </div>

          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* 1. Quick Timer Widget Row */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-700 flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-indigo-600" /> Pomodoro Timer
                </span>
                <span className="text-sm font-mono font-black text-indigo-600">
                  {formatTime(timeLeft)}
                </span>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-4 gap-1">
                {(['focus', 'deep', 'short_break', 'long_break'] as PomodoroMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`py-1 rounded-lg text-[10px] font-bold capitalize transition-colors cursor-pointer ${
                      mode === m
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={toggleTimer}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                    isRunning ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' : 'bg-indigo-600 hover:bg-indigo-500'
                  }`}
                >
                  {isRunning ? 'Pause Timer' : 'Start Focus'}
                </button>
                <button
                  onClick={resetTimer}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* 2. Ambient Sounds Quick Picker */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-700 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-indigo-600" /> Ambient Sound
                </span>
                <button
                  onClick={toggleAmbientPlaying}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isAmbientPlaying ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isAmbientPlaying ? 'Playing' : 'Off'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {(['none', 'rain', 'brown_noise', 'white_noise', 'library', 'binaural_40hz', 'campfire'] as AmbientSoundType[]).map((snd) => (
                  <button
                    key={snd}
                    onClick={() => setAmbientSound(snd)}
                    className={`py-1 px-2 rounded-xl text-[10px] font-bold capitalize truncate transition-all cursor-pointer ${
                      ambientSound === snd
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {snd.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {ambientSound !== 'none' && (
                <div className="flex items-center gap-2 pt-1">
                  <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ambientVolume}
                    onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[10px] font-mono text-slate-500">
                    {Math.round(ambientVolume * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* 3. Quick Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Zen Mode */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  openZen();
                }}
                className="flex items-center gap-2 p-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-all cursor-pointer"
              >
                <Maximize2 className="w-4 h-4 text-indigo-600" />
                <div className="text-left">
                  <p className="font-bold">Zen Mode</p>
                  <p className="text-[9px] text-indigo-500 font-normal">Fullscreen focus</p>
                </div>
              </button>

              {/* Analytics */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  openAnalytics();
                }}
                className="flex items-center gap-2 p-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition-all cursor-pointer"
              >
                <BarChart2 className="w-4 h-4 text-purple-600" />
                <div className="text-left">
                  <p className="font-bold">Analytics</p>
                  <p className="text-[9px] text-purple-500 font-normal">Study stats & history</p>
                </div>
              </button>

              {/* Mini PiP Toggle */}
              <button
                onClick={() => setIsMiniWidgetVisible(!isMiniWidgetVisible)}
                className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer"
              >
                <Timer className="w-4 h-4 text-slate-600" />
                <div className="text-left">
                  <p className="font-bold">Floating PiP</p>
                  <p className="text-[9px] text-slate-500 font-normal">
                    {isMiniWidgetVisible ? 'Visible pill' : 'Hidden pill'}
                  </p>
                </div>
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 transition-all cursor-pointer"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-700" />}
                <div className="text-left">
                  <p className="font-bold">Theme Mode</p>
                  <p className="text-[9px] text-amber-700 font-normal">
                    {isDarkMode ? 'Dark (Night)' : 'Light (Day)'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
