import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { askAIDoubt } from '../services/aiClient';
import { DoubtSolution, SubjectId, ClassLevel } from '../types';
import {
  Bot,
  Send,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  BookmarkPlus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion } from 'motion/react';

export const AITutorPage: React.FC = () => {
  const { user, saveNote, checkAndConsumeUsage, addXP } = useApp();

  const [questionText, setQuestionText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('science');
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(user.classLevel || '10');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');

  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState<DoubtSolution | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [revealedPracticeAnswer, setRevealedPracticeAnswer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestedQuestions = [
    { text: 'A constant force of 20 N acts on an object of mass 4 kg. Find the acceleration produced and velocity after 5 seconds.', subject: 'science' },
    { text: 'Find the zeroes of the quadratic polynomial x² + 7x + 10 and verify the relationship with coefficients.', subject: 'math' },
    { text: 'Explain the mechanism of photosynthesis with light and dark reaction equations.', subject: 'science' },
    { text: 'Convert from Direct to Indirect Speech: The teacher said to the students, "The sun rises in the east."', subject: 'english' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageMimeType(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (!questionText.trim() && !imagePreview) return;

    if (!checkAndConsumeUsage('aiQuestions')) {
      return;
    }

    setIsLoading(true);
    setSolution(null);
    setRevealedPracticeAnswer(false);
    setSavedSuccess(false);

    try {
      const res = await askAIDoubt({
        questionText: questionText.trim(),
        imageBase64: imagePreview || undefined,
        imageMimeType,
        subject: selectedSubject,
        classLevel: selectedClass,
      });
      setSolution(res);
      addXP(20, 'Doubt Solved');
    } catch (err: any) {
      console.error('Error solving doubt:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeechToggle = () => {
    if (!solution) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const speechText = `Concept: ${solution.concept}. Explanation: ${solution.conceptExplanation}. Final answer: ${solution.finalAnswer}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveToNotes = () => {
    if (!solution) return;
    saveNote({
      id: `note-${Date.now()}`,
      userId: user.uid,
      title: `${solution.concept} — Solved Doubt`,
      subjectId: (solution.detectedSubject?.toLowerCase() || 'science') as SubjectId,
      chapterName: solution.detectedTopic || 'Doubt Solutions',
      topicName: solution.concept,
      detailLevel: 'medium',
      content: `### Question\n${solution.question}\n\n### Concept\n${solution.conceptExplanation}\n\n### Step-by-Step Solution\n${solution.stepByStep.map((s) => `**Step ${s.stepNumber}: ${s.title}**\n${s.explanation}\n${s.calculation ? `*Calculation*: ${s.calculation}` : ''}`).join('\n\n')}\n\n**Final Answer**: ${solution.finalAnswer}`,
      definitions: [{ term: solution.concept, definition: solution.conceptExplanation }],
      keyFormulas: solution.numericalBreakdown ? [solution.numericalBreakdown.formula] : [],
      commonMistakes: solution.commonMistakes,
      examTips: ['Review standard step-by-step derivation before solving numericals.'],
      quickRevisionPoints: [solution.finalAnswer],
      isFavorite: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setSavedSuccess(true);
  };

  const handleCopySolution = () => {
    if (!solution) return;
    const textToCopy = `Question: ${solution.question}\n\nConcept: ${solution.concept}\n\nSolution:\n${solution.stepByStep.map((s) => `Step ${s.stepNumber}: ${s.title}\n${s.explanation}`).join('\n\n')}\n\nFinal Answer: ${solution.finalAnswer}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="ai-tutor-page" className="space-y-6 pb-20 md:pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">StudyPilot AI Tutor</h1>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                Step-by-Step Coach
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Type or scan any academic problem to get pedagogical explanations & formulas.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:border-indigo-600 cursor-pointer"
          >
            <option value="science">Science (Phy/Chem/Bio)</option>
            <option value="math">Mathematics</option>
            <option value="english">English</option>
            <option value="social_science">Social Science</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value as ClassLevel)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:border-indigo-600 cursor-pointer"
          >
            {['6', '7', '8', '9', '10', '11', '12'].map((c) => (
              <option key={c} value={c}>Class {c}th</option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Box Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        {imagePreview && (
          <div className="relative inline-block border border-slate-200 rounded-2xl p-2 bg-slate-50">
            <img src={imagePreview} alt="Uploaded question" className="max-h-48 rounded-xl object-contain" />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 text-xs hover:bg-rose-600 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="relative">
          <textarea
            id="doubt-question-input"
            rows={4}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Type your question or paste a numerical problem here... (e.g. An object is placed 10 cm in front of a concave mirror of focal length 15 cm. Find image position and magnification.)"
            className="w-full p-4 rounded-2xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-slate-900 text-sm leading-relaxed focus:outline-hidden resize-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-slate-600" />
              <span>Scan / Upload Image</span>
            </button>
          </div>

          <button
            id="solve-doubt-btn"
            type="button"
            disabled={isLoading || (!questionText.trim() && !imagePreview)}
            onClick={handleSolve}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing & Solving...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Solve with AI Tutor</span>
              </>
            )}
          </button>
        </div>

        {/* Suggested Prompts */}
        {!solution && !isLoading && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Try these sample questions:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestionText(q.text);
                    setSelectedSubject(q.subject);
                  }}
                  className="text-left text-xs text-slate-600 bg-slate-50 hover:bg-indigo-50/70 hover:text-indigo-900 border border-slate-200/80 p-2.5 rounded-xl transition-colors truncate"
                >
                  • {q.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Solution Presentation */}
      {solution && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Solution Header Banner */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                  Concept: {solution.concept}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSpeechToggle}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isSpeaking ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Listen to Explanation (Audio Tutor)"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSpeaking ? 'Mute' : 'Listen'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySolution}
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveToNotes}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    savedSuccess
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>{savedSuccess ? 'Saved in Notes' : 'Save to Notes'}</span>
                </button>
              </div>
            </div>

            {/* Concept Intuition Box */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 text-xs sm:text-sm text-indigo-950 leading-relaxed">
              <strong className="block text-indigo-900 font-bold mb-1">💡 Core Academic Intuition:</strong>
              {solution.conceptExplanation}
            </div>

            {/* Numerical Breakdown Box (If Numerical) */}
            {solution.numericalBreakdown && (
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-5 space-y-3 font-mono text-xs sm:text-sm">
                <p className="font-sans font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  🔬 Numerical Formulation Matrix
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-400">Given:</span> {solution.numericalBreakdown.given.join(', ')}
                  </div>
                  <div>
                    <span className="text-slate-400">Formula:</span> <span className="text-emerald-400 font-bold">{solution.numericalBreakdown.formula}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Substitution:</span> {solution.numericalBreakdown.substitution}
                  </div>
                  <div>
                    <span className="text-slate-400">Calculation:</span> {solution.numericalBreakdown.calculation}
                  </div>
                </div>
              </div>
            )}

            {/* Step-by-Step Cards */}
            <div className="space-y-3 pt-2">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Step-by-Step Educational Solution</h3>
              {solution.stepByStep.map((step) => (
                <div
                  key={step.stepNumber}
                  className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {step.stepNumber}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{step.title}</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-8">
                    {step.explanation}
                  </p>
                  {step.calculation && (
                    <div className="ml-8 bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-xs text-indigo-900">
                      {step.calculation}
                    </div>
                  )}
                  {step.whyItWorks && (
                    <p className="text-[11px] text-slate-500 italic pl-8">
                      <strong>Why this works:</strong> {step.whyItWorks}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Final Answer Banner */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">Final Answer</p>
                <p className="font-black text-emerald-950 text-base sm:text-lg">{solution.finalAnswer}</p>
              </div>
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>

            {/* Common Mistakes Warning */}
            {solution.commonMistakes && solution.commonMistakes.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Common Student Mistakes (Board Exam Traps)</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-amber-950">
                  {solution.commonMistakes.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Similar Practice Question */}
            {solution.similarPracticeQuestion && (
              <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-sky-900 font-bold text-xs uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-sky-600" />
                  <span>Similar Practice Drill (Test Your Understanding)</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  {solution.similarPracticeQuestion.question}
                </p>
                <p className="text-xs text-slate-600 italic">
                  <strong>Hint:</strong> {solution.similarPracticeQuestion.hint}
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setRevealedPracticeAnswer(!revealedPracticeAnswer)}
                    className="text-xs font-bold text-sky-700 bg-white border border-sky-300 px-3 py-1.5 rounded-xl hover:bg-sky-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{revealedPracticeAnswer ? 'Hide Solution' : 'Reveal Answer & Solution'}</span>
                    {revealedPracticeAnswer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {revealedPracticeAnswer && (
                    <div className="mt-2.5 p-3 rounded-xl bg-white border border-sky-200 text-xs text-slate-800">
                      <strong>Solution:</strong> {solution.similarPracticeQuestion.answer}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
