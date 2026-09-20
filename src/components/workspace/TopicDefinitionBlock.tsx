import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Check,
  Copy,
  Lightbulb,
  Code2,
  Globe,
  Award,
  RefreshCw,
  Loader2,
  Layers,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { TopicWorkspaceItem, TopicDefinitionBreakdown } from '../../types/workspace';
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

  // Auto-generate definition breakdown if missing on load
  useEffect(() => {
    if (!topic.definitionBreakdown && topic.topicName && !isGenerating) {
      handleGenerateDefinition();
    }
  }, [topic.id, topic.topicName]);

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
${breakdown.formalDefinition}

CORE CONCEPTS:
${breakdown.coreConcepts.map((c) => `• ${c}`).join('\n')}

KEY FORMULAS / RULES:
${breakdown.keyFormulasOrRules.map((f) => `• ${f}`).join('\n')}

REAL-WORLD EXAMPLES:
${breakdown.realWorldExamples.map((e) => `• ${e}`).join('\n')}

COMMON EXAM POINTS:
${breakdown.commonExamPoints.map((p) => `• ${p}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isGenerating && !breakdown) {
    return (
      <div className={`p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 border-2 border-amber-200 dark:border-slate-700 shadow-sm text-center py-10 ${className}`}>
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 dark:text-amber-400" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            Synthesizing Formal Definition & Structured Breakdown...
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md">
            Analyzing curriculum standards for <span className="font-bold text-amber-800 dark:text-amber-300">{topic.topicName}</span> ({topic.subject}, {topic.classLevel})
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
              Formal Topic Definition & Structured Breakdown
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate instant textbook definition, formulas, examples, and exam points for {topic.topicName}.
            </p>
          </div>
        </div>
        <button
          onClick={handleGenerateDefinition}
          disabled={isGenerating}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Definition</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Primary Formal Definition Hero Block */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-600/10 dark:from-indigo-950/60 dark:via-slate-900 dark:to-slate-900 border-2 border-amber-300/80 dark:border-indigo-900/80 p-5 sm:p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-amber-600 text-white shadow-xs">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-black tracking-widest text-amber-800 dark:text-amber-300 uppercase">
                Official Formal Definition
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-amber-50">
                {topic.topicName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleGenerateDefinition}
              disabled={isGenerating}
              title="Regenerate Definition"
              className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={copyDefinitionToClipboard}
              className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-amber-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>Copy Definition</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Clear Formal Definition Text */}
        <p className="text-sm sm:text-base font-serif text-slate-800 dark:text-slate-100 leading-relaxed bg-white/70 dark:bg-slate-950/70 p-4 rounded-2xl border border-amber-200/60 dark:border-slate-800 shadow-2xs">
          {breakdown.formalDefinition}
        </p>
      </div>

      {/* Structured 4-Column / Grid Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Concepts */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-100 dark:border-slate-800">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Core Concepts & Principles
            </h4>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {breakdown.coreConcepts.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Formulas or Rules */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-100 dark:border-slate-800">
            <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Key Formulas & Laws / Rules
            </h4>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
            {breakdown.keyFormulasOrRules.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-indigo-50/50 dark:bg-indigo-950/40 p-2 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Real-World Examples */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-100 dark:border-slate-800">
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Real-World Applications & Examples
            </h4>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {breakdown.realWorldExamples.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Common Exam Points */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-100 dark:border-slate-800">
            <Award className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Common Exam Points & Traps
            </h4>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {breakdown.commonExamPoints.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-rose-50/50 dark:bg-rose-950/30 p-2 rounded-xl border border-rose-100 dark:border-rose-900/40">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
