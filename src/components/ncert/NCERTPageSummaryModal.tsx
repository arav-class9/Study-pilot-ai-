import React, { useState } from 'react';
import { NCERTChapter, NCERTPageContent } from '../../types/ncert';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  X,
  FileText,
  Copy,
  Check,
  BookmarkPlus,
  Sparkles,
  BookOpen,
  ListChecks,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface NCERTPageSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: NCERTChapter;
  pageContent: NCERTPageContent | null;
  pageNumber: number;
  onSaveNote?: (noteText: string) => void;
}

export const NCERTPageSummaryModal: React.FC<NCERTPageSummaryModalProps> = ({
  isOpen,
  onClose,
  chapter,
  pageContent,
  pageNumber,
  onSaveNote,
}) => {
  const { user } = useAuth();
  const { saveNote } = useApp();
  const [copied, setCopied] = useState(false);
  const [savedNote, setSavedNote] = useState(false);

  if (!isOpen) return null;

  // Build key points & summary from the page structure
  const keyPoints: string[] = [
    ...(pageContent?.keyConcepts || []),
    ...(pageContent?.ncertHighlights || []),
  ];

  const definitions = pageContent?.vocabulary || [];
  const formulas = pageContent?.formulas || [];

  // Summary paragraphs
  const summaryParagraphs = pageContent?.paragraphs && pageContent.paragraphs.length > 0
    ? pageContent.paragraphs
    : ['This page provides fundamental concepts and foundational definitions for ' + chapter.title + '.'];

  const compiledText = `NCERT Class ${chapter.classLevel} - ${chapter.title} (Page ${pageNumber})
Heading: ${pageContent?.heading || 'Page Overview'}

SUMMARY:
${summaryParagraphs.join('\n\n')}

${keyPoints.length > 0 ? `KEY POINTS:\n${keyPoints.map((k) => `• ${k}`).join('\n')}\n` : ''}
${definitions.length > 0 ? `DEFINITIONS:\n${definitions.map((d) => `• ${d.term}: ${d.definition}`).join('\n')}\n` : ''}
${formulas.length > 0 ? `FORMULAS & EQUATIONS:\n${formulas.map((f) => `• ${f}`).join('\n')}\n` : ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNote = () => {
    const noteId = `ncert-note-${chapter.id}-p${pageNumber}-${Date.now()}`;
    const userUid = user?.uid || 'guest';
    const storageKey = `studypilot_student_notes_${userUid}`;

    try {
      const existingNotes = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const newNote = {
        id: noteId,
        title: `${chapter.title} - Page ${pageNumber} Summary`,
        chapterId: chapter.id,
        pageNumber,
        content: compiledText,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify([newNote, ...existingNotes]));
    } catch {
      // ignore
    }

    try {
      const subjectKey = (chapter.subjectId || 'science').toLowerCase() as any;
      saveNote({
        id: noteId,
        userId: userUid,
        title: `${chapter.title} - Page ${pageNumber} Summary`,
        subjectId: subjectKey,
        chapterName: chapter.title,
        topicName: `Page ${pageNumber} Summary`,
        detailLevel: 'medium',
        content: compiledText,
        overview: summaryParagraphs.join('\n\n'),
        keyPoints: keyPoints,
        definitions: definitions.map((d) => ({ term: d.term, definition: d.definition })),
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Could not sync note to AppContext:', e);
    }

    if (onSaveNote) {
      onSaveNote(compiledText);
    }

    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[88vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm sm:text-base leading-tight">Page Summary</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                  Page {pageNumber}
                </span>
              </div>
              <p className="text-[11px] text-blue-100 truncate max-w-xs sm:max-w-sm">
                NCERT Class {chapter.classLevel} • {chapter.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-800 dark:text-slate-100">
          {/* Section & Heading */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {pageContent?.sectionTitle || `Chapter ${chapter.chapterNumber}`}
            </span>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {pageContent?.heading || chapter.title}
            </h4>
          </div>

          {/* Quick Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Core Summary</span>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              {summaryParagraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </div>

          {/* Key Points */}
          {keyPoints.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <ListChecks className="w-3.5 h-3.5 text-blue-500" />
                <span>Key Points &amp; Highlights</span>
              </div>
              <ul className="space-y-1.5">
                {keyPoints.map((point, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Definitions */}
          {definitions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                <span>Definitions &amp; Terminology</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {definitions.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50"
                  >
                    <div className="font-bold text-xs text-purple-700 dark:text-purple-300">
                      {item.term}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {item.definition}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulas / Equations */}
          {formulas.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Key Formulas &amp; Equations</span>
              </div>
              <div className="space-y-1.5">
                {formulas.map((formula, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 font-mono text-xs text-amber-900 dark:text-amber-200"
                  >
                    {formula}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer: Copy and Save Note */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 font-medium">
            Generated from authentic NCERT Class {chapter.classLevel} text
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleSaveNote}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              {savedNote ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save Note</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
