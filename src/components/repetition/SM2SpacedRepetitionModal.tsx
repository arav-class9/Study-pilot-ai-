import React, { useState } from 'react';
import { Brain, RotateCcw, CheckCircle2, AlertCircle, Calendar, Sparkles, X, ChevronRight, Award } from 'lucide-react';
import { SM2Flashcard, getStoredSM2Cards, calculateSM2, saveSM2Card } from '../../services/spacedRepetition';

interface SM2SpacedRepetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SM2SpacedRepetitionModal: React.FC<SM2SpacedRepetitionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [cards, setCards] = useState<SM2Flashcard[]>(() => getStoredSM2Cards());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [newFront, setNewFront] = useState<string>('');
  const [newBack, setNewBack] = useState<string>('');
  const [newTopic, setNewTopic] = useState<string>('Science Concept');
  const [isAddingCard, setIsAddingCard] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentCard = cards[currentIndex];

  const handleGrade = (grade: number) => {
    if (!currentCard) return;

    const result = calculateSM2(grade, currentCard);
    const updatedCard: SM2Flashcard = {
      ...currentCard,
      repetitionCount: result.repetitionCount,
      intervalDays: result.intervalDays,
      easeFactor: result.easeFactor,
      lastReviewedDate: new Date().toISOString().split('T')[0],
      nextReviewDate: result.nextReviewDate,
      history: [
        ...currentCard.history,
        { date: new Date().toISOString().split('T')[0], grade },
      ],
    };

    saveSM2Card(updatedCard);
    const updatedList = cards.map((c) => (c.id === updatedCard.id ? updatedCard : c));
    setCards(updatedList);
    setShowAnswer(false);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleAddCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: SM2Flashcard = {
      id: `sm2-custom-${Date.now()}`,
      front: newFront.trim(),
      back: newBack.trim(),
      topicName: newTopic,
      subject: 'Custom',
      chapter: 'My Flashcards',
      repetitionCount: 0,
      intervalDays: 1,
      easeFactor: 2.5,
      lastReviewedDate: new Date().toISOString().split('T')[0],
      nextReviewDate: new Date().toISOString().split('T')[0],
      history: [],
    };

    saveSM2Card(newCard);
    setCards([...cards, newCard]);
    setNewFront('');
    setNewBack('');
    setIsAddingCard(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Adaptive Memory Engine
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                  SuperMemo SM-2
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Spaced Repetition Flashcards
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Card Counter */}
        {cards.length > 0 && (
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>
              Card {currentIndex + 1} of {cards.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Ease Factor: {currentCard?.easeFactor || 2.5}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Interval: {currentCard?.intervalDays || 1}d
              </span>
            </div>
          </div>
        )}

        {/* Add Flashcard Form Toggle */}
        {isAddingCard ? (
          <form onSubmit={handleAddCustomCard} className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Add Custom SM-2 Flashcard
            </h3>
            <input
              type="text"
              placeholder="Topic Name (e.g. Chemical Reactions)"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
            />
            <textarea
              placeholder="Question / Front of card..."
              value={newFront}
              onChange={(e) => setNewFront(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
            <textarea
              placeholder="Answer / Back of card..."
              value={newBack}
              onChange={(e) => setNewBack(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAddingCard(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700"
              >
                Save Flashcard
              </button>
            </div>
          </form>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Topic: <strong className="text-slate-900 dark:text-white">{currentCard?.topicName}</strong>
            </span>
            <button
              onClick={() => setIsAddingCard(true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              + Add Custom Card
            </button>
          </div>
        )}

        {/* Active Card Container */}
        {cards.length > 0 && currentCard ? (
          <div className="min-h-[220px] p-6 rounded-3xl bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 border-2 border-indigo-200/80 dark:border-indigo-900/60 shadow-lg flex flex-col justify-between space-y-4">
            {/* Front Side */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Front (Question)
              </span>
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentCard.front}
              </p>
            </div>

            {/* Back Side (Answer) */}
            {showAnswer ? (
              <div className="space-y-2 pt-4 border-t border-indigo-100 dark:border-indigo-900/80 animate-fadeIn">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Back (Verified Answer)
                </span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed bg-white/80 dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50">
                  {currentCard.back}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Show Answer (Flip Card)</span>
              </button>
            )}

            {/* SM-2 Rating Buttons (0 to 5) */}
            {showAnswer && (
              <div className="space-y-2 pt-2">
                <div className="text-center text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Rate Recall Quality (SuperMemo Grade 0-5)
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  <button
                    onClick={() => handleGrade(0)}
                    className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer"
                    title="0: Complete Blackout"
                  >
                    <span>0</span>
                    <span className="text-[8px] font-normal">Blackout</span>
                  </button>
                  <button
                    onClick={() => handleGrade(1)}
                    className="p-2 rounded-xl bg-orange-100 hover:bg-orange-200 dark:bg-orange-950 dark:hover:bg-orange-900 text-orange-700 dark:text-orange-300 font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer"
                    title="1: Incorrect, Remembered Answer"
                  >
                    <span>1</span>
                    <span className="text-[8px] font-normal">Wrong</span>
                  </button>
                  <button
                    onClick={() => handleGrade(2)}
                    className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer"
                    title="2: Incorrect, Answer Easy"
                  >
                    <span>2</span>
                    <span className="text-[8px] font-normal">Hard</span>
                  </button>
                  <button
                    onClick={() => handleGrade(3)}
                    className="p-2 rounded-xl bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-950 dark:hover:bg-yellow-900 text-yellow-800 dark:text-yellow-300 font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer"
                    title="3: Correct with Difficulty"
                  >
                    <span>3</span>
                    <span className="text-[8px] font-normal">Pass</span>
                  </button>
                  <button
                    onClick={() => handleGrade(4)}
                    className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer"
                    title="4: Correct after Hesitation"
                  >
                    <span>4</span>
                    <span className="text-[8px] font-normal">Good</span>
                  </button>
                  <button
                    onClick={() => handleGrade(5)}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer shadow-md"
                    title="5: Perfect Recall"
                  >
                    <span>5</span>
                    <span className="text-[8px] font-normal">Perfect</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 font-medium text-sm">
            No flashcards available. Add a card above to get started!
          </div>
        )}
      </div>
    </div>
  );
};
