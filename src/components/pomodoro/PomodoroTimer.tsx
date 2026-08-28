import React, { useState, useMemo } from 'react';
import { useFocus } from '../../context/FocusContext';
import { AmbientSoundControls } from './AmbientSoundControls';
import { FocusTasks } from './FocusTasks';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Coffee,
  Brain,
  Timer,
  CheckCircle2,
  Flame,
  Settings2,
  BarChart2,
  BookOpen,
  ListTodo,
  Music,
} from 'lucide-react';
import { SubjectId, PomodoroMode } from '../../types';

export const PomodoroTimer: React.FC = () => {
  const {
    mode,
    timeLeft,
    isRunning,
    selectedSubject,
    completedSessions,
    totalFocusedMinutes,
    customDurations,
    progressPercent,
    toggleTimer,
    resetTimer,
    setMode,
    setSelectedSubject,
    setCustomDuration,
    soundChimeEnabled,
    setSoundChimeEnabled,
    openZen,
    openAnalytics,
    tasks,
  } = useFocus();

  const [activeTab, setActiveTab] = useState<'timer' | 'sounds' | 'tasks'>('timer');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const subjectList: { id: SubjectId; label: string }[] = useMemo(
    () => [
      { id: 'science', label: 'Science' },
      { id: 'math', label: 'Mathematics' },
      { id: 'english', label: 'English' },
      { id: 'social_science', label: 'Social Science' },
      { id: 'physics', label: 'Physics' },
      { id: 'chemistry', label: 'Chemistry' },
      { id: 'biology', label: 'Biology' },
    ],
    []
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const modeDetails = {
    focus: {
      name: 'Focus Session',
      color: 'text-indigo-400',
      bar: 'bg-indigo-600',
      icon: Flame,
    },
    deep: {
      name: 'Deep Study',
      color: 'text-purple-400',
      bar: 'bg-purple-600',
      icon: Brain,
    },
    short_break: {
      name: 'Short Break',
      color: 'text-emerald-400',
      bar: 'bg-emerald-500',
      icon: Coffee,
    },
    long_break: {
      name: 'Long Break',
      color: 'text-sky-400',
      bar: 'bg-sky-500',
      icon: Coffee,
    },
  };

  const currentModeInfo = modeDetails[mode];
  const ModeIcon = currentModeInfo.icon;
  const completedTaskCount = tasks.filter((t) => t.completed).length;

  return (
    <div
      id="pomodoro-sidebar-widget"
      className="mt-3 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-3.5 border border-slate-700/80 shadow-md relative overflow-hidden transition-all duration-200"
    >
      {/* Background subtle glow */}
      <div
        className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 ${
          mode === 'focus' ? 'bg-indigo-500' : mode === 'deep' ? 'bg-purple-500' : 'bg-emerald-500'
        }`}
      />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-700/60">
        <div className="flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider text-indigo-200">
            Study Timer
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Analytics Chart Modal */}
          <button
            onClick={openAnalytics}
            title="View Study Analytics"
            className="p-1 text-slate-400 hover:text-indigo-300 rounded-md hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Zen Mode */}
          <button
            onClick={openZen}
            title="Launch Fullscreen Zen Focus"
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Audio Chime toggle */}
          <button
            onClick={() => setSoundChimeEnabled(!soundChimeEnabled)}
            title={soundChimeEnabled ? 'Mute Chimes' : 'Unmute Chimes'}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            {soundChimeEnabled ? (
              <Volume2 className="w-3 h-3" />
            ) : (
              <VolumeX className="w-3 h-3 text-rose-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mode Selection Pills */}
      <div className="grid grid-cols-3 gap-1 mb-2.5">
        <button
          onClick={() => setMode('focus')}
          className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all text-center truncate cursor-pointer ${
            mode === 'focus'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
          }`}
        >
          25m Focus
        </button>

        <button
          onClick={() => setMode('deep')}
          className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all text-center truncate cursor-pointer ${
            mode === 'deep'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
          }`}
        >
          50m Deep
        </button>

        <button
          onClick={() => setMode('short_break')}
          className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all text-center truncate cursor-pointer ${
            mode === 'short_break' || mode === 'long_break'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
          }`}
        >
          Break
        </button>
      </div>

      {/* Main Timer Display */}
      <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-700/60 mb-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <ModeIcon className={`w-3 h-3 ${currentModeInfo.color}`} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              {currentModeInfo.name}
            </span>
          </div>
          <div className="text-2xl font-mono font-black tracking-tight text-white">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTimer}
            id="pomodoro-toggle-btn"
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-sm transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
            title={isRunning ? 'Pause Timer' : 'Start Focus'}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={resetTimer}
            title="Reset Timer"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2.5">
        <div
          className={`h-full transition-all duration-300 ${currentModeInfo.bar}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Quick Tool Sub-Tabs (Timer / Ambient Sounds / Tasks) */}
      <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-700/50 mb-2.5">
        <button
          onClick={() => setActiveTab('timer')}
          className={`py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'timer' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Timer className="w-3 h-3" />
          <span>Timer</span>
        </button>

        <button
          onClick={() => setActiveTab('sounds')}
          className={`py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'sounds' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Music className="w-3 h-3 text-indigo-400" />
          <span>Sounds</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'tasks' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ListTodo className="w-3 h-3 text-emerald-400" />
          <span>Goals ({completedTaskCount})</span>
        </button>
      </div>

      {/* 1. Timer Subject & Presets View */}
      {activeTab === 'timer' && (
        <div className="space-y-2.5 animate-fadeIn">
          {/* Subject Focus Tagger */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-indigo-400" />
              <span>Studying Subject:</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as SubjectId)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              {subjectList.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Custom Time presets */}
          <div>
            <span className="block text-[9px] font-bold uppercase text-slate-400 mb-1">
              Quick Focus Presets:
            </span>
            <div className="grid grid-cols-4 gap-1">
              {[15, 25, 30, 45].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    setCustomDuration('focus', mins * 60);
                    setMode('focus');
                  }}
                  className="py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold text-center transition-colors cursor-pointer"
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Ambient Sounds View */}
      {activeTab === 'sounds' && (
        <div className="animate-fadeIn">
          <AmbientSoundControls compact={true} />
        </div>
      )}

      {/* 3. Session Micro-Goals View */}
      {activeTab === 'tasks' && (
        <div className="animate-fadeIn">
          <FocusTasks />
        </div>
      )}

      {/* Bottom Stats Mini Row */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-2 mt-2 border-t border-slate-700/60">
        <span className="flex items-center gap-1">
          <span>🍅</span>
          <span>{completedSessions} done today</span>
        </span>
        <button
          onClick={openAnalytics}
          className="text-indigo-300 hover:text-indigo-200 font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>{totalFocusedMinutes}m total</span>
          <span className="text-[9px]">📊</span>
        </button>
      </div>
    </div>
  );
};
