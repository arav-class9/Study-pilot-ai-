import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Check,
  Copy,
  Briefcase,
  Calculator,
  Zap,
  RefreshCw,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { TopicWorkspaceItem, SolvedExampleItem } from '../../types/workspace';
import { fetchTopicDefinitionBreakdown } from '../../services/topicWorkspaceClient';

interface TopicDefinitionBlockProps {
  topic: TopicWorkspaceItem;
  onUpdateTopic: (updated: TopicWorkspaceItem) => void;
  className?: string;
}

export const TopicDefinitionBlock: React.FC<TopicDefinitionBlockProps> = ({
  topic,
  onUpdateTopic,
  className = '',
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const breakdown = topic.definitionBreakdown;

  const handleGenerateDefinition = async () => {
    setIsGenerating(true);
    try {
      const combinedUploadContext = topic.uploadedFiles
        .map((f) => f.extractedText)
        .filter(Boolean)
        .join('\n\n');

      const generated = await fetchTopicDefinitionBreakdown({
        topicName: topic.topicName,
        subject: topic.subject,
        classLevel: topic.classLevel,
        chapter: topic.chapter,
        uploadedContextText: combinedUploadContext,
      });

      const updated: TopicWorkspaceItem = {
        ...topic,
        definitionBreakdown: generated,
      };

      onUpdateTopic(updated);
    } catch (err) {
      console.error('Error generating definition breakdown:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyDefinitionToClipboard = () => {
    if (!breakdown) return;
    const text = `TOPIC DEFINITION: ${topic.topicName} (${topic.subject} - ${topic.classLevel})
1. DEFINITION:
${breakdown.formalDefinition}

2. KEY USES & APPLICATIONS:
${(breakdown.keyUses || breakdown.realWorldExamples || []).map((u) => `• ${u}`).join('\n')}

3. SOLVED EXAMPLES:
${(breakdown.solvedExamples || []).map((ex, idx) => `Example ${idx + 1}: ${ex.title}\n${ex.explanation}${ex.calculationOrSteps ? `\nCalculation: ${ex.calculationOrSteps}` : ''}`).join('\n\n')}

4. QUICK SUMMARY:
${breakdown.quickSummary || `${topic.topicName} is essential for ${topic.subject} exams and practical applications.`}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isGenerating && !breakdown) {
    return (
      <div className={`p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 border-2 border-amber-200 dark:border-slate-700 shadow-xs text-center py-8 ${className}`}>
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-7 h-7 animate-spin text-amber-600 dark:text-amber-400" />
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
            Synthesizing Topic Summary & Standard Definition...
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md">
            Fetching standard curriculum definition, key uses, solved examples, and 1-line recap for <span className="font-bold text-amber-800 dark:text-amber-300">{topic.topicName}</span>.
          </p>
        </div>
      </div>
    );
  }

  if (!breakdown) {
    return (
      <div className={`p-5 rounded-3xl bg-amber-50/80 dark:bg-slate-900 border border-amber-200 dark:border-slate-800 flex items-center justify-between gap-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Structured Topic Overview
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate standard definition, key applications, solved examples, and quick summary for {topic.topicName}.
            </p>
          </div>
        </div>
        <button
          onClick={handleGenerateDefinition}
          disabled={isGenerating}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Overview</span>
        </button>
      </div>
    );
  }

  // Derive fallback values if loaded from legacy structure
  const displayKeyUses: string[] = breakdown.keyUses && breakdown.keyUses.length > 0
    ? breakdown.keyUses
    : breakdown.realWorldExamples && breakdown.realWorldExamples.length > 0
    ? breakdown.realWorldExamples
    : [
        `Used in ${topic.subject || 'science'} for quantitative analysis and modeling.`,
        'Applied in daily technology, biological systems, and industrial processes.',
        'Core topic required for solving high-yield board exam questions.',
      ];

  const displayExamples: SolvedExampleItem[] = breakdown.solvedExamples && breakdown.solvedExamples.length > 0
    ? breakdown.solvedExamples
    : [
        {
          title: `Real-World Application: ${topic.topicName}`,
          explanation: breakdown.realWorldExamples?.[0] || `${topic.topicName} is routinely observed in natural and lab systems.`,
          calculationOrSteps: breakdown.keyFormulasOrRules?.[0] ? `Formula: ${breakdown.keyFormulasOrRules[0]}` : undefined,
        },
      ];

  const displayQuickSummary: string = breakdown.quickSummary || `${topic.topicName}: Fundamental ${topic.subject || 'Science'} concept governing structural rules, practical applications, and exam questions.`;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. DEFINITION: Primary Standard Definition Hero Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-600/10 dark:from-indigo-950/60 dark:via-slate-900 dark:to-slate-900 border-2 border-amber-300/80 dark:border-indigo-900/80 p-3.5 sm:p-6 shadow-xs w-full max-w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-2 rounded-xl sm:rounded-2xl bg-amber-600 text-white shadow-xs shrink-0">
              <BookOpen className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-black tracking-widest text-amber-800 dark:text-amber-300 uppercase">
                1. Standard Topic Definition
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-amber-50 truncate">
                {topic.topicName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <button
              onClick={handleGenerateDefinition}
              disabled={isGenerating}
              title="Regenerate Definition & Overview"
              className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all text-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={copyDefinitionToClipboard}
              className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-amber-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>Copy All</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Clear Standard Definition Text */}
        <p className="text-xs sm:text-base font-serif text-slate-800 dark:text-slate-100 leading-relaxed bg-white/80 dark:bg-slate-950/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-amber-200/60 dark:border-slate-800 shadow-2xs break-words [overflow-wrap:anywhere]">
          {breakdown.formalDefinition}
        </p>
      </div>

      {/* Grid Row for Sections 2 & 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
        {/* 2. KEY USES / APPLICATIONS */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 shadow-xs space-y-3 w-full min-w-0 overflow-x-hidden">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-100 dark:border-slate-800">
            <div className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 truncate">
              2. Key Uses & Applications
            </h4>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {displayKeyUses.map((useItem, idx) => (
              <li key={idx} className="flex items-start gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span className="break-words [overflow-wrap:anywhere] min-w-0 flex-1">{useItem}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. SOLVED EXAMPLES / REAL-WORLD EXAMPLE */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 shadow-xs space-y-3 w-full min-w-0 overflow-x-hidden">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-100 dark:border-slate-800">
            <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 truncate">
              3. Solved Examples & Calculations
            </h4>
          </div>
          <div className="space-y-3">
            {displayExamples.map((ex, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5 w-full min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300 min-w-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="break-words [overflow-wrap:anywhere]">{ex.title}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed break-words [overflow-wrap:anywhere]">
                  {ex.explanation}
                </p>
                {ex.calculationOrSteps && (
                  <div className="bg-white/90 dark:bg-slate-950 p-2 rounded-lg border border-emerald-200/60 dark:border-slate-800 text-[11px] font-mono text-emerald-800 dark:text-emerald-300 overflow-x-auto max-w-full break-words [overflow-wrap:anywhere]">
                    {ex.calculationOrSteps}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. QUICK SUMMARY (1-LINE RECAP) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0">
          <Zap className="w-5 h-5 fill-white" />
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] font-black uppercase tracking-widest text-amber-100">
            4. Quick Revision Recap (1-Line Summary)
          </div>
          <p className="text-xs sm:text-sm font-bold leading-snug">
            {displayQuickSummary}
          </p>
        </div>
      </div>
    </div>
  );
};

