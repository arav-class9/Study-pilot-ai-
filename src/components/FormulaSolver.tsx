import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Calculator,
  X,
} from 'lucide-react';
import katex from 'katex';
import { solveFormulaAPI, FormulaSolverResult, QuotaExceededError } from '../services/aiClient';
import { useApp } from '../context/AppContext';

/**
 * LaTeX Math Renderer Component supporting both $inline$ and $$display$$ delimiters
 */
export const LatexMath: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  if (!text) return null;

  const renderContent = () => {
    const parts: React.ReactNode[] = [];
    const regex = /\$\$([\s\S]*?)\$\$|\$([^\$\n]+?)\$/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    let keyIdx = 0;
    while ((match = regex.exec(text)) !== null) {
      // Push preceding plain text
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${keyIdx++}`}>
            {text.slice(lastIndex, match.index)}
          </span>
        );
      }

      const isDisplay = match[1] !== undefined;
      const mathExpr = (isDisplay ? match[1] : match[2]) || '';

      try {
        const html = katex.renderToString(mathExpr.trim(), {
          displayMode: isDisplay,
          throwOnError: false,
        });

        if (isDisplay) {
          parts.push(
            <div
              key={`math-display-${keyIdx++}`}
              className="my-3 overflow-x-auto py-1 px-3 bg-slate-900/5 dark:bg-slate-800/60 rounded-xl text-center text-indigo-900 dark:text-indigo-200 font-serif"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } else {
          parts.push(
            <span
              key={`math-inline-${keyIdx++}`}
              className="inline-block px-1 text-indigo-800 dark:text-indigo-300 font-serif"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
      } catch (err) {
        parts.push(
          <code key={`math-fallback-${keyIdx++}`} className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-amber-700">
            {mathExpr}
          </code>
        );
      }

      lastIndex = regex.lastIndex;
    }

    // Push remaining plain text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-tail-${keyIdx++}`}>
          {text.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return <div className={`leading-relaxed ${className}`}>{renderContent()}</div>;
};

export const FormulaSolver: React.FC<{
  defaultSubject?: string;
  defaultClassLevel?: string;
  onSaveToNotes?: (solution: FormulaSolverResult) => void;
}> = ({
  defaultSubject = 'mathematics',
  defaultClassLevel = '10',
  onSaveToNotes,
}) => {
  const { user, setIsUpgradeModalOpen } = useApp();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [problemText, setProblemText] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [classLevel, setClassLevel] = useState(defaultClassLevel);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState(false);
  const [result, setResult] = useState<FormulaSolverResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (PNG, JPEG, WebP) or single-page PDF.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds the 15MB limit.');
      return;
    }

    setError(null);
    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleSolve = async () => {
    if (!selectedFile && !problemText.trim()) {
      setError('Please upload an equation image/PDF or type in the formula statement.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsQuotaError(false);

    try {
      const solution = await solveFormulaAPI({
        file: selectedFile || undefined,
        problemText: problemText.trim() || undefined,
        subject,
        classLevel,
      });

      setResult(solution);
    } catch (err: any) {
      console.error('[FORMULA SOLVER CLIENT ERROR]:', err);
      if (err instanceof QuotaExceededError || err.code === 'QUOTA_EXCEEDED') {
        setIsQuotaError(true);
        setError('You have reached your daily AI question quota.');
      } else {
        setError(err.message || 'Failed to solve formula. Please verify the image clarity and retry.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySolution = () => {
    if (!result) return;
    const textToCopy = `Formula Solution:\n\nProblem: ${result.problemText}\n\nSteps:\n${result.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nFinal Answer: ${result.finalAnswer}\n\nKey Formulas: ${result.keyFormulas.join(', ')}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    if (onSaveToNotes) {
      onSaveToNotes(result);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const clearForm = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setProblemText('');
    setResult(null);
    setError(null);
    setIsQuotaError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div id="formula-solver-container" className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300">
              <Calculator className="w-3.5 h-3.5" />
              <span>Multi-Modal Formula Solver • NCERT &amp; CBSE Grounded</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Formula &amp; Numerical AI Solver 📐
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Upload textbook photos, handwritten math formulas, or problem PDFs. Get instant step-by-step LaTeX derivations and curriculum-verified answers.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 text-xs">
            <span className="text-slate-300">Plan:</span>
            <span className="font-bold text-amber-300 uppercase tracking-wide">
              {user.subscriptionPlan || 'Free'}
            </span>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Subject & Class Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Subject Category
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="mathematics">Mathematics (Algebra, Calculus, Geometry)</option>
              <option value="physics">Physics (Mechanics, Optics, Electricity)</option>
              <option value="chemistry">Chemistry (Physical, Stoichiometry, Equations)</option>
              <option value="general_science">General Science</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Curriculum Standard
            </label>
            <select
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="9">Class 9 (NCERT / CBSE Foundation)</option>
              <option value="10">Class 10 (NCERT / Board Standard)</option>
              <option value="11">Class 11 (NCERT / JEE / NEET Foundation)</option>
              <option value="12">Class 12 (NCERT / Board &amp; Entrance)</option>
            </select>
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Formula Document or Photo (PNG, JPG, WebP, PDF)
          </label>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {selectedFile ? (
              <div className="space-y-3 w-full max-w-md">
                {filePreview ? (
                  <div className="relative mx-auto max-h-48 max-w-xs overflow-hidden rounded-xl border border-slate-200 shadow-xs">
                    <img src={filePreview} alt="Formula Preview" className="w-full h-auto object-contain" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setFilePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-1 rounded-full text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                    <FileText className="w-5 h-5" />
                    <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
                <p className="text-xs text-slate-500">Click or drag a different file to replace</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Drag and drop your formula photo or PDF here
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Supports high-res camera captures, whiteboard notes, and textbook snips (max 15MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Optional Problem Context / Prompt */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Or Type / Supplement Problem Statement (Optional LaTeX supported)
          </label>
          <textarea
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            placeholder="e.g. Find the focal length of a concave mirror if an object placed at 20 cm forms an inverted image at 40 cm. Or paste raw LaTeX: \frac{1}{f} = \frac{1}{v} + \frac{1}{u}"
            rows={3}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={clearForm}
            disabled={isLoading || (!selectedFile && !problemText && !result)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
          >
            Clear Fields
          </button>

          <button
            type="button"
            onClick={handleSolve}
            disabled={isLoading || (!selectedFile && !problemText.trim())}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl shadow-md transition-all cursor-pointer disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing &amp; Solving with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Solve Formula with LaTeX Derivations</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error / Quota Exceeded Alerts */}
      {error && (
        <div
          role="alert"
          className={`rounded-2xl p-4 border flex items-start gap-3 ${
            isQuotaError
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          {isQuotaError ? (
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-2 flex-1">
            <p className="text-sm font-bold">{error}</p>
            {isQuotaError && (
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Upgrade Plan for Unlimited Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Solution Results Card */}
      {result && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-fade-in">
          {/* Result Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Step-by-Step Derivation &amp; Solution
                </h3>
                <span className="text-xs text-slate-500">Verified against NCERT Class {classLevel} curriculum</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySolution}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied!' : 'Copy LaTeX'}</span>
              </button>
              {onSaveToNotes && (
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isSaved ? 'Saved to Notes!' : 'Save to Notes'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Extracted Problem Statement */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Recognized Problem Statement
            </span>
            <LatexMath text={result.problemText} className="text-sm font-medium text-slate-800 dark:text-slate-200" />
          </div>

          {/* Key Formulas Applied */}
          {result.keyFormulas && result.keyFormulas.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                Key Formulas &amp; Principles
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.keyFormulas.map((formula, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50"
                  >
                    <LatexMath text={formula} className="text-xs sm:text-sm font-semibold text-indigo-950 dark:text-indigo-200" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Derivation */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Detailed Mathematical Steps
            </span>
            <div className="space-y-3">
              {result.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs"
                >
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 text-sm text-slate-800 dark:text-slate-200">
                    <LatexMath text={step} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Answer Highlight Box */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-5 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Final Answer
            </span>
            <LatexMath
              text={result.finalAnswer}
              className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-200"
            />
          </div>

          {/* Common Pitfalls & Traps to Avoid */}
          {result.commonPitfalls && result.commonPitfalls.length > 0 && (
            <div className="rounded-2xl p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Common Exam Pitfalls &amp; Traps to Avoid</span>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200 list-disc list-inside">
                {result.commonPitfalls.map((pitfall, pIdx) => (
                  <li key={pIdx}>
                    <span className="font-normal">{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
