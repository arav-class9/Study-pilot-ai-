import React, { useState } from 'react';
import { NCERTSelectionActionResult, NCERTQuizQuestion } from '../../types/ncert';
import { NCERTBookStorage } from '../../services/ncertBookStorage';
import {
  X,
  Sparkles,
  FileText,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  BookOpen,
  ArrowRight,
  Quote,
} from 'lucide-react';

interface SelectionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: NCERTSelectionActionResult | null;
  loading: boolean;
  chapterTitle: string;
}

export const NCERTSelectionResultModal: React.FC<SelectionResultModalProps> = ({
  isOpen,
  onClose,
  result,
  loading,
  chapterTitle,
}) => {
  const [copied, setCopied] = useState(false);
  // Quiz states
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const handleCopyNotes = () => {
    if (!result) return;
    let text = `NCERT STUDY NOTES • ${chapterTitle} (Page ${result.pageNumber})\nSource Excerpt: "${result.selectedText}"\n\n`;
    if (result.bulletNotes) {
      text += `Key Points:\n` + result.bulletNotes.map((b) => `• ${b}`).join('\n') + '\n\n';
    }
    if (result.keyTerms) {
      text += `Key Terms:\n` + result.keyTerms.map((k) => `• ${k.term}: ${k.definition}`).join('\n') + '\n\n';
    }
    if (result.examSignificance) {
      text += `CBSE Exam Significance: ${result.examSignificance}\n`;
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSelectOption = (qIdx: number, optIdx: number, q: NCERTQuizQuestion) => {
    if (selectedAnswers[qIdx] !== undefined) return; // already answered
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    setShowExplanations((prev) => ({ ...prev, [qIdx]: true }));

    // Record topic attempt for weak topic detection
    NCERTBookStorage.recordTopicAttempt({
      topicName: q.conceptTag || chapterTitle,
      chapterNumber: 1,
      chapterTitle,
      sourcePageNumber: result?.pageNumber || 1,
      isCorrect: optIdx === q.correctAnswerIndex,
    });
  };

  const getActionTitle = () => {
    if (!result) return 'Processing Selection...';
    switch (result.actionType) {
      case 'notes':
        return 'Authentic NCERT Study Notes';
      case 'explain':
        return 'Conceptual Explanation & Analogy';
      case 'quiz':
        return 'Strict Selection-Based Quiz';
      default:
        return 'Textbook Analysis';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              {result?.actionType === 'notes' ? (
                <FileText className="w-5 h-5" />
              ) : result?.actionType === 'explain' ? (
                <Lightbulb className="w-5 h-5 text-amber-500" />
              ) : (
                <Sparkles className="w-5 h-5 text-indigo-500" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {getActionTitle()}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>
                  {chapterTitle} • Source Page {result?.pageNumber || 1}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Grounding analysis strictly in your highlighted NCERT excerpt...
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Validating authentic page text, verifying definitions, and ensuring zero hallucination.
              </p>
            </div>
          ) : result ? (
            <>
              {/* Highlighted Quote Reference Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider mb-1">
                  <Quote className="w-3 h-3" />
                  <span>Selected Textbook Excerpt (Page {result.pageNumber})</span>
                </div>
                <p className="italic font-serif leading-relaxed">
                  "{result.selectedText}"
                </p>
              </div>

              {/* Action Type 1: NOTES */}
              {result.actionType === 'notes' && (
                <div className="space-y-4">
                  {result.bulletNotes && result.bulletNotes.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                        Key Study Points
                      </h4>
                      <ul className="space-y-2">
                        {result.bulletNotes.map((note, idx) => (
                          <li
                            key={idx}
                            className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-start space-x-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.keyTerms && result.keyTerms.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                        NCERT Terminology &amp; Definitions
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {result.keyTerms.map((term, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs"
                          >
                            <span className="font-bold text-indigo-950 dark:text-indigo-200">
                              {term.term}:{' '}
                            </span>
                            <span className="text-slate-700 dark:text-slate-300">
                              {term.definition}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.examSignificance && (
                    <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/60 text-xs">
                      <strong className="text-amber-900 dark:text-amber-300 block mb-1">
                        🎯 CBSE Board Exam Significance:
                      </strong>
                      <span className="text-amber-800 dark:text-amber-200">
                        {result.examSignificance}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Type 2: EXPLAIN */}
              {result.actionType === 'explain' && (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Conceptual Explanation
                    </h4>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                      {result.simplifiedExplanation}
                    </p>
                  </div>

                  {result.realWorldAnalogy && (
                    <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60">
                      <h5 className="font-bold text-sky-900 dark:text-sky-300 text-xs flex items-center space-x-1.5 mb-1">
                        <Lightbulb className="w-3.5 h-3.5 text-sky-600" />
                        <span>Real-World Everyday Analogy:</span>
                      </h5>
                      <p className="text-sky-950 dark:text-sky-200 text-xs leading-relaxed">
                        {result.realWorldAnalogy}
                      </p>
                    </div>
                  )}

                  {result.ncertRuleToRemember && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                      <h5 className="font-bold text-emerald-900 dark:text-emerald-300 text-xs mb-1">
                        📌 NCERT Rule / Formula to Remember:
                      </h5>
                      <p className="text-emerald-950 dark:text-emerald-200 text-xs font-mono font-semibold">
                        {result.ncertRuleToRemember}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Type 3: STRICT QUIZ */}
              {result.actionType === 'quiz' && result.questions && (
                <div className="space-y-6">
                  {result.questions.map((q, qIdx) => {
                    const selected = selectedAnswers[qIdx];
                    const isAnswered = selected !== undefined;
                    const isCorrect = selected === q.correctAnswerIndex;

                    return (
                      <div
                        key={q.id || qIdx}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                          <span>Question {qIdx + 1} of {result.questions?.length}</span>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold">
                            {q.ncertPageReference}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {q.question}
                        </p>

                        {/* Options */}
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            let btnStyle =
                              'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400';
                            if (isAnswered) {
                              if (optIdx === q.correctAnswerIndex) {
                                btnStyle =
                                  'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
                              } else if (optIdx === selected) {
                                btnStyle =
                                  'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                              } else {
                                btnStyle = 'opacity-40 border-slate-200 dark:border-slate-700';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectOption(qIdx, optIdx, q)}
                                disabled={isAnswered}
                                className={`w-full p-2.5 rounded-lg border text-left text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer ${btnStyle}`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="w-5 h-5 rounded-full border text-[11px] flex items-center justify-center font-bold">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                                {isAnswered && optIdx === q.correctAnswerIndex && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                                )}
                                {isAnswered && optIdx === selected && !isCorrect && (
                                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation & Source Quote */}
                        {isAnswered && (
                          <div className="p-3 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs space-y-1.5 animate-in fade-in duration-150">
                            <p className="font-semibold text-indigo-950 dark:text-indigo-200">
                              {isCorrect ? '✅ Correct Answer!' : '❌ Incorrect.'} {q.explanation}
                            </p>
                            {q.quoteFromPage && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                                📖 <strong>Source Proof from Page:</strong> "{q.quoteFromPage}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          {result?.actionType === 'notes' ? (
            <button
              onClick={handleCopyNotes}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Notes'}</span>
            </button>
          ) : (
            <span className="text-xs text-slate-500">
              NCERT Grounded Analysis
            </span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
