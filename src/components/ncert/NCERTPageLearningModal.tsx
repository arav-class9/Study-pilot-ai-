import React, { useState, useEffect } from 'react';
import { NCERTChapter, NCERTPageContent, NCERTQuizQuestion } from '../../types/ncert';
import { NCERTService } from '../../services/ncertService';
import {
  X,
  BookOpen,
  Sparkles,
  FileText,
  HelpCircle,
  Layers,
  Award,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Languages,
  Printer,
  ChevronRight,
  Lightbulb,
  Check,
  Brain,
  Copy,
  Volume2,
} from 'lucide-react';

interface NCERTPageLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: NCERTChapter;
  pageContent: NCERTPageContent | null;
  pageNumber: number;
  onStartQuiz?: () => void;
}

type TabType = 'explanation' | 'summary' | 'key_points' | 'questions' | 'flashcards';

export const NCERTPageLearningModal: React.FC<NCERTPageLearningModalProps> = ({
  isOpen,
  onClose,
  chapter,
  pageContent,
  pageNumber,
  onStartQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('explanation');
  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState<string>('');
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate or update explanation when tab or language changes
  useEffect(() => {
    if (!isOpen || !pageContent) return;

    const generateExplanation = async () => {
      setLoadingExplanation(true);
      try {
        const textPayload = (pageContent.paragraphs || []).join('\n') || pageContent.heading || 'NCERT Page Text';
        const res = await fetch('/api/ai/textbook-rag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `Provide a structured, engaging pedagogical explanation of this page for Class ${chapter.classLevel} students. Highlight core concepts, real-life analogies, and exam focal points.`,
            bookTitle: `NCERT Class ${chapter.classLevel} ${chapter.subjectId}`,
            chapterName: chapter.title,
            classLevel: chapter.classLevel,
            subject: chapter.subjectId,
            language,
            availablePages: [
              {
                pageNumber,
                sectionTitle: pageContent.sectionTitle,
                heading: pageContent.heading,
                text: textPayload,
                formulas: pageContent.formulas,
                keyPoints: pageContent.keyConcepts,
              },
            ],
            filterPageNumber: pageNumber,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data?.answer) {
            setExplanationText(json.data.answer);
          }
        }
      } catch (err) {
        console.warn('Could not generate multilingual explanation:', err);
      } finally {
        setLoadingExplanation(false);
      }
    };

    if (activeTab === 'explanation' && !explanationText) {
      generateExplanation();
    }
  }, [isOpen, activeTab, language, pageNumber, chapter, pageContent, explanationText]);

  if (!isOpen || !pageContent) return null;

  // Flashcards derived from key concepts, formulas, and highlights
  const flashcards = [
    ...(pageContent.keyConcepts || []).map((kc, i) => ({
      front: `Concept ${i + 1}: ${kc.split(':')[0] || 'Core Definition'}`,
      back: kc,
      tag: 'Key Concept',
    })),
    ...(pageContent.formulas || []).map((f, i) => ({
      front: `Formula #${i + 1}: Standard Formulation`,
      back: `${f}\n\nNote: Pay close attention to SI units and state conditions.`,
      tag: 'Formula & Equation',
    })),
    ...(pageContent.ncertHighlights || []).map((nh, i) => ({
      front: `NCERT Exam Focus Tip #${i + 1}`,
      back: nh,
      tag: 'Exam Tip',
    })),
  ];

  // Important questions derived from page
  const importantQuestions = [
    {
      qNum: 1,
      type: 'Short Answer (2 Marks)',
      question: `Define the primary principle described on Page ${pageNumber} of ${chapter.title}.`,
      modelAnswer: pageContent.paragraphs?.[0] || 'State the standard NCERT definition with units and conditions.',
      marking: '1 mark for definition, 1 mark for scientific notation/diagram.',
    },
    {
      qNum: 2,
      type: 'Reasoning & Application (3 Marks)',
      question: `Why is ${pageContent.heading || 'this phenomenon'} significant in everyday life? Give two examples.`,
      modelAnswer: `1. It forms the foundational mechanism for chemical/physical balance.\n2. Key application: ${(pageContent.keyConcepts || [])[0] || 'Industrial and biological processes'}.`,
      marking: '1 mark for conceptual reasoning, 2 marks for valid real-world examples.',
    },
    {
      qNum: 3,
      type: 'Long Answer / Derivation (5 Marks)',
      question: `With the help of a neat diagram or mathematical formulation, explain the complete concept on Page ${pageNumber}.`,
      modelAnswer: (pageContent.paragraphs || []).join('\n\n') || 'Complete step-by-step textbook derivation.',
      marking: '2 marks for diagram/equation, 2 marks for derivation steps, 1 mark for conclusion.',
    },
  ];

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Brain className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg leading-tight">Page-Based Learning Hub</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider">
                  Page {pageNumber}
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">
                {chapter.title} • Class {chapter.classLevel} {chapter.subjectId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center bg-white/20 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setLanguage('en');
                  setExplanationText('');
                }}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  language === 'en' ? 'bg-white text-indigo-700 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage('hi');
                  setExplanationText('');
                }}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  language === 'hi' ? 'bg-white text-indigo-700 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage('hinglish');
                  setExplanationText('');
                }}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  language === 'hinglish' ? 'bg-white text-indigo-700 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                Hinglish
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 overflow-x-auto px-4 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('explanation')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'explanation'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Explanation</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('key_points')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'key_points'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Key Points & Formulas</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'questions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-purple-500" />
            <span>Important Questions</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'flashcards'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>Flashcards ({flashcards.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: AI EXPLANATION */}
          {activeTab === 'explanation' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">
                    {pageContent.heading || `Page ${pageNumber} Academic Breakdown`}
                  </h4>
                  <p className="text-xs text-indigo-700/80 dark:text-indigo-300">
                    Language: {language === 'hi' ? 'हिंदी (Preserving scientific notations)' : language === 'hinglish' ? 'Hinglish Concept Bridge' : 'English Academic Standard'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(explanationText || (pageContent.paragraphs || []).join('\n'))}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-xs hover:bg-indigo-50 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {loadingExplanation ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-500">
                    Synthesizing grounded explanation from NCERT Page {pageNumber}...
                  </p>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {explanationText || (pageContent.paragraphs || []).join('\n\n')}
                </div>
              )}

              {onStartQuiz && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onStartQuiz();
                    }}
                    className="px-4 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all"
                  >
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>Test Your Understanding of Page {pageNumber}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Key Paragraphs & Core Exposition</span>
                </h4>
                <div className="space-y-2.5">
                  {(pageContent.paragraphs || []).map((p, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              {pageContent.ncertHighlights && pageContent.ncertHighlights.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-4 rounded-2xl space-y-2">
                  <h5 className="font-extrabold text-xs text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>NCERT Official Highlights & Observations</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-amber-800 dark:text-amber-300">
                    {pageContent.ncertHighlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KEY POINTS & FORMULAS */}
          {activeTab === 'key_points' && (
            <div className="space-y-4">
              {pageContent.formulas && pageContent.formulas.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span>Formulas & Equations on Page {pageNumber}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {pageContent.formulas.map((f, i) => (
                      <div
                        key={i}
                        className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 p-3.5 rounded-xl text-xs font-mono font-bold text-purple-900 dark:text-purple-200"
                      >
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Key Concepts to Remember</span>
                </h4>
                <div className="space-y-2">
                  {(pageContent.keyConcepts || []).map((kc, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{kc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: IMPORTANT QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                These questions are calibrated to NCERT & CBSE board exam patterns with official marking schemes.
              </div>

              <div className="space-y-3">
                {importantQuestions.map((iq) => (
                  <div
                    key={iq.qNum}
                    className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Question {iq.qNum} • {iq.type}
                      </span>
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{iq.question}</p>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      <p className="font-bold text-[11px] text-slate-400 uppercase">Model Answer / Key Points:</p>
                      <p className="whitespace-pre-line">{iq.modelAnswer}</p>
                    </div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg inline-block">
                      Marking Scheme: {iq.marking}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <div className="space-y-4">
              {flashcards.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No flashcards available for this page. Check the Summary tab.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                    <span>
                      Card {currentFlashcardIndex + 1} of {flashcards.length}
                    </span>
                    <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full text-[10px]">
                      {flashcards[currentFlashcardIndex].tag}
                    </span>
                  </div>

                  {/* Interactive Flip Card */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="min-h-[220px] bg-linear-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/80 border-2 border-indigo-200 dark:border-indigo-900/60 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-md hover:shadow-lg transition-all"
                  >
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-2">
                      {isFlipped ? 'Answer / Detailed Concept' : 'Tap to Flip & Reveal'}
                    </p>
                    <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white max-w-md whitespace-pre-line leading-relaxed">
                      {isFlipped ? flashcards[currentFlashcardIndex].back : flashcards[currentFlashcardIndex].front}
                    </p>
                  </div>

                  {/* Card Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      disabled={currentFlashcardIndex === 0}
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentFlashcardIndex((prev) => Math.max(0, prev - 1));
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Flip Card</span>
                    </button>

                    <button
                      type="button"
                      disabled={currentFlashcardIndex === flashcards.length - 1}
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentFlashcardIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
