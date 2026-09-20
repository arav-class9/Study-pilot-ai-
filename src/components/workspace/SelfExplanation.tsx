import React, { useState } from 'react';
import {
  Video,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Loader2,
  RefreshCcw,
  Award,
  BookOpen,
  ArrowRight,
  Brain,
  MessageSquare,
} from 'lucide-react';
import { TopicWorkspaceItem, WorkspaceSelfExplanation } from '../../types/workspace';
import { MediaUploader } from './MediaUploader';
import { checkStudentExplanation } from '../../services/topicWorkspaceClient';

interface SelfExplanationProps {
  topic: TopicWorkspaceItem;
  onUpdateTopic: (updated: TopicWorkspaceItem) => void;
}

export const SelfExplanation: React.FC<SelfExplanationProps> = ({ topic, onUpdateTopic }) => {
  const [isChecking, setIsChecking] = useState(false);
  const selfExp = topic.selfExplanation || { writtenText: '' };

  const handleTextChange = (text: string) => {
    onUpdateTopic({
      ...topic,
      selfExplanation: {
        ...selfExp,
        writtenText: text,
      },
    });
  };

  const handleMediaSave = (url: string, type: 'video' | 'audio' | 'image', fileName: string) => {
    onUpdateTopic({
      ...topic,
      selfExplanation: {
        ...selfExp,
        mediaUrl: url,
        mediaType: type,
        mediaFileName: fileName,
      },
    });
  };

  const handleMediaRemove = () => {
    onUpdateTopic({
      ...topic,
      selfExplanation: {
        ...selfExp,
        mediaUrl: undefined,
        mediaType: undefined,
        mediaFileName: undefined,
      },
    });
  };

  const handleCheckUnderstanding = async () => {
    if (!selfExp.writtenText && !selfExp.mediaUrl) {
      alert('Please type or record a short explanation first!');
      return;
    }

    setIsChecking(true);

    try {
      const combinedNotes = `${topic.notes.aiGeneratedText}\n\n${topic.notes.studentManualText}`;

      const feedback = await checkStudentExplanation({
        topicName: topic.topicName,
        subject: topic.subject,
        explanationText: selfExp.writtenText || `[Attached ${selfExp.mediaType} explanation: ${selfExp.mediaFileName}]`,
        notesContext: combinedNotes,
      });

      onUpdateTopic({
        ...topic,
        selfExplanation: {
          ...selfExp,
          checkResult: feedback,
        },
      });
    } catch (err) {
      console.error('Check explanation error:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const result = selfExp.checkResult;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Input Form Column */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-amber-200/90 dark:border-slate-800 shadow-md space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-amber-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Explain It Yourself (Feynman Technique)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Teach the concept in your own words. Socratic AI will evaluate your understanding.
              </p>
            </div>
          </div>
        </div>

        {/* Written Explanation Box */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
            <span>Type Your Own Explanation</span>
          </label>
          <textarea
            value={selfExp.writtenText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={`Explain "${topic.topicName}" as if you were teaching a classmate or friend. Mention core principles, formulas, or steps...`}
            rows={7}
            className="w-full p-4 rounded-xl border border-amber-300 dark:border-slate-700 bg-amber-50/20 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
          />
        </div>

        {/* Media Uploader */}
        <MediaUploader
          mediaUrl={selfExp.mediaUrl}
          mediaType={selfExp.mediaType}
          mediaFileName={selfExp.mediaFileName}
          onMediaSave={handleMediaSave}
          onMediaRemove={handleMediaRemove}
        />

        {/* Action Button */}
        <button
          onClick={handleCheckUnderstanding}
          disabled={isChecking || (!selfExp.writtenText && !selfExp.mediaUrl)}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all disabled:opacity-50 active:scale-[0.99]"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Conceptual Mastery...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Check My Understanding</span>
            </>
          )}
        </button>
      </div>

      {/* Socratic Feedback Results Column */}
      <div className="lg:col-span-5 space-y-4">
        {result ? (
          <div className="bg-amber-50/80 dark:bg-slate-900 p-6 rounded-2xl border-2 border-amber-300 dark:border-slate-800 shadow-md space-y-5">
            {/* Score & Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <h4 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Understanding Audit
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-200 dark:bg-slate-800 text-amber-900 dark:text-amber-200 font-black text-xs">
                Score: {result.score}%
              </span>
            </div>

            {/* Overall Socratic Feedback */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-amber-200/80 dark:border-slate-800 text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
              "{result.overallFeedback}"
            </div>

            {/* Correct Concepts */}
            {result.correctConcepts && result.correctConcepts.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Correctly Understood</span>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {result.correctConcepts.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-900">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Concepts */}
            {result.missingConcepts && result.missingConcepts.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Missing Concepts</span>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {result.missingConcepts.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-amber-100/60 dark:bg-slate-800/60 p-2 rounded-lg border border-amber-200 dark:border-slate-700">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Misconceptions */}
            {result.misconceptions && result.misconceptions.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Misconceptions to Fix</span>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {result.misconceptions.map((item, idx) => (
                    <li key={idx} className="text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
                      <span className="text-rose-600 font-bold">⚠️</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Revision Steps */}
            {result.revisionRecommendations && result.revisionRecommendations.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <span>Socratic Active Revision Prompts</span>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {result.revisionRecommendations.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-indigo-50 dark:bg-indigo-950/40 p-2 rounded-lg border border-indigo-200 dark:border-indigo-900">
                      <span className="text-indigo-600 font-bold">💡</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-amber-50/40 dark:bg-slate-900 p-8 rounded-2xl border-2 border-dashed border-amber-300 dark:border-slate-800 text-center space-y-3">
            <Brain className="w-10 h-10 text-amber-600/70 mx-auto" />
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
              No Explanation Analyzed Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Type your explanation on the left and click "Check My Understanding" to receive instant Socratic feedback!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
