import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, RotateCcw, Award, ArrowRight, Zap, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RevisionQueueItem } from '../../types';

interface RevisionSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RevisionSessionModal: React.FC<RevisionSessionModalProps> = ({ isOpen, onClose }) => {
  const { revisionQueue, completeRevisionItem } = useApp();
  const dueItems = revisionQueue.filter((item) => item.status === 'due' || new Date(item.scheduledDate) <= new Date());
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  if (!isOpen) return null;

  const currentItem: RevisionQueueItem | undefined = dueItems[currentIndex];

  const handleRatePerformance = (score: number) => {
    if (!currentItem) return;

    completeRevisionItem(currentItem.id, score);

    if (currentIndex + 1 < dueItems.length) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      setSessionCompleted(true);
    }
  };

  return (
    <div
      id="revision-session-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="revision-session-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-indigo-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Spaced Repetition Active Drill</h3>
              <p className="text-xs text-indigo-200">
                {sessionCompleted ? 'Session Complete' : `Reviewing topic ${currentIndex + 1} of ${dueItems.length || 1}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-indigo-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {dueItems.length === 0 || sessionCompleted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">All Revisions Completed!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  You've reviewed all scheduled topics for today. Spaced repetition intervals have been updated to cement your long-term memory.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 font-bold text-xs px-3.5 py-1.5 rounded-full">
                <Zap className="w-4 h-4 fill-indigo-600" />
                <span>+50 XP Earned</span>
              </div>
              <div>
                <button
                  onClick={onClose}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-md"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : currentItem ? (
            <div className="space-y-5">
              {/* Topic meta */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  {currentItem.chapterName}
                </span>
                <span className="text-slate-500 font-medium">
                  Review #{currentItem.reviewCount + 1} • Interval: {currentItem.intervalDays}d
                </span>
              </div>

              {/* Flashcard Prompt */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 min-h-[160px] flex flex-col justify-center">
                <p className="text-xs font-bold uppercase text-slate-500">Target Concept</p>
                <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {currentItem.topicName}
                </h4>

                {!showAnswer ? (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="self-start mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Show Recall Breakdown & Formula</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="pt-3 border-t border-slate-200 text-xs text-slate-700 space-y-1.5 animate-in fade-in">
                    <p className="font-semibold text-slate-900">Key Memory Anchors:</p>
                    <p className="text-slate-600">
                      Verify core definitions, SI units, and sign conventions for this topic.
                    </p>
                  </div>
                )}
              </div>

              {/* Self-Rating / Performance grading */}
              {showAnswer && (
                <div className="space-y-2 animate-in fade-in">
                  <p className="text-xs font-bold text-slate-600 text-center">
                    How well did you recall this concept?
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleRatePerformance(40)}
                      className="py-2.5 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs rounded-xl cursor-pointer transition-all"
                    >
                      Struggled (Reset 1d)
                    </button>
                    <button
                      onClick={() => handleRatePerformance(70)}
                      className="py-2.5 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs rounded-xl cursor-pointer transition-all"
                    >
                      Good (Keep interval)
                    </button>
                    <button
                      onClick={() => handleRatePerformance(95)}
                      className="py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl cursor-pointer transition-all"
                    >
                      Mastered (+Next interval)
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
