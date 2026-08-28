import React, { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle2, AlertCircle, AlertTriangle, Sparkles, Loader2, Award } from 'lucide-react';
import { checkAIHandwrittenSolution } from '../../services/aiClient';
import { HandwrittenSolutionAnalysis } from '../../types';

interface HandwrittenSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject?: string;
  classLevel?: string;
}

export const HandwrittenSolutionModal: React.FC<HandwrittenSolutionModalProps> = ({
  isOpen,
  onClose,
  subject = 'Science',
  classLevel = '10',
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [problemText, setProblemText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<HandwrittenSolutionAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setAnalysis(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setErrorMsg('Please upload or snap a photo of your handwritten notebook solution.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await checkAIHandwrittenSolution({
        imageBase64: selectedImage,
        mimeType: imageMimeType,
        problemStatement: problemText,
        subject,
        classLevel,
      });
      setAnalysis(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze handwriting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setSelectedImage(null);
    setAnalysis(null);
    setErrorMsg(null);
    setProblemText('');
  };

  return (
    <div
      id="handwritten-solution-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="handwritten-solution-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Check My Handwritten Working</h3>
              <p className="text-xs text-slate-500">AI step-by-step audit for school & board exam working</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {!analysis ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  Question / Problem Statement (Optional)
                </label>
                <input
                  type="text"
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder="e.g. Find the work done by a force of 250 N moving an object 4 meters..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Upload Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  selectedImage
                    ? 'border-indigo-400 bg-indigo-50/20'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {selectedImage ? (
                  <div className="space-y-3">
                    <img
                      src={selectedImage}
                      alt="Handwritten solution"
                      className="max-h-56 mx-auto rounded-xl object-contain shadow-sm border border-slate-200"
                    />
                    <p className="text-xs font-semibold text-indigo-600">Click to change photo</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">Upload or snap handwritten solution</p>
                    <p className="text-xs text-slate-500">Supports photos of paper, notebook sheets, or tablet drawings</p>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                id="analyze-handwriting-btn"
                onClick={handleAnalyze}
                disabled={isLoading || !selectedImage}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Handwriting & Calculations...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Handwritten Solution</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Analysis Results */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Score & Verdict Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  analysis.overallResult === 'correct'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : analysis.overallResult === 'partially_correct'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Award className="w-7 h-7" />
                  <div>
                    <h4 className="font-extrabold text-sm uppercase tracking-wider">
                      {analysis.overallResult === 'correct'
                        ? 'Accurate Solution'
                        : analysis.overallResult === 'partially_correct'
                        ? 'Partially Correct Working'
                        : 'Review Required'}
                    </h4>
                    <p className="text-xs">
                      {analysis.overallResult === 'correct'
                        ? 'Full marks on step-wise board marking scheme.'
                        : 'Minor errors detected in calculations or missing units.'}
                    </p>
                  </div>
                </div>
                {analysis.scoreOutOf10 !== undefined && (
                  <div className="text-right">
                    <span className="text-2xl font-black">{analysis.scoreOutOf10}</span>
                    <span className="text-xs font-semibold">/10</span>
                  </div>
                )}
              </div>

              {analysis.unclearHandwritingWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Some words were blurry. Ensure bright lighting for best accuracy.</span>
                </div>
              )}

              {/* Step Breakdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Correct Parts */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Accurate Steps</span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                    {analysis.correctParts.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>

                {/* Errors & Missing Steps */}
                <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Identified Slip / Missing Step</span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                    {analysis.errors.concat(analysis.missingSteps).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Final Answer & Tip */}
              {analysis.finalAnswer && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Canonical Final Answer
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-900">{analysis.finalAnswer}</p>
                </div>
              )}

              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-950 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Board Exam Tip:</strong> {analysis.improvementTip}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={resetAll}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  Check Another Solution
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
