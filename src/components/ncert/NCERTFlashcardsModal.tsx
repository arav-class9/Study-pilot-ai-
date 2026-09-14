import React, { useState, useMemo } from 'react';
import {
  X,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  Shuffle,
  Volume2,
} from 'lucide-react';
import { NCERTPageContent, NCERTChapter } from '../../types/ncert';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  tag: string;
  hint?: string;
}

interface NCERTFlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: NCERTChapter;
  pageContent: NCERTPageContent | null;
  pageNumber: number;
}

export const NCERTFlashcardsModal: React.FC<NCERTFlashcardsModalProps> = ({
  isOpen,
  onClose,
  chapter,
  pageContent,
  pageNumber,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set());
  const [isFinished, setIsFinished] = useState(false);

  // Generate flashcards from page content
  const initialCards = useMemo(() => {
    const cards: Flashcard[] = [];

    if (!pageContent) {
      cards.push({
        id: 'fc_default_1',
        front: `What is the core focus of ${chapter.title}?`,
        back: chapter.description || 'Core board examination syllabus topic.',
        tag: 'Overview',
      });
      return cards;
    }

    // 1. Vocabulary
    if (pageContent.vocabulary && pageContent.vocabulary.length > 0) {
      pageContent.vocabulary.forEach((v, idx) => {
        cards.push({
          id: `fc_vocab_${idx}`,
          front: `Define: ${v.term}`,
          back: v.definition,
          tag: 'NCERT Definition',
        });
      });
    }

    // 2. Formulas / Reactions
    if (pageContent.formulas && pageContent.formulas.length > 0) {
      pageContent.formulas.forEach((f, idx) => {
        cards.push({
          id: `fc_formula_${idx}`,
          front: `Chemical Equation / Formula #${idx + 1} on Page ${pageNumber}:`,
          back: f,
          tag: 'Equation / Law',
          hint: 'Remember to state phase states (s, l, g, aq) and balancing.',
        });
      });
    }

    // 3. Activities
    if (pageContent.activities && pageContent.activities.length > 0) {
      pageContent.activities.forEach((act, idx) => {
        cards.push({
          id: `fc_act_${idx}`,
          front: `${act.activityNumber}: ${act.title}\nWhat is the observed conclusion?`,
          back: `Observation: ${act.observation}\n\nConclusion: ${act.conclusion}`,
          tag: 'Activity & Experiment',
        });
      });
    }

    // 4. In-text questions
    if (pageContent.inTextQuestions && pageContent.inTextQuestions.length > 0) {
      pageContent.inTextQuestions.forEach((q, idx) => {
        cards.push({
          id: `fc_itq_${idx}`,
          front: `NCERT Question: ${q.question}`,
          back: q.answerHint || 'Key Board Exam Answer Point',
          tag: 'In-Text Question',
        });
      });
    }

    // 5. Key concepts
    if (pageContent.keyConcepts && pageContent.keyConcepts.length > 0) {
      pageContent.keyConcepts.slice(0, 3).forEach((kc, idx) => {
        cards.push({
          id: `fc_kc_${idx}`,
          front: `Key Concept #${idx + 1}: ${pageContent.sectionTitle}`,
          back: kc,
          tag: 'Core Concept',
        });
      });
    }

    return cards.length > 0
      ? cards
      : [
          {
            id: 'fc_fallback_1',
            front: `Chapter Focus: ${chapter.title}`,
            back: chapter.description,
            tag: 'Chapter',
          },
        ];
  }, [pageContent, chapter, pageNumber]);

  const [cards, setCards] = useState<Flashcard[]>(initialCards);

  // Sync cards when initialCards changes
  React.useEffect(() => {
    setCards(initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIds(new Set());
    setReviewIds(new Set());
    setIsFinished(false);
  }, [initialCards]);

  if (!isOpen) return null;

  const currentCard = cards[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const markMastered = () => {
    if (!currentCard) return;
    setMasteredIds((prev) => new Set(prev).add(currentCard.id));
    setReviewIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    handleNext();
  };

  const markReview = () => {
    if (!currentCard) return;
    setReviewIds((prev) => new Set(prev).add(currentCard.id));
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    handleNext();
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIds(new Set());
    setReviewIds(new Set());
    setIsFinished(false);
  };

  const speakCard = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  return (
    <div
      id="ncert-flashcards-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/60 to-purple-50/40 dark:from-slate-850 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                  Active Recall Drill
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Page {pageNumber}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                NCERT Smart Flashcards
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Shuffle Cards"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-5 pt-3 pb-1 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>
            Card {currentIndex + 1} of {cards.length}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              ✓ {masteredIds.size} Mastered
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              ⏳ {reviewIds.size} Needs Review
            </span>
          </div>
        </div>
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col items-center justify-center">
          {!isFinished && currentCard ? (
            <div className="w-full flex flex-col items-center gap-4">
              {/* Card Body */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                role="button"
                tabIndex={0}
                className={`w-full min-h-[260px] p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between cursor-pointer select-none shadow-sm relative ${
                  isFlipped
                    ? 'bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/40 dark:from-slate-800 dark:to-indigo-950/40 border-indigo-300 dark:border-indigo-600'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                {/* Top Badge & Audio */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    {currentCard.tag}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakCard(isFlipped ? currentCard.back : currentCard.front);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-750 text-slate-500 hover:text-indigo-600 transition-colors"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {isFlipped ? 'ANSWER' : 'TAP TO FLIP'}
                    </span>
                  </div>
                </div>

                {/* Central Text */}
                <div className="my-auto py-4 text-center">
                  {!isFlipped ? (
                    <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug whitespace-pre-line">
                      {currentCard.front}
                    </div>
                  ) : (
                    <div className="text-sm sm:text-base text-indigo-950 dark:text-indigo-100 font-medium leading-relaxed whitespace-pre-line">
                      {currentCard.back}
                    </div>
                  )}

                  {!isFlipped && currentCard.hint && (
                    <p className="text-[11px] text-slate-400 mt-2 italic">
                      💡 Hint: {currentCard.hint}
                    </p>
                  )}
                </div>

                {/* Bottom Flip prompt */}
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isFlipped ? 'Show Question' : 'Flip to Reveal Answer'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={markReview}
                    className="px-4 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <XCircle className="w-4 h-4 text-amber-600" />
                    <span>Review Later</span>
                  </button>
                  <button
                    onClick={markMastered}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                    <span>Mastered</span>
                  </button>
                </div>

                <button
                  onClick={handleNext}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>{currentIndex === cards.length - 1 ? 'Finish' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Finished Results Screen */
            <div className="text-center py-6 space-y-4 max-w-sm">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                Flashcard Deck Completed!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You went through all {cards.length} flashcards from Page {pageNumber}.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    {masteredIds.size}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
                    Mastered
                  </div>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl">
                  <div className="text-2xl font-black text-amber-700 dark:text-amber-300">
                    {reviewIds.size}
                  </div>
                  <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400">
                    Need Review
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  Drill Again
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
                >
                  Return to Reader
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
