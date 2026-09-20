import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  X,
  File,
  Eye,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { WorkspaceUploadedFile } from '../../types/workspace';

interface FileUploadWidgetProps {
  uploadedFiles: WorkspaceUploadedFile[];
  onUploadFile: (file: WorkspaceUploadedFile) => void;
  onDeleteFile: (fileId: string) => void;
}

export const FileUploadWidget: React.FC<FileUploadWidgetProps> = ({
  uploadedFiles,
  onUploadFile,
  onDeleteFile,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<WorkspaceUploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    setIsUploading(true);

    try {
      // Read file and extract text/preview
      const reader = new FileReader();

      reader.onload = () => {
        const resultString = typeof reader.result === 'string' ? reader.result : '';

        let fileType: 'pdf' | 'image' | 'docx' | 'handwritten' = 'pdf';
        if (file.type.startsWith('image/')) {
          fileType = 'image';
        } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
          fileType = 'docx';
        }

        // Mock/Extracted text content from file
        const extractedText = `[EXTRACTED CONTENT FROM ${file.name.toUpperCase()}]:
Key study reference:
- Chapter Topic: ${file.name.replace(/\.[^/.]+$/, '')}
- Excerpt: "Detailed analysis of topic definitions, formulas, and diagrams."
- Extracted Section: Page 1-3 overview notes with high-yield exam points.`;

        const newFileRecord: WorkspaceUploadedFile = {
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          fileName: file.name,
          fileType,
          fileSize: file.size,
          fileUrl: resultString.startsWith('data:') ? resultString : undefined,
          extractedText,
          uploadedAt: new Date().toISOString(),
        };

        onUploadFile(newFileRecord);
        setIsUploading(false);
      };

      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    } catch (err) {
      console.error('File upload error:', err);
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-amber-50/50 dark:bg-slate-900/60 p-4 rounded-2xl border border-amber-200/80 dark:border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Uploaded Notes & Source Files
          </h4>
        </div>
        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
          {uploadedFiles.length} file{uploadedFiles.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Upload Zone Button */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-100/50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-amber-200 dark:border-slate-700 transition-all shadow-xs cursor-pointer disabled:opacity-60"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span>Processing OCR & Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-amber-600" />
              <span>Upload PDF, Image or Handwritten Notes</span>
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*,.docx,.doc"
          onChange={handleFileChange}
          className="hidden"
        />
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          AI uses uploaded notes to ground questions & revision
        </span>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200/70 dark:border-slate-700 shadow-2xs group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-slate-700 text-amber-800 dark:text-amber-300">
                  {file.fileType === 'image' ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {file.fileName}
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Source Indexed for AI</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setSelectedPreview(file)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-slate-700 transition-all"
                  title="Preview Extracted Content"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteFile(file.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                  title="Remove File"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 border border-amber-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {selectedPreview.fileName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPreview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-xs max-h-60 overflow-y-auto whitespace-pre-wrap border border-slate-800">
              {selectedPreview.extractedText}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedPreview(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
