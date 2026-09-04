import React, { useState } from 'react';
import { evaluateFeynmanApi } from '../../services/aiClient';
import { Lightbulb, Sparkles, X, Loader2, Award, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

interface FeynmanExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
  defaultSubject?: string;
}

export const FeynmanExplainerModal: React.FC<FeynmanExplainerModalProps> = ({
  isOpen,
  onClose,
  defaultTopic = 'Photosynthesis',
  defaultSubject = 'science',
}) => {
  const [topic, setTopic] = useState(defaultTopic);
  const [subject, setSubject] = useState(defaultSubject);
  const [studentExplanation, setStudentExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  if (!isOpen) return null;

  const handleEvaluate = async () => {
    if (!studentExplanation.trim() || !topic.trim()) return;

    setLoading(true);
    try {
      const res = await evaluateFeynmanApi({
        topic: topic.trim(),
        subject,
        studentExplanation: studentExplanation.trim(),
      });
      setEvaluation(res);
    } catch (e: any) {
      alert(e.message || 'Failed to evaluate Feynman explanation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-950 px-2 py-0.5 rounded">
                  Feynman Technique Studio
                </span>
                <span className="text-[10px] text-slate-400">Master Through Simple Teaching</span>
              </div>
              <h2 className="font-black text-base sm:text-lg">Explain Like I'm 10</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {!evaluation ? (
            <div className="space-y-4 max-w-2xl mx-auto py-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-amber-950 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" /> What is the Feynman Technique?
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed">
                  The ultimate test of true mastery is whether you can explain a complex topic in simple, everyday language without relying on memorized jargon. Try explaining it below!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">Concept / Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Electromagnetic Induction"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white cursor-pointer"
                  >
                    <option value="science">Science / Physics / Chemistry</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="biology">Biology</option>
                    <option value="social_science">Social Science / History</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">
                  Your Simple Explanation (Teach it in your own words)
                </label>
                <textarea
                  rows={6}
                  value={studentExplanation}
                  onChange={(e) => setStudentExplanation(e.target.value)}
                  placeholder="Type your explanation here as if you are explaining it to a curious friend or younger student..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
                />
              </div>

              <button
                onClick={handleEvaluate}
                disabled={loading || !studentExplanation.trim() || !topic.trim()}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI Professor is evaluating your explanation...</span>
                  </>
                ) : (
                  <>
                    <span>Evaluate with Feynman AI Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                      Feynman Evaluation Result
                    </span>
                    <h3 className="font-black text-slate-900 text-lg mt-1">{topic}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-amber-600">{evaluation.clarityScore}%</div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Clarity & Simplicity</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-slate-500 mb-1">Professor Feedback</h4>
                    <p className="text-xs sm:text-sm text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed">
                      {evaluation.feedback}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-slate-500 mb-1">Jargon & Memorization Check</h4>
                    <p className="text-xs text-slate-700 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                      {evaluation.jargonCheck}
                    </p>
                  </div>

                  {evaluation.missingGaps && evaluation.missingGaps.length > 0 && (
                    <div>
                      <h4 className="text-xs font-extrabold uppercase text-slate-500 mb-1.5">Conceptual Gaps to Bridge</h4>
                      <ul className="space-y-1.5">
                        {evaluation.missingGaps.map((gap: string, gIdx: number) => (
                          <li key={gIdx} className="text-xs text-rose-800 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-slate-500 mb-1">Recommended Everyday Analogy</h4>
                    <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl text-xs sm:text-sm text-indigo-950 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{evaluation.simplifiedAnalogy}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEvaluation(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Try Another Topic
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Done & Save Mastery
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
