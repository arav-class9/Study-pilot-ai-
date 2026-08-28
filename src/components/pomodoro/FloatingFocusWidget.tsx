import React, { useState } from 'react';
import { useFocus } from '../../context/FocusContext';
import {
  Play,
  Pause,
  Maximize2,
  Volume2,
  VolumeX,
  Flame,
  Brain,
  Coffee,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

export const FloatingFocusWidget: React.FC = () => {
  const {
    isRunning,
    timeLeft,
    mode,
    selectedSubject,
    toggleTimer,
    openZen,
    openAnalytics,
    ambientSound,
    toggleAmbientPlaying,
    isAmbientPlaying,
    isMiniWidgetVisible,
    setIsMiniWidgetVisible,
  } = useFocus();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Only show if user hasn't explicitly dismissed it and either running or in an active session
  if (!isMiniWidgetVisible) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const modeIcons = {
    focus: Flame,
    deep: Brain,
    short_break: Coffee,
    long_break: Coffee,
  };

  const ModeIcon = modeIcons[mode];

  return (
    <div
      id="floating-pomodoro-pill"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 animate-slideUp select-none"
    >
      <div className="bg-slate-950/90 hover:bg-slate-950 text-white rounded-2xl p-2.5 sm:p-3 border border-indigo-500/30 shadow-2xl backdrop-blur-md flex items-center gap-3 transition-all">
        {/* Pulsing indicator & Subject icon */}
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center ${
              mode === 'focus'
                ? 'bg-indigo-600'
                : mode === 'deep'
                ? 'bg-purple-600'
                : 'bg-emerald-600'
            }`}
          >
            <ModeIcon className="w-3.5 h-3.5 text-white" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase text-indigo-300 tracking-wider">
                {selectedSubject}
              </span>
              <span className="text-base font-mono font-black text-white leading-none">
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
          <button
            onClick={toggleTimer}
            className={`p-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
            title={isRunning ? 'Pause' : 'Start'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {ambientSound !== 'none' && (
            <button
              onClick={toggleAmbientPlaying}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isAmbientPlaying ? 'Mute Ambience' : 'Play Ambience'}
            >
              {isAmbientPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
            </button>
          )}

          <button
            onClick={openZen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Open Fullscreen Zen Focus"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};
