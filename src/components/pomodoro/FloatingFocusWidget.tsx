import React, { useState } from 'react';
import { useFocus } from '../../context/FocusContext';
import { triggerHaptic } from '../../utils/androidBridge';
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
  Sparkles,
} from 'lucide-react';

export const FloatingFocusWidget: React.FC = () => {
  const {
    isRunning,
    timeLeft,
    mode,
    selectedSubject,
    toggleTimer,
    openZen,
    ambientSound,
    toggleAmbientPlaying,
    isAmbientPlaying,
    isMiniWidgetVisible,
    setIsMiniWidgetVisible,
  } = useFocus();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Only show if user hasn't explicitly dismissed it
  if (!isMiniWidgetVisible) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const modeConfig = {
    focus: {
      label: 'Focus',
      icon: Flame,
      color: 'from-amber-500 to-orange-600',
      glow: 'shadow-orange-500/20 ring-orange-500/30',
      badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    },
    deep: {
      label: 'Deep Flow',
      icon: Brain,
      color: 'from-indigo-600 to-purple-600',
      glow: 'shadow-indigo-500/20 ring-indigo-500/30',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    short_break: {
      label: 'Short Break',
      icon: Coffee,
      color: 'from-emerald-600 to-teal-600',
      glow: 'shadow-emerald-500/20 ring-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    long_break: {
      label: 'Long Rest',
      icon: Coffee,
      color: 'from-teal-600 to-cyan-600',
      glow: 'shadow-teal-500/20 ring-teal-500/30',
      badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    },
  };

  const currentConfig = modeConfig[mode] || modeConfig.focus;
  const ModeIcon = currentConfig.icon;

  const handleToggleTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    toggleTimer();
  };

  const handleZenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    openZen();
  };

  return (
    <div
      id="floating-pomodoro-pill"
      className="fixed left-3 sm:left-6 md:left-auto md:right-6 bottom-[calc(env(safe-area-inset-bottom,0px)+78px)] md:bottom-6 z-30 select-none animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div
        className={`relative group bg-slate-950/95 text-white rounded-2xl p-2 sm:p-2.5 border border-slate-800 hover:border-indigo-500/60 shadow-2xl backdrop-blur-xl flex items-center gap-2.5 transition-all duration-300 ring-1 ${
          isRunning ? `${currentConfig.glow} ring-2 ring-offset-1 ring-offset-slate-950` : 'ring-white/10'
        }`}
      >
        {/* Pulsing indicator & Timer Info */}
        <div
          className="flex items-center gap-2.5 cursor-pointer touch-manipulation active:scale-95 transition-transform"
          onClick={handleZenClick}
          title="Tap to open Fullscreen Zen Focus"
        >
          {/* Animated Glow / Icon Capsule */}
          <div className="relative">
            {isRunning && (
              <span className="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 opacity-70 blur-xs animate-pulse" />
            )}
            <div
              className={`relative w-8 h-8 rounded-xl bg-gradient-to-tr ${currentConfig.color} flex items-center justify-center shadow-md`}
            >
              <ModeIcon className="w-4 h-4 text-white" />
            </div>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col pr-1">
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border tracking-wider ${currentConfig.badge}`}>
                  {selectedSubject || currentConfig.label}
                </span>
                {isRunning && (
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
                  </span>
                )}
              </div>
              <span className="text-base sm:text-lg font-mono font-black tracking-tight text-white leading-tight drop-shadow-sm">
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-1 border-l border-slate-800/80 pl-2">
          {/* Play/Pause Button - Notable Touch Target */}
          <button
            onClick={handleToggleTimer}
            className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center transition-all duration-200 cursor-pointer touch-manipulation active:scale-90 ${
              isRunning
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
            }`}
            aria-label={isRunning ? 'Pause Timer' : 'Start Timer'}
          >
            {isRunning ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 ml-0.5 fill-white" />}
          </button>

          {/* Ambient Sound Toggle */}
          {ambientSound !== 'none' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('selection');
                toggleAmbientPlaying();
              }}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer touch-manipulation"
              title={isAmbientPlaying ? 'Mute Ambience' : 'Play Ambience'}
            >
              {isAmbientPlaying ? <Volume2 className="w-3.5 h-3.5 text-indigo-300" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
            </button>
          )}

          {/* Fullscreen Zen Mode Button */}
          <button
            onClick={handleZenClick}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer touch-manipulation"
            title="Open Zen Focus Mode"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Collapse / Expand */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('selection');
              setIsCollapsed(!isCollapsed);
            }}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Timer' : 'Collapse Timer'}
          >
            {isCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Dismiss Widget */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              setIsMiniWidgetVisible(false);
            }}
            className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer ml-0.5"
            title="Hide timer pill"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
