import React, { useState, useEffect } from 'react';
import { NCERTRevisionItem, NCERTChapter } from '../../types/ncert';
import { NCERTService } from '../../services/ncertService';
import {
  X,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  Award,
  Zap,
} from 'lucide-react';

interface NCERTRevisionDeckProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  chapter?: NCERTChapter;
}

export const NCERTRevisionDeck: React.FC<NCERTRevisionDeckProps> = ({
  isOpen,
  onClose,
  userId,
  chapter,
}) => {
  const [deck, setDeck] = useState<NCERTRevisionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const items = NCERTService.getRevisionDeck(userId, chapter?.id);
      setDeck(items);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [isOpen, userId, chapter?.id]);

  if (!isOpen) return null;

  const currentItem = deck[currentIndex];

  const handleRate = (mastered: boolean) => {
    if (!currentItem) return;
    NCERTService.updateRevisionItem(userId, currentItem.id, mastered);

    const updatedDeck = [...deck];
    updatedDeck[currentIndex] = {
      ...currentItem,
      mastered,
      reviewCount: currentItem.reviewCount + 1,
    };
    setDeck(updatedDeck);

    // Advance to next card
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((c) => c + 1);
      setIsFlipped(false);
    } else {
      setIsFlipped(false);
    }
  };

  const masteredCount = deck.filter((d) => d.mastered).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6">
        {/* Top Header */}
        <div className="bg-linear-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <RotateCcw className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">NCERT Revision Mode</h3>
              <p className="text-xs text-emerald-100">
                {chapter ? `${chapter.title} • Spaced Repetition Flashcards` : 'All Bookmarked & Missed Questions'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {deck.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <BookMarked className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Your Revision Deck is Clear!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                When you attempt page quizzes, bookmark tricky questions or missed concepts to practice them here with active recall.
              </p>
            </div>
          ) : currentItem ? (
            <div className="space-y-4">
              {/* Progress & Card Index */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <span>
                  Card {currentIndex + 1} of {deck.length}
                </span>
                <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Award className="w-4 h-4" />
                  <span>{masteredCount} Mastered</span>
                </span>
              </div>

              {/* Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative min-h-[260px] p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-linear-to-b from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900 shadow-md cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600 transition-all flex flex-col justify-between"
              >
                {!isFlipped ? (
                  /* Front of Card: Question & Concept */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {currentItem.conceptTag || 'NCERT Concept'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Page {currentItem.pageNumber}
                      </span>
                    </div>

                    <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                      {currentItem.question}
                    </p>

                    <div className="text-center pt-6 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center space-x-1">
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Click card to reveal NCERT answer &amp; explanation</span>
                    </div>
                  </div>
                ) : (
                  /* Back of Card: Correct Answer & Explanation */
                  <div className="space-y-3 animate-fadeIn">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Correct NCERT Answer:</span>
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl font-bold text-sm text-emerald-900 dark:text-emerald-200">
                      {currentItem.options[currentItem.correctAnswerIndex]}
                    </div>

                    <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                      <strong className="block text-slate-900 dark:text-slate-100 mb-1">
                        Curriculum Reference:
                      </strong>
                      {currentItem.explanation}
                    </div>

                    <div className="text-center pt-2 text-[11px] text-slate-400">
                      Click anywhere on the card to flip back
                    </div>
                  </div>
                )}
              </div>

              {/* Rating Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleRate(false)}
                  className="py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Needs Practice</span>
                </button>

                <button
                  onClick={() => handleRate(true)}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mastered</span>
                </button>
              </div>

              {/* Navigation Between Cards */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    if (currentIndex > 0) {
                      setCurrentIndex((c) => c - 1);
                      setIsFlipped(false);
                    }
                  }}
                  disabled={currentIndex === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => {
                    if (currentIndex < deck.length - 1) {
                      setCurrentIndex((c) => c + 1);
                      setIsFlipped(false);
                    }
                  }}
                  disabled={currentIndex === deck.length - 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
