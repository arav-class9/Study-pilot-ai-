import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Zap,
  Clock,
  Printer,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { RevisionSheet, TopicWorkspaceItem } from '../../types/workspace';
import { fetchRevisionSheet } from '../../services/topicWorkspaceClient';

interface RevisionGeneratorProps {
  topic: TopicWorkspaceItem;
  onUpdateTopic: (updated: TopicWorkspaceItem) => void;
}

export const RevisionGenerator: React.FC<RevisionGeneratorProps> = ({
  topic,
  onUpdateTopic,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeMode, setActiveMode] = useState<'5min' | '15min' | 'exam_night'>('15min');
  const [copied, setCopied] = useState(false);

  const sheet: RevisionSheet | undefined = topic.revision.latestSheet;

  const handleGenerateSheet = async (mode: '5min' | '15min' | 'exam_night') => {
    setActiveMode(mode);
    setIsGenerating(true);

    try {
      const notesContext = `${topic.notes.aiGeneratedText}\n\n${topic.notes.studentManualText}`;
      const weakAreas = topic.progressMetrics.weakAreas || [];

      const newSheet = await fetchRevisionSheet({
        topicName: topic.topicName,
        subject: topic.subject,
        mode,
        notesText: notesContext,
        weakAreas,
      });

      onUpdateTopic({
        ...topic,
        revision: {
          ...topic.revision,
          latestSheet: newSheet,
          history: [...(topic.revision.history || []), newSheet],
        },
      });
    } catch (err) {
      console.error('Revision sheet generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!sheet) return;
    const content = `# REVISION SHEET: ${topic.topicName} (${sheet.mode.toUpperCase()})\n\n${sheet.summary}\n\n## HIGH YIELD POINTS:\n${sheet.highYieldBullets.map((b) => `- ${b}`).join('\n')}\n\n## COMMON EXAM TRAPS:\n${sheet.memoryTraps.map((t) => `- ⚠️ ${t}`).join('\n')}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Control Banner */}
      <div className="bg-amber-50/80 dark:bg-slate-900 p-5 rounded-2xl border border-amber-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              AI Revision Sheet Generator
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            Tailored to your past quiz mistakes & weak concepts
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleGenerateSheet('5min')}
            disabled={isGenerating}
            className={`p-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeMode === '5min'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-amber-200 dark:border-slate-800 hover:bg-amber-50'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>5-Min Refresher</span>
          </button>

          <button
            onClick={() => handleGenerateSheet('15min')}
            disabled={isGenerating}
            className={`p-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeMode === '15min'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-amber-200 dark:border-slate-800 hover:bg-amber-50'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-300" />
            <span>15-Min High Yield</span>
          </button>

          <button
            onClick={() => handleGenerateSheet('exam_night')}
            disabled={isGenerating}
            className={`p-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeMode === 'exam_night'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-amber-200 dark:border-slate-800 hover:bg-amber-50'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>Exam Night Emergency</span>
          </button>
        </div>
      </div>

      {/* Revision Sheet Display */}
      {isGenerating ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-200 dark:border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
            Synthesizing personalized {activeMode} revision sheet...
          </div>
          <div className="text-xs text-slate-500">Integrating weak concepts and high-yield board tips</div>
        </div>
      ) : sheet ? (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-amber-200 dark:border-slate-800 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-amber-200 font-black text-xs uppercase">
                {sheet.mode} Revision
              </span>
              <span className="text-xs font-bold text-slate-500">
                Generated {new Date(sheet.generatedAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-amber-100 text-xs font-bold flex items-center gap-1"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">Copy Sheet</span>
              </button>
              <button
                onClick={() => window.print()}
                className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold flex items-center gap-1"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-slate-800/40 border border-amber-200/80 dark:border-slate-700 text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
            <div className="text-xs font-extrabold uppercase text-amber-800 dark:text-amber-400 mb-1">
              Topic Revision Core Summary
            </div>
            {sheet.summary}
          </div>

          {/* High Yield Bullets */}
          {sheet.highYieldBullets && sheet.highYieldBullets.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Must-Remember High-Yield Exam Bullets</span>
              </h4>
              <ul className="space-y-2">
                {sheet.highYieldBullets.map((bullet, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Exam Traps & Misconceptions */}
          {sheet.memoryTraps && sheet.memoryTraps.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Common Exam Traps & Unit Errors to Avoid</span>
              </h4>
              <ul className="space-y-2">
                {sheet.memoryTraps.map((trap, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900 text-xs font-medium text-rose-900 dark:text-rose-200 flex items-start gap-2">
                    <span className="text-rose-600 font-bold">⚠️</span>
                    <span>{trap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border-2 border-dashed border-amber-200 dark:border-slate-800 text-center space-y-3">
          <RotateCcw className="w-10 h-10 text-amber-600 mx-auto" />
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
            No Revision Sheet Generated
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Choose a revision duration mode above (5-Min, 15-Min, or Exam Night) to generate a high-yield study sheet!
          </p>
        </div>
      )}
    </div>
  );
};
