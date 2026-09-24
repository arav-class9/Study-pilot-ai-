import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Zap,
  FileText,
  List,
  Layers,
  Code2,
  Map,
  FileCode2,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Brain,
  Video,
  HelpCircle,
} from 'lucide-react';
import { NoteType, TopicWorkspaceItem } from '../../types/workspace';

interface RightDockedPanelProps {
  topic: TopicWorkspaceItem;
  activeNoteType: NoteType;
  isGeneratingNotes: boolean;
  onGenerateNotes: (type: NoteType) => void;
  onNavigateSection: (sec: 'learn' | 'notes' | 'explain' | 'practice' | 'recall' | 'revision') => void;
}

export const RightDockedPanel: React.FC<RightDockedPanelProps> = ({
  topic,
  activeNoteType,
  isGeneratingNotes,
  onGenerateNotes,
  onNavigateSection,
}) => {
  // Study Timer State (25-min Pomodoro)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (isSoundOn) {
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play().catch(() => {});
            } catch (e) {}
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isSoundOn]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(25 * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatButtons: { type: NoteType; label: string; icon: any; color: string }[] = [
    { type: 'detailed', label: 'Detailed Notes', icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400' },
    { type: 'short', label: 'Short Notes', icon: Zap, color: 'text-amber-600 dark:text-amber-400' },
    { type: 'exam', label: 'Exam Notes', icon: Sparkles, color: 'text-purple-600 dark:text-purple-400' },
    { type: 'definitions', label: 'Important Definitions', icon: FileText, color: 'text-blue-600 dark:text-blue-400' },
    { type: 'key_points', label: 'Key Points', icon: List, color: 'text-emerald-600 dark:text-emerald-400' },
    { type: 'examples', label: 'Examples', icon: Layers, color: 'text-teal-600 dark:text-teal-400' },
    { type: 'formulas', label: 'Formulas', icon: Code2, color: 'text-rose-600 dark:text-rose-400' },
    { type: 'concept_map', label: 'Concept Map', icon: Map, color: 'text-cyan-600 dark:text-cyan-400' },
    { type: 'summary', label: 'Summarize', icon: FileCode2, color: 'text-orange-600 dark:text-orange-400' },
  ];

  return (
    <aside className="w-80 shrink-0 space-y-5 hidden lg:block sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar pl-1">
      {/* Docked AI Notes Format Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-amber-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-amber-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              AI Notes Formats
            </h3>
          </div>
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            1-Click Generate
          </span>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Click any format to fetch & render comprehensive AI notes for <span className="font-bold text-slate-700 dark:text-slate-200">{topic.topicName}</span>.
        </p>

        <div className="space-y-1.5">
          {formatButtons.map((btn) => {
            const Icon = btn.icon;
            const isSelected = activeNoteType === btn.type;
            return (
              <button
                key={btn.type}
                onClick={() => onGenerateNotes(btn.type)}
                disabled={isGeneratingNotes}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold border transition-all text-left ${
                  isSelected
                    ? 'bg-amber-100/90 dark:bg-slate-800 border-amber-400 dark:border-amber-500 text-slate-900 dark:text-amber-200 shadow-2xs ring-2 ring-amber-400/20'
                    : 'bg-amber-50/40 dark:bg-slate-950/50 border-amber-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100/60 dark:hover:bg-slate-800'
                } disabled:opacity-50`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${btn.color}`} />
                  <span className="truncate">{btn.label}</span>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Docked Study Timer */}
      <div className="bg-gradient-to-br from-amber-900 to-indigo-950 text-white rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-200">
              Focus Study Timer
            </h4>
          </div>
          <button
            onClick={() => setIsSoundOn(!isSoundOn)}
            className="text-amber-300 hover:text-white p-1"
            title={isSoundOn ? 'Mute Sound' : 'Enable Sound'}
          >
            {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Display */}
        <div className="text-center py-2">
          <div className="text-3xl font-black font-mono tracking-tight text-white drop-shadow-sm">
            {formatTime(secondsLeft)}
          </div>
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
            {isRunning ? '🔥 Active Study Session' : 'Paused Focus Cycle'}
          </span>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={toggleTimer}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            onClick={resetTimer}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            title="Reset to 25:00"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AI Assistant Quick Navigation Shortcuts */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-amber-200/80 dark:border-slate-800 shadow-sm space-y-2.5">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 pb-1 border-b border-amber-100 dark:border-slate-800">
          Quick Study Actions
        </h4>

        <button
          onClick={() => onNavigateSection('explain')}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200/60 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-amber-100/70 transition-all"
        >
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Feynman Self-Explanation</span>
          </div>
          <span className="text-[10px] text-purple-700 dark:text-purple-300 font-black">AI Grade</span>
        </button>

        <button
          onClick={() => onNavigateSection('practice')}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200/60 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-amber-100/70 transition-all"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Practice Questions</span>
          </div>
          <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-black">Quiz Bank</span>
        </button>

        <button
          onClick={() => onNavigateSection('recall')}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200/60 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-amber-100/70 transition-all"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Active Recall Flashcards</span>
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-black">Spaced</span>
        </button>
      </div>
    </aside>
  );
};
