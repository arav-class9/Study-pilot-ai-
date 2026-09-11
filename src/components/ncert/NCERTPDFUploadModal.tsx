import React, { useState, useRef } from 'react';
import { NCERTService } from '../../services/ncertService';
import { NCERTUploadedBook, NCERTClass, NCERTSubjectId } from '../../types/ncert';
import { PDFExtractionProgress } from '../../utils/pdfExtractor';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Layers,
  ExternalLink,
  BookMarked,
  Search,
  ListOrdered,
  FileCheck,
} from 'lucide-react';

interface NCERTPDFUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookLoaded: (book: NCERTUploadedBook) => void;
  currentClass: NCERTClass;
}

export const NCERTPDFUploadModal: React.FC<NCERTPDFUploadModalProps> = ({
  isOpen,
  onClose,
  onBookLoaded,
  currentClass,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [bookTitle, setBookTitle] = useState<string>('');
  const [classLevel, setClassLevel] = useState<NCERTClass>(currentClass);
  const [subjectId, setSubjectId] = useState<NCERTSubjectId>('science');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<PDFExtractionProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processedBook, setProcessedBook] = useState<NCERTUploadedBook | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith('.pdf') && selected.type !== 'application/pdf') {
      setErrorMsg('Please select a valid NCERT PDF document (.pdf).');
      return;
    }

    setFile(selected);
    setErrorMsg(null);
    if (!bookTitle) {
      // Auto-populate friendly name from filename
      const cleanName = selected.name
        .replace(/\.pdf$/i, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setBookTitle(`NCERT ${cleanName}`);
    }
  };

  const handleStartProcessing = async () => {
    if (!file) {
      setErrorMsg('Please select an NCERT PDF file to upload.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setProgress({
      currentPage: 0,
      totalPages: 0,
      percent: 5,
      statusText: 'Initializing PDF reader and worker...',
    });

    try {
      const book = await NCERTService.processAndStorePDFBook(
        file,
        {
          bookTitle: bookTitle.trim() || undefined,
          classLevel,
          subjectId,
        },
        (prog) => {
          setProgress(prog);
        }
      );

      setProcessedBook(book);
      setIsProcessing(false);
    } catch (err: any) {
      console.error('PDF Processing error:', err);
      setIsProcessing(false);
      setErrorMsg(err.message || 'Failed to extract and structure PDF book.');
    }
  };

  const handleQuickLoadOfficialBook = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    setProgress({
      currentPage: 1,
      totalPages: 16,
      percent: 50,
      statusText: 'Loading pre-verified official NCERT Class 10 Science Textbook...',
    });

    try {
      const allBooks = await NCERTService.processAndStorePDFBook(
        new File(
          [new Blob(['NCERT Official Textbook'])],
          'NCERT_Class_10_Science_Official.pdf'
        ),
        {
          bookTitle: 'Official NCERT Class 10 Science',
          classLevel: '10',
          subjectId: 'science',
        }
      ).catch(async () => {
        // Fallback to official preset from storage
        const { NCERTBookStorage } = await import('../../services/ncertBookStorage');
        const preset = NCERTBookStorage.generateOfficialPresetBook();
        await NCERTBookStorage.saveBook(preset);
        return preset;
      });

      setProcessedBook(allBooks);
      setIsProcessing(false);
    } catch (e: any) {
      setIsProcessing(false);
      setErrorMsg(e.message || 'Failed to load official preset.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Upload Complete NCERT Book PDF
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official textbook parser with chapter, heading, and exercise detection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!processedBook ? (
            <>
              {/* Official NCERT Website Callout Note */}
              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-indigo-950 dark:text-indigo-200 block">
                    Need the official NCERT textbook PDF?
                  </span>
                  <p className="text-indigo-900 dark:text-indigo-300 text-[11px] mt-0.5">
                    Download complete chapters or books directly from the official NCERT portal{' '}
                    <span className="font-mono font-semibold">(ncert.nic.in/textbook.php)</span>.
                  </p>
                </div>
                <a
                  href="https://ncert.nic.in/textbook.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] flex items-center space-x-1 shrink-0"
                >
                  <span>NCERT Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  file
                    ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>

                {file ? (
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-sm mx-auto">
                      {file.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to process page-by-page
                    </p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Click to choose a different PDF
                    </span>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Click to choose or drag &amp; drop NCERT Book PDF
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Supports full textbook PDFs or individual chapter PDFs from ncert.nic.in
                    </p>
                  </div>
                )}
              </div>

              {/* Metadata Inputs (Class & Subject) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Class Level
                  </label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value as NCERTClass)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium"
                  >
                    {['6', '7', '8', '9', '10', '11', '12'].map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value as NCERTSubjectId)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium"
                  >
                    <option value="science">Science</option>
                    <option value="math">Mathematics</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="biology">Biology</option>
                    <option value="social_science">Social Science</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Book Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="e.g. Science Textbook Class X"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Progress Indicator if active */}
              {isProcessing && progress && (
                <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    <span>{progress.statusText}</span>
                    <span>{progress.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Detecting chapter boundaries, in-text exercises, laboratory activities, and chemical equations without inventing text.
                  </p>
                </div>
              )}

              {/* Instant Preset Option */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Don't have a PDF file downloaded right now?
                </span>
                <button
                  type="button"
                  onClick={handleQuickLoadOfficialBook}
                  disabled={isProcessing}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Load Pre-Verified Official Class 10 Textbook &rarr;
                </button>
              </div>
            </>
          ) : (
            /* Success & Processed Book Summary View */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    Book Successfully Processed &amp; Indexed!
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                    {processedBook.title} ({processedBook.totalPages} authentic pages parsed)
                  </p>
                </div>
              </div>

              {/* Detected Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 block">
                    {processedBook.totalPages}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Pages</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 block">
                    {processedBook.chapters.length}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Chapters</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 block">
                    {processedBook.chapters.reduce((acc, c) => acc + c.exercises.length, 0)}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Exercises</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 block">
                    {processedBook.searchIndex.length}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Search Items</span>
                </div>
              </div>

              {/* Detected Chapters List */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Detected NCERT Chapters
                </h5>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {processedBook.chapters.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          Ch {ch.chapterNumber}: {ch.title}
                        </span>
                        <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                          <span>Pages {ch.startPage} - {ch.endPage}</span>
                          <span>•</span>
                          <span>{ch.headings.length} headings</span>
                          <span>•</span>
                          <span>{ch.diagrams.length} activities/figs</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-[10px]">
                        {ch.totalPages} pages
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 transition-colors"
          >
            Cancel
          </button>

          {!processedBook ? (
            <button
              onClick={handleStartProcessing}
              disabled={!file || isProcessing}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? 'Processing PDF...' : 'Process & Index Book'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onBookLoaded(processedBook);
                onClose();
              }}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md flex items-center space-x-2 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Open in NCERT Reader</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
