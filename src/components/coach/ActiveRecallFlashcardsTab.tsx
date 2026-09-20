import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  HelpCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
  RefreshCw,
  FolderOpen,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchActiveRecallFlashcards } from '../../services/studyCoachClient';
import { FlashcardDeck, ActiveRecallFlashcard } from '../../types/studyCoach';
import { safeGetStorage, safeSetStorage } from '../../utils/storage';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';

const STORAGE_DECKS_KEY = 'studypilot_coach_flashcard_decks';

const SAMPLE_TOPICS = [
  { label: 'Electricity & Ohm\'s Law', subject: 'Science', topic: 'Electricity, Resistance & Joule\'s Law' },
  { label: 'Light: Reflection & Lenses', subject: 'Science', topic: 'Mirrors, Lenses & Snell\'s Law' },
  { label: 'Chemical Reactions & Equations', subject: 'Science', topic: 'Types of Reactions & Oxidation-Reduction' },
  { label: 'Life Processes & Respiration', subject: 'Science', topic: 'Cellular Respiration & Blood Circulation' },
  { label: 'Quadratic Equations & AP', subject: 'Mathematics', topic: 'Roots, Discriminant & Arithmetic Progressions' },
];

export const ActiveRecallFlashcardsTab: React.FC = () => {
  const { user, addXP } = useApp();

  // Input states
  const [materialText, setMaterialText] = useState('');
  const [subject, setSubject] = useState(user.selectedSubject || 'Science');
  const [topic, setTopic] = useState('Electricity, Resistance & Ohm\'s Law');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Deck states
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [savedDecks, setSavedDecks] = useState<FlashcardDeck[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Mastery Tracking for current deck
  const [cardStatus, setCardStatus] = useState<Record<string, 'mastered' | 'review'>>({});
  const [drillMissedMode, setDrillMissedMode] = useState(false);

  // Loading & Error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved decks from storage
  useEffect(() => {
    const raw = safeGetStorage(STORAGE_DECKS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedDecks(parsed);
          setActiveDeck(parsed[0]);
        }
      } catch (e) {
        console.warn('Failed to parse saved flashcard decks');
      }
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md') && !file.type.includes('text')) {
      toast.error('Please upload a plain text (.txt or .md) file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setMaterialText(content);
      setUploadedFileName(file.name);
      setTopic(file.name.replace(/\.[^/.]+$/, ''));
      toast.success(`Loaded notes from ${file.name}!`);
    };
    reader.readAsText(file);
  };

  const handleGenerateDeck = async (overrideParams?: { subject?: string; topic?: string; text?: string }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(0);
    setCardStatus({});
    setDrillMissedMode(false);

    const sSubject = overrideParams?.subject || subject;
    const sTopic = overrideParams?.topic || topic;
    const sText = overrideParams?.text || materialText;

    try {
      const deck = await fetchActiveRecallFlashcards({
        materialText: sText,
        subject: sSubject,
        topic: sTopic,
        classLevel: user.classLevel || '10',
      });

      setActiveDeck(deck);

      // Save to savedDecks
      setSavedDecks((prev) => {
        const filtered = prev.filter((d) => d.id !== deck.id);
        const updated = [deck, ...filtered];
        safeSetStorage(STORAGE_DECKS_KEY, JSON.stringify(updated.slice(0, 10)));
        return updated;
      });

      toast.success('Generated 10 Active Recall Flashcards (Easiest to Hardest)!');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Could not generate flashcards. Please retry.');
      toast.error('Failed to generate flashcard deck.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentCards = drillMissedMode && activeDeck
    ? activeDeck.cards.filter((c) => cardStatus[c.id] === 'review')
    : activeDeck?.cards || [];

  const currentCard = currentCards[currentIndex];

  const handleMarkCard = (status: 'mastered' | 'review') => {
    if (!currentCard) return;

    setCardStatus((prev) => {
      const updated = { ...prev, [currentCard.id]: status };
      return updated;
    });

    if (status === 'mastered') {
      addXP(10);
      toast.success('Card Mastered! +10 XP', { icon: '🎯' });
    }

    // Advance to next card if available
    if (currentIndex < currentCards.length - 1) {
      setIsFlipped(false);
      setShowHint(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished all cards in current view!
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      toast.success('You reached the end of this flashcard deck!');
    }
  };

  const handleNext = () => {
    if (currentIndex < currentCards.length - 1) {
      setIsFlipped(false);
      setShowHint(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setShowHint(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const masteredCount = activeDeck
    ? activeDeck.cards.filter((c) => cardStatus[c.id] === 'mastered').length
    : 0;
  const reviewCount = activeDeck
    ? activeDeck.cards.filter((c) => cardStatus[c.id] === 'review').length
    : 0;
  const progressPercent = activeDeck && activeDeck.cards.length > 0
    ? Math.round((masteredCount / activeDeck.cards.length) * 100)
    : 0;

  const handleDeleteDeck = (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedDecks.filter((d) => d.id !== deckId);
    setSavedDecks(updated);
    safeSetStorage(STORAGE_DECKS_KEY, JSON.stringify(updated));
    if (activeDeck?.id === deckId) {
      setActiveDeck(updated[0] || null);
      setCurrentIndex(0);
      setCardStatus({});
    }
    toast('Deck deleted', { icon: '🗑️' });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Cognitive Active Recall</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Active Recall & Flashcards
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Upload notes or pick a chapter to generate 10 active-recall flashcards ordered strictly from easiest
              definitions to hardest application challenges. Drill cards, track mastery, and re-test missed cards.
            </p>
          </div>

          {activeDeck && (
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 self-start md:self-auto">
              <div className="text-center px-2">
                <div className="text-xs text-slate-500 font-medium">Mastered</div>
                <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {masteredCount} <span className="text-xs text-slate-400 font-normal">/ {activeDeck.cards.length}</span>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="text-center px-2">
                <div className="text-xs text-slate-500 font-medium">Needs Review</div>
                <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                  {reviewCount}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Saved Decks Quick Selector */}
        {savedDecks.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-400 shrink-0">Saved Decks:</span>
            {savedDecks.map((deck) => (
              <div
                key={deck.id}
                onClick={() => {
                  setActiveDeck(deck);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setDrillMissedMode(false);
                  setCardStatus({});
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition shrink-0 ${
                  activeDeck?.id === deck.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span className="truncate max-w-[150px]">{deck.deckTitle}</span>
                <button
                  type="button"
                  onClick={(e) => handleDeleteDeck(deck.id, e)}
                  className="hover:text-rose-300 ml-1"
                  title="Delete deck"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generator Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Create or Upload Flashcard Material
        </h3>

        {/* Quick Topics */}
        <div className="mb-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Quick Chapter Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TOPICS.map((st, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSubject(st.subject);
                  setTopic(st.topic);
                  setMaterialText('');
                  setUploadedFileName(null);
                  handleGenerateDeck({ subject: st.subject, topic: st.topic, text: '' });
                }}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium transition cursor-pointer"
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Subject & Topic Title
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Light: Reflection, Refraction & Lens Formulas"
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Upload Notes / Material (.txt or .md)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.md,text/plain"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-500 cursor-pointer transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadedFileName || 'Choose text file or notes...'}</span>
              </button>
              {uploadedFileName && (
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFileName(null);
                    setMaterialText('');
                  }}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                  title="Clear file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Or Paste Custom Notes / Text Content (Optional)
          </label>
          <textarea
            rows={3}
            value={materialText}
            onChange={(e) => setMaterialText(e.target.value)}
            placeholder="Paste raw notes, summary paragraphs, or definitions here to strictly generate cards from your material..."
            className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleGenerateDeck()}
            disabled={isLoading || !topic.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Generating 10 Active Recall Cards...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate 10 Active Recall Cards</span>
              </>
            )}
          </button>

          {activeDeck && (
            <span className="text-xs text-slate-400">
              Deck: <span className="font-semibold text-slate-600 dark:text-slate-300">{activeDeck.deckTitle}</span>
            </span>
          )}
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
            <button
              onClick={() => handleGenerateDeck()}
              className="ml-auto font-bold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Active Deck View & Interactive Flip Card */}
      {activeDeck && currentCard && (
        <div className="space-y-4">
          {/* Deck Subheader with Mode Toggles */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Card {currentIndex + 1} of {currentCards.length}
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  currentCard.difficulty === 'easy'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : currentCard.difficulty === 'medium'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                }`}
              >
                Difficulty: {currentCard.difficulty}
              </span>
              {currentCard.tag && (
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md hidden sm:inline">
                  {currentCard.tag}
                </span>
              )}
            </div>

            {/* Drill Missed Filter */}
            {reviewCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setDrillMissedMode(!drillMissedMode);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  drillMissedMode
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{drillMissedMode ? 'Showing Missed Cards Only (Back to All)' : `Drill Missed Cards (${reviewCount})`}</span>
              </button>
            )}
          </div>

          {/* Interactive Flip Card Stage */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`min-h-[260px] sm:min-h-[300px] p-6 sm:p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between cursor-pointer select-none relative shadow-md hover:shadow-lg ${
              isFlipped
                ? 'bg-indigo-900 text-white border-indigo-700'
                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800'
            }`}
          >
            {/* Top Indicator on Card */}
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  isFlipped
                    ? 'bg-indigo-800 text-indigo-200'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {isFlipped ? 'Answer Side' : 'Active Recall Question'}
              </span>

              <span className="text-xs opacity-60 flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Click card to flip</span>
              </span>
            </div>

            {/* Main Content (Question or Answer) */}
            <div className="my-auto py-6 text-center">
              {!isFlipped ? (
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-2xl font-bold tracking-tight leading-relaxed max-w-xl mx-auto">
                    {currentCard.front}
                  </h3>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    Try to recall the exact scientific mechanism or definition before flipping!
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-base sm:text-xl font-medium leading-relaxed max-w-xl mx-auto text-indigo-50">
                    {currentCard.back}
                  </p>
                  {currentCard.hint && showHint && (
                    <div className="text-xs bg-indigo-800/80 p-2.5 rounded-xl border border-indigo-700 max-w-md mx-auto text-indigo-200">
                      <span className="font-bold">Mnemonic / Hint: </span>
                      {currentCard.hint}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Card Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs opacity-60 font-mono">
                Card #{currentCard.cardOrder} (Ordered 1 to 10)
              </div>

              {currentCard.hint && isFlipped && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(!showHint);
                  }}
                  className="text-xs text-indigo-200 hover:text-white underline flex items-center gap-1"
                >
                  {showHint ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showHint ? 'Hide Hint' : 'Show Mnemonic Hint'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Assessment & Navigation Buttons */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Prev / Next */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                title="Previous Card"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === currentCards.length - 1}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                title="Next Card"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Mastery Assessment Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleMarkCard('review')}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800 transition cursor-pointer"
              >
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Needs Review</span>
              </button>

              <button
                type="button"
                onClick={() => handleMarkCard('mastered')}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Know It (Mastered)</span>
              </button>
            </div>

            {/* Quick Reset for this Deck */}
            <button
              type="button"
              onClick={() => {
                setCardStatus({});
                setCurrentIndex(0);
                setIsFlipped(false);
                setDrillMissedMode(false);
                toast('Deck progress reset. Drill from card 1!', { icon: '🔄' });
              }}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer"
            >
              Reset Deck
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
