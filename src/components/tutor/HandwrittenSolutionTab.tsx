import React, { useState, useRef } from 'react';
import { checkAIHandwrittenSolution } from '../../services/aiClient';
import { HandwrittenSolutionAnalysis, ClassLevel } from '../../types';
import {
  Upload,
  Camera,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Sparkles,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';

interface HandwrittenSolutionTabProps {
  currentClass: ClassLevel;
  currentSubject: string;
}

export const HandwrittenSolutionTab: React.FC<HandwrittenSolutionTabProps> = ({
  currentClass,
  currentSubject,
}) => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [problemStatement, setProblemStatement] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<HandwrittenSolutionAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      setImageBase64(base64);
      setImageMimeType(file.type || 'image/jpeg');
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleEvaluate = async () => {
    if (!imageBase64) {
      setErrorMsg('Please upload or snap a photo of your handwritten notebook solution.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const analysis = await checkAIHandwrittenSolution({
        imageBase64,
        mimeType: imageMimeType,
        problemStatement: problemStatement.trim() || undefined,
        subject: currentSubject,
        classLevel: currentClass,
      });
      setResult(analysis);
    } catch (err: any) {
      console.error('Handwriting check error:', err);
      setErrorMsg(err.message || 'Failed to analyze handwriting. Please ensure the image is clear and well-lit.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setImageBase64(null);
    setResult(null);
    setErrorMsg(null);
    setProblemStatement('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 rounded-3xl p-6 text-white shadow-lg border border-purple-800/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold uppercase tracking-wider border border-purple-400/30">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Senior Board Examiner OCR</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Handwritten Solution &amp; Derivation Checker
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-xl">
              Upload notebook photos or math derivations. AI transcribes handwriting and evaluates against official CBSE/ICSE step-by-step marking schemes.
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-2xl font-black text-amber-300">10 Marks</span>
            <div className="text-[11px] font-semibold text-purple-200 uppercase">Board Rubric</div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            1. Problem Statement (Optional but Recommended)
          </label>
          <input
            type="text"
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            placeholder="e.g. Derive mirror formula for concave mirror or Solve 2x² - 5x + 3 = 0"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            2. Photo of Your Handwritten Notebook Page
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {!imageBase64 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer transition-colors space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Click to upload or take photo of your notebook solution
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supports PNG, JPG, JPEG. Ensure good lighting and legible handwriting.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-3">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={`data:${imageMimeType};base64,${imageBase64}`}
                  alt="Handwritten solution preview"
                  className="max-h-56 max-w-full rounded-xl object-contain shadow-md bg-white"
                />
                <div className="space-y-2 text-center sm:text-left">
                  <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Notebook image ready for examination</span>
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Class {currentClass} • {currentSubject.toUpperCase()}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Change Photo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={resetAll}
            disabled={!imageBase64 && !result}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
          >
            Clear / Reset
          </button>

          <button
            onClick={handleEvaluate}
            disabled={!imageBase64 || isLoading}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-indigo-500/25 flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Transcribing &amp; Evaluating...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4" />
                <span>Check My Solution with Marking Scheme</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Result Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md ${
                    result.overallResult === 'correct'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : result.overallResult === 'partially_correct'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {result.scoreOutOf10 ?? 7}/10
                </div>
                <div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      result.overallResult === 'correct'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                        : result.overallResult === 'partially_correct'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                    }`}
                  >
                    {result.overallResult.replace('_', ' ')}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Senior Examiner Assessment &amp; Step Breakdown
                  </h3>
                </div>
              </div>

              {result.unclearHandwritingWarning && (
                <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>Some handwriting characters were partially unclear</span>
                </div>
              )}
            </div>

            {/* Official CBSE / ICSE Marking Scheme Table */}
            {result.markingSchemeBreakdown && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Official Board Marking Scheme Breakdown</span>
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">Evaluation Component</th>
                        <th className="p-3">Marks Awarded</th>
                        <th className="p-3">Examiner Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                      <tr>
                        <td className="p-3 font-semibold">1. Formula / Stated Law</td>
                        <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {result.markingSchemeBreakdown.formulaAndLawMarks.awarded} / {result.markingSchemeBreakdown.formulaAndLawMarks.max}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {result.markingSchemeBreakdown.formulaAndLawMarks.remarks}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">2. Substitution of Given Values</td>
                        <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {result.markingSchemeBreakdown.substitutionMarks.awarded} / {result.markingSchemeBreakdown.substitutionMarks.max}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {result.markingSchemeBreakdown.substitutionMarks.remarks}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">3. Mathematical Calculation Steps</td>
                        <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {result.markingSchemeBreakdown.calculationMarks.awarded} / {result.markingSchemeBreakdown.calculationMarks.max}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {result.markingSchemeBreakdown.calculationMarks.remarks}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">4. Final Answer, Units &amp; Diagram</td>
                        <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {result.markingSchemeBreakdown.unitsAndPresentationMarks.awarded} / {result.markingSchemeBreakdown.unitsAndPresentationMarks.max}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {result.markingSchemeBreakdown.unitsAndPresentationMarks.remarks}
                        </td>
                      </tr>
                      <tr className="bg-indigo-50/50 dark:bg-indigo-950/30 font-bold">
                        <td className="p-3 text-indigo-900 dark:text-indigo-200">Total Marks Scored</td>
                        <td className="p-3 font-mono text-base text-indigo-700 dark:text-indigo-300">
                          {result.markingSchemeBreakdown.totalAwarded} / {result.markingSchemeBreakdown.maxTotal}
                        </td>
                        <td className="p-3 text-indigo-700 dark:text-indigo-300 text-[11px]">
                          Percentage: {Math.round((result.markingSchemeBreakdown.totalAwarded / (result.markingSchemeBreakdown.maxTotal || 1)) * 100)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Transcribed Steps with Step Analysis */}
          {result.transcribedSteps && result.transcribedSteps.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Handwriting Transcription &amp; Line-by-Line Critique</span>
              </h4>
              <div className="space-y-2.5">
                {result.transcribedSteps.map((step, sIdx) => {
                  const critiqueItem = result.stepAnalysis?.find((a) => a.stepNumber === step.stepNumber);
                  const isGood = critiqueItem?.status === 'correct';
                  const isPartial = critiqueItem?.status === 'partial';

                  return (
                    <div
                      key={sIdx}
                      className={`p-3.5 rounded-2xl border text-xs sm:text-sm space-y-1.5 ${
                        isGood
                          ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                          : isPartial
                          ? 'border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20'
                          : 'border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span className="text-slate-800 dark:text-slate-200">
                          Step {step.stepNumber}: {step.text}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${
                            isGood
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200'
                              : isPartial
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200'
                          }`}
                        >
                          {critiqueItem?.status || 'verified'}
                        </span>
                      </div>
                      {step.mathExpression && (
                        <div className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 pl-2 border-l-2 border-indigo-400">
                          {step.mathExpression}
                        </div>
                      )}
                      {critiqueItem?.critique && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                          Examiner Note: {critiqueItem.critique}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Board Presentation Tips & Missing Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.boardPresentationTips && result.boardPresentationTips.length > 0 && (
              <div className="p-5 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Board Exam Presentation Secrets</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                  {result.boardPresentationTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Examiner Improvement Advice</span>
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                {result.improvementTip}
              </p>
              {result.finalAnswer && (
                <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">Expected Final Answer: </span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">{result.finalAnswer}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
