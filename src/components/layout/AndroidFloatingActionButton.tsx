import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useFocus } from '../../context/FocusContext';
import { triggerHaptic } from '../../utils/androidBridge';
import {
  Sparkles,
  Plus,
  X,
  Search,
  Camera,
  Layers,
  Clock,
  Brain,
} from 'lucide-react';

interface AndroidFloatingActionButtonProps {
  onOpenSearch?: () => void;
}

export const AndroidFloatingActionButton: React.FC<AndroidFloatingActionButtonProps> = ({
  onOpenSearch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setActiveTab } = useApp();
  const { openZen } = useFocus();

  const toggleOpen = () => {
    triggerHaptic(isOpen ? 'light' : 'medium');
    setIsOpen(!isOpen);
  };

  const handleAction = (callback: () => void) => {
    triggerHaptic('selection');
    setIsOpen(false);
    callback();
  };

  return (
    <div className="md:hidden fixed right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+76px)] z-40 select-none">
      {/* Backdrop when speed dial is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30 transition-opacity"
        />
      )}

      {/* Speed Dial Menu Items */}
      {isOpen && (
        <div className="relative z-40 flex flex-col items-end gap-3 mb-3 animate-in slide-in-from-bottom-5 fade-in duration-200">
          {/* Action 1: Ask AI Doubt */}
          <div className="flex items-center gap-2">
            <span className="bg-slate-900/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
              Ask AI Doubt
            </span>
            <button
              onClick={() => handleAction(() => setActiveTab('tutor'))}
              className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 active:scale-95 transition-transform"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
            </button>
          </div>

          {/* Action 2: Global Search */}
          <div className="flex items-center gap-2">
            <span className="bg-slate-900/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
              Global AI Search
            </span>
            <button
              onClick={() => handleAction(() => {
                if (onOpenSearch) onOpenSearch();
                else {
                  document.getElementById('navbar-search-btn')?.click();
                }
              })}
              className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 active:scale-95 transition-transform"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Action 3: Flashcards */}
          <div className="flex items-center gap-2">
            <span className="bg-slate-900/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
              Active Recall Cards
            </span>
            <button
              onClick={() => handleAction(() => setActiveTab('flashcards'))}
              className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 active:scale-95 transition-transform"
            >
              <Brain className="w-5 h-5" />
            </button>
          </div>

          {/* Action 4: Pomodoro Focus */}
          <div className="flex items-center gap-2">
            <span className="bg-slate-900/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
              Pomodoro Focus
            </span>
            <button
              onClick={() => handleAction(() => openZen())}
              className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform"
            >
              <Clock className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Primary Floating Action Button (Material 3) */}
      <button
        id="android-main-fab"
        aria-label="Quick AI actions"
        onClick={toggleOpen}
        className={`relative z-40 w-14 h-14 rounded-3xl flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer active:scale-90 ${
          isOpen
            ? 'bg-slate-800 text-white rotate-45 shadow-slate-900/40'
            : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-indigo-500/35 hover:scale-105'
        }`}
      >
        {isOpen ? (
          <Plus className="w-7 h-7" />
        ) : (
          <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
        )}
      </button>
    </div>
  );
};
