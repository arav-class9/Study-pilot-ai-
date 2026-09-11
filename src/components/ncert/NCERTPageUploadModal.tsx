import React, { useState, useRef } from 'react';
import { NCERTService } from '../../services/ncertService';
import { NCERTPageContent, NCERTChapter } from '../../types/ncert';
import {
  X,
  Upload,
  Camera,
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Layers,
} from 'lucide-react';

interface NCERTPageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter?: NCERTChapter;
  onPageLoaded: (page: NCERTPageContent, customChapterName?: string) => void;
  onDirectQuiz: (page: NCERTPageContent, pageNumber: number) => void;
}

export const NCERTPageUploadModal: React.FC<NCERTPageUploadModalProps> = ({
  isOpen,
  onClose,
  chapter,
  onPageLoaded,
  onDirectQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'text'>('photo');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [classLevel, setClassLevel] = useState<string>(chapter?.classLevel || '10');
  const [subject, setSubject] = useState<string>(chapter?.subjectId || 'science');
  const [chapterHint, setChapterHint] = useState<string>(chapter?.title || '');
  const [pageNumberInput, setPageNumberInput] = useState<string>('1');

  const [loading, setLoading] = useState<boolean>(false);
  const [processedResult, setProcessedResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload an image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (activeTab === 'photo' && !imagePreview) {
      setErrorMsg('Please select or capture a photo of your NCERT book page first.');
      return;
    }
    if (activeTab === 'text' && !pastedText.trim()) {
      setErrorMsg('Please paste the book page text first.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await NCERTService.processUploadedPage({
        image: activeTab === 'photo' ? imagePreview || undefined : undefined,
        text: activeTab === 'text' ? pastedText.trim() : undefined,
        classLevel,
        subject,
        chapterHint,
      });

      setProcessedResult(result);
    } catch (err: any) {
      console.error('Upload OCR failed:', err);
      setErrorMsg(err.message || 'Failed to analyze page. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const buildPageContent = (): NCERTPageContent => {
    if (!processedResult) {
      return {
        pageNumber: parseInt(pageNumberInput, 10) || 1,
        sectionTitle: chapterHint || 'Uploaded Book Page',
        paragraphs: pastedText.split('\n\n').filter(Boolean),
        keyConcepts: [],
        ncertHighlights: [],
        pageType: 'theory',
      };
    }

    return {
      pageNumber: processedResult.detectedPageNumber || parseInt(pageNumberInput, 10) || 1,
      sectionTitle: processedResult.sectionTitle || 'Custom Uploaded NCERT Page',
      paragraphs: processedResult.paragraphs || [processedResult.transcribedText],
      keyConcepts: processedResult.keyConcepts || [],
      formulas: processedResult.formulas || [],
      ncertHighlights: processedResult.ncertHighlights || [],
      inTextQuestions: (processedResult.inTextQuestions || []).map((q: string) => ({
        question: q,
      })),
      pageType: 'theory',
    };
  };

  const handleOpenInReader = () => {
    const page = buildPageContent();
    onPageLoaded(page, processedResult?.detectedChapter || chapterHint);
    onClose();
  };

  const handleGenerateQuizDirectly = () => {
    const page = buildPageContent();
    onDirectQuiz(page, page.pageNumber);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Top Header */}
        <div className="bg-linear-to-r from-indigo-600 to-violet-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Upload className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Upload NCERT Book Page</h3>
              <p className="text-xs text-indigo-100">
                Snap a photo or paste text to generate an instant interactive quiz
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Mode Switcher: Photo vs Text */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => {
                setActiveTab('photo');
                setProcessedResult(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'photo'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Upload Book Page Photo</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('text');
                setProcessedResult(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'text'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Paste Textbook Excerpt</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Photo Mode */}
          {activeTab === 'photo' && !processedResult && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-56 bg-slate-900 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Book Page Preview"
                    className="max-h-56 object-contain"
                  />
                  <button
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40"
                >
                  <Camera className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    Click to browse or take a photo of your book page
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Supports JPG, PNG, WebP (ensure text is clearly readable)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Text Paste Mode */}
          {activeTab === 'text' && !processedResult && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Book Page Text Content
              </label>
              <textarea
                rows={6}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the paragraphs, definitions, and equations from your NCERT book page here..."
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-serif"
              />
            </div>
          )}

          {/* Processed Results Card */}
          {processedResult && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                <CheckCircle className="w-4 h-4" />
                <span>Page Successfully Transcribed &amp; Structured!</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-slate-500 block text-[10px]">Chapter</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {processedResult.detectedChapter}
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-slate-500 block text-[10px]">Page Number</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Page {processedResult.detectedPageNumber}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 font-serif bg-white dark:bg-slate-800 p-3 rounded-lg border max-h-36 overflow-y-auto">
                <p className="font-bold mb-1">{processedResult.sectionTitle}</p>
                <p className="line-clamp-4">{processedResult.transcribedText}</p>
              </div>

              {processedResult.keyConcepts?.length > 0 && (
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Key Takeaways: </span>
                  {processedResult.keyConcepts.join(' • ')}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {!processedResult ? (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Transcribing &amp; Analyzing Page with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Analyze &amp; Process Page</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={handleOpenInReader}
                className="w-full sm:flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Read Page in Viewer</span>
              </button>

              <button
                onClick={handleGenerateQuizDirectly}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>⚡ Instant Quiz from this Page</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
