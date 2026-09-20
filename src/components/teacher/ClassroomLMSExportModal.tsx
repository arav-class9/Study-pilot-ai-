import React, { useState } from 'react';
import { Download, FileText, CheckCircle2, Share2, Sparkles, X, Globe, Layers } from 'lucide-react';

interface ClassroomLMSExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassroomLMSExportModal: React.FC<ClassroomLMSExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [exportFormat, setExportFormat] = useState<'google_classroom' | 'csv' | 'pdf_summary' | 'lti'>('google_classroom');
  const [exportedSuccess, setExportedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setExportedSuccess(true);
    setTimeout(() => {
      // Simulate file download / export
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        schema: "LTI_1.3_NCERT_Analytics",
        exportDate: new Date().toISOString(),
        studentSummary: {
          totalQuestionsSolved: 48,
          averageAccuracy: "88.5%",
          weakTopics: ["Chemical Reactions - Balancing", "Quadratic Discriminant"],
          superMemoRetentionRate: "92%",
        }
      }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `studypilot_classroom_analytics_${Date.now()}.${exportFormat === 'csv' ? 'csv' : 'json'}`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  LMS & Open Science Standards
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                  Google Classroom / LTI 1.3
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Export Analytics & NCERT Reports
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Select Export Target / Schema
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setExportFormat('google_classroom')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                exportFormat === 'google_classroom'
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-amber-300'
              }`}
            >
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                🏫 Google Classroom
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Direct assignment grade sync</span>
            </button>

            <button
              onClick={() => setExportFormat('csv')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                exportFormat === 'csv'
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-amber-300'
              }`}
            >
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                📊 CSV Spreadsheet
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Excel & Google Sheets format</span>
            </button>

            <button
              onClick={() => setExportFormat('pdf_summary')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                exportFormat === 'pdf_summary'
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-amber-300'
              }`}
            >
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                📄 PDF Progress Report
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Printable student report card</span>
            </button>

            <button
              onClick={() => setExportFormat('lti')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                exportFormat === 'lti'
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-amber-300'
              }`}
            >
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                🌐 LTI 1.3 / Moodle
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Open educational platform payload</span>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {exportedSuccess ? (
            <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Export generated and downloaded successfully!</span>
            </div>
          ) : (
            <button
              onClick={handleExport}
              className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-widest shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export {exportFormat.replace('_', ' ').toUpperCase()} Report</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
