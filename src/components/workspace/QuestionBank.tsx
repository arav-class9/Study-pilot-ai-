import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
} from 'lucide-react';
import { QuestionDifficulty, TopicWorkspaceItem, WorkspaceQuestion } from '../../types/workspace';
import { fetchPracticeQuestions } from '../../services/topicWorkspaceClient';

interface QuestionBankProps {
  topic: TopicWorkspaceItem;
  onUpdateTopic: (updated: TopicWorkspaceItem) => void;
}

export const QuestionBank: React.FC<QuestionBankProps> = ({ topic, onUpdateTopic }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(topic.questionBank.difficulty || 'medium');
  const [count, setCount] = useState<number>(topic.questionBank.questionCount || 5);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'topic_only' | 'uploaded_only'>(
    topic.questionBank.sourceFilter || 'all'
  );
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const questions = topic.questionBank.questions || [];

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);

    try {
      const combinedUploadContext = topic.uploadedFiles
        .map((f) => f.extractedText)
        .filter(Boolean)
        .join('\n\n');

      const generated = await fetchPracticeQuestions({
        topicName: topic.topicName,
        subject: topic.subject,
        classLevel: topic.classLevel,
        difficulty,
        count,
        uploadedContextText: combinedUploadContext,
        sourceFilter,
      });

      const updatedTopic: TopicWorkspaceItem = {
        ...topic,
        questionBank: {
          ...topic.questionBank,
          questions: generated,
          difficulty,
          questionCount: count,
          sourceFilter,
          lastGeneratedAt: new Date().toISOString(),
        },
      };

      onUpdateTopic(updatedTopic);
    } catch (err) {
      console.error('Question generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSubmit = (questionId: string, answer: string) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        const isCorrect = answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        return {
          ...q,
          userAnswer: answer,
          isCorrect,
          isAttempted: true,
        };
      }
      return q;
    });

    onUpdateTopic({
      ...topic,
      questionBank: {
        ...topic.questionBank,
        questions: updatedQuestions,
      },
    });
  };

  const attemptedCount = questions.filter((q) => q.isAttempted).length;
  const correctCount = questions.filter((q) => q.isAttempted && q.isCorrect).length;
  const scorePercent = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-amber-50/80 dark:bg-slate-900 p-5 rounded-2xl border border-amber-200/80 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Practice Question Bank Generator
            </h3>
          </div>

          {attemptedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200/80 dark:bg-slate-800 text-amber-900 dark:text-amber-200 font-extrabold text-xs">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Score: {scorePercent}% ({correctCount}/{attemptedCount})</span>
            </div>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Difficulty Selector */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-1 bg-white dark:bg-slate-950 p-1 rounded-xl border border-amber-200 dark:border-slate-800 text-xs font-bold">
              {(['easy', 'medium', 'hard'] as QuestionDifficulty[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-1.5 rounded-lg capitalize transition-all ${
                    difficulty === d
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-amber-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count Selector */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Number of Questions
            </label>
            <div className="grid grid-cols-4 gap-1 bg-white dark:bg-slate-950 p-1 rounded-xl border border-amber-200 dark:border-slate-800 text-xs font-bold">
              {[3, 5, 10, 15].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCount(c)}
                  className={`py-1.5 rounded-lg transition-all ${
                    count === c
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-amber-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Source Filter */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Question Source
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="w-full p-2 rounded-xl bg-white dark:bg-slate-950 border border-amber-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All (Topic Notes & Uploaded Files)</option>
              <option value="topic_only">Topic Notes Only</option>
              <option value="uploaded_only">Uploaded Files Only ({topic.uploadedFiles.length})</option>
            </select>
          </div>
        </div>

        {/* Generate More Button */}
        <button
          onClick={handleGenerateQuestions}
          disabled={isGenerating}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Exam-Standard Practice Bank...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{questions.length > 0 ? 'Generate More Practice Questions' : 'Generate Question Bank'}</span>
            </>
          )}
        </button>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border-2 border-dashed border-amber-200 dark:border-slate-800 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-amber-600 mx-auto" />
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
              No Practice Questions Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Select difficulty and click "Generate Question Bank" above to start practicing MCQs, Assertion & Reason, and Exam-style questions!
            </p>
          </div>
        ) : (
          questions.map((q, idx) => {
            const isExpanded = expandedQuestionId === q.id;

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200/90 dark:border-slate-800 p-5 shadow-sm space-y-4"
              >
                {/* Question Header Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-amber-300 font-black text-xs flex items-center justify-center">
                      Q{idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {q.type.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-800' : q.difficulty === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>

                  {q.isAttempted && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-xs ${
                      q.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {q.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{q.isCorrect ? 'Correct' : 'Incorrect'}</span>
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                  {q.question}
                </div>

                {/* Options / Input Form */}
                {q.options && q.options.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isUserSelected = q.userAnswer === opt;
                      const isCorrectAnswer = q.correctAnswer === opt;

                      let btnStyle = 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-amber-50';

                      if (q.isAttempted) {
                        if (isCorrectAnswer) {
                          btnStyle = 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-extrabold';
                        } else if (isUserSelected && !q.isCorrect) {
                          btnStyle = 'bg-rose-100 dark:bg-rose-950/60 border-rose-400 text-rose-900 dark:text-rose-200';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleAnswerSubmit(q.id, opt)}
                          disabled={q.isAttempted}
                          className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {q.isAttempted && isCorrectAnswer && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Written Answer Box for Short / Long / Definition Questions */
                  <div className="space-y-2">
                    {!q.isAttempted ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type your answer here..."
                          className="flex-1 p-2.5 rounded-xl border border-amber-300 dark:border-slate-700 bg-amber-50/30 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-slate-100"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAnswerSubmit(q.id, (e.target as HTMLInputElement).value);
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const inputElem = (e.currentTarget.previousElementSibling as HTMLInputElement);
                            handleAnswerSubmit(q.id, inputElem?.value || '');
                          }}
                          className="px-4 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs"
                        >
                          Check Answer
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-xs">
                        <span className="font-extrabold text-slate-700 dark:text-slate-300">Your Answer: </span>
                        <span>{q.userAnswer}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation Reveal */}
                {q.isAttempted && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900 space-y-1 text-xs">
                    <div className="font-extrabold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Step-by-Step Explanation & Model Answer</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-medium">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">Correct Answer: </span>
                      <span>{q.correctAnswer}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 pt-1">
                      {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
