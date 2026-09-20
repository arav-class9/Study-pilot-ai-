import React, { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Eye,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ActiveRecallFlashcard, TopicWorkspaceItem } from '../../types/workspace';

interface ActiveRecallModeProps {
  topic: TopicWorkspaceItem;
  onUpdateTopic: (updated: TopicWorkspaceItem) => void;
}

export const ActiveRecallMode: React.FC<ActiveRecallModeProps> = ({ topic, onUpdateTopic }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Derive flashcards from question bank and existing flashcards
  const flashcards: ActiveRecallFlashcard[] =
    topic.activeRecall.flashcards && topic.activeRecall.flashcards.length > 0
      ? topic.activeRecall.flashcards
      : topic.questionBank.questions.map((q, idx) => ({
          id: `card_${q.id || idx}`,
          frontPrompt: q.question,
          backAnswer: `${q.correctAnswer}\n\nExplanation: ${q.explanation}`,
          attemptsCount: 0,
        }));

  const currentCard = flashcards[currentIndex];

  const handleRating = (rating: 'got_it' | 'need_review') => {
    if (!currentCard) return;

    const updatedCards = flashcards.map((c, idx) => {
      if (idx === currentIndex) {
        return {
          ...c,
          userRating: rating,
          attemptsCount: c.attemptsCount + 1,
          lastAttemptAt: new Date().toISOString(),
        };
      }
      return c;
    });

    const isCorrect = rating === 'got_it';
    const newCorrect = topic.activeRecall.correctCount + (isCorrect ? 1 : 0);
    const newIncorrect = topic.activeRecall.incorrectCount + (!isCorrect ? 1 : 0);

    const updatedTopic: TopicWorkspaceItem = {
      ...topic,
      activeRecall: {
        ...topic.activeRecall,
        flashcards: updatedCards,
        attemptsCount: topic.activeRecall.attemptsCount + 1,
        correctCount: newCorrect,
        incorrectCount: newIncorrect,
      },
    };

    onUpdateTopic(updatedTopic);

    // Next card
    setIsFlipped(false);
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (!currentCard) {
    return (
      <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border-2 border-dashed border-amber-200 dark:border-slate-800 text-center space-y-4">
        <Brain className="w-12 h-12 text-amber-600 mx-auto" />
        <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
          No Flashcards / Recall Questions Available
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Generate notes or practice questions first, and StudyPilot will automatically build an Active Recall card deck!
        </p>
      </div>
    );
  }

  const isCompletedDeck = currentIndex >= flashcards.length - 1 && currentCard.userRating;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Active Recall Banner */}
      <div className="bg-amber-100/70 dark:bg-slate-900 p-4 rounded-2xl border border-amber-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-amber-700 dark:text-amber-400" />
          <div>
            <h3 className="font-extrabold text-sm text-amber-900 dark:text-amber-200">
              Active Recall Mode (Notes Hidden)
            </h3>
            <div className="text-[11px] text-amber-800/80 dark:text-amber-400 font-medium">
              Testing your long-term memory retrieval without looking at notes
            </div>
          </div>
        </div>

        <div className="text-xs font-black text-amber-900 dark:text-amber-200 bg-amber-200/80 dark:bg-slate-800 px-3 py-1 rounded-full">
          Card {currentIndex + 1} / {flashcards.length}
        </div>
      </div>

      {/* Main Flashcard */}
      <div className="relative min-h-[300px] bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-300 dark:border-slate-800 p-8 shadow-md flex flex-col justify-between transition-all">
        {/* Card Header */}
        <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
          <span>{isFlipped ? 'Model Answer & Explanation' : 'Memory Retrieval Question'}</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spaced Repetition</span>
          </span>
        </div>

        {/* Card Content */}
        <div className="py-6 text-center">
          <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-relaxed max-w-lg mx-auto whitespace-pre-wrap">
            {isFlipped ? currentCard.backAnswer : currentCard.frontPrompt}
          </div>
        </div>

        {/* Card Action Controls */}
        <div className="pt-4 border-t border-amber-100 dark:border-slate-800">
          {!isFlipped ? (
            <button
              onClick={() => setIsFlipped(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>Reveal Correct Answer</span>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="text-center text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                How well did you recall this answer?
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleRating('need_review')}
                  className="py-3 px-4 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Need Review</span>
                </button>
                <button
                  onClick={() => handleRating('got_it')}
                  className="py-3 px-4 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Got It!</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress & Reset Bar */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={handleReset}
          className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart Deck</span>
        </button>

        <div className="text-xs font-semibold text-slate-500">
          Correct: <span className="font-bold text-emerald-600">{topic.activeRecall.correctCount}</span> | Need Review: <span className="font-bold text-rose-600">{topic.activeRecall.incorrectCount}</span>
        </div>
      </div>
    </div>
  );
};
