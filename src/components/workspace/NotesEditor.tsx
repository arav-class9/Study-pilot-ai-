import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Edit3,
  BookOpen,
  HelpCircle,
  Code2,
  Check,
  Copy,
  Download,
  Loader2,
  Layers,
  Map,
  FileCode2,
  List,
  Zap,
} from 'lucide-react';
import { NoteType, TopicWorkspaceItem, WorkspaceUploadedFile } from '../../types/workspace';
import { FileUploadWidget } from './FileUploadWidget';
import { fetchGeneratedNotes } from '../../services/topicWorkspaceClient';

interface NotesEditorProps {
  topic: TopicWorkspaceItem;
  onUpdateTopic: (updated: TopicWorkspaceItem) => void;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({ topic, onUpdateTopic }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeNoteType, setActiveNoteType] = useState<NoteType>(topic.notes.noteType || 'detailed');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);

  const noteButtons: { type: NoteType; label: string; icon: any; color: string }[] = [
    { type: 'detailed', label: 'Detailed Notes', icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400' },
    { type: 'short', label: 'Short Notes', icon: Zap, color: 'text-amber-600 dark:text-amber-400' },
    { type: 'exam', label: 'Exam Notes', icon: Sparkles, color: 'text-purple-600 dark:text-purple-400' },
    { type: 'definitions', label: 'Important Definitions', icon: FileText, color: 'text-blue-600 dark:text-blue-400' },
    { type: 'key_points', label: 'Key Points', icon: List, color: 'text-emerald-600 dark:text-emerald-400' },
    { type: 'examples', label: 'Examples', icon: Layers, color: 'text-teal-600 dark:text-teal-400' },
    { type: 'formulas', label: 'Formulas', icon: Code2, color: 'text-rose-600 dark:text-rose-400' },
    { type: 'concept_map', label: 'Concept Map', icon: Map, color: 'text-cyan-600 dark:text-cyan-400' },
    { type: 'summary', label: 'Summarize', icon: FileCode2, color: 'text-orange-600 dark:text-orange-400' },
  ];

  const handleGenerateNotes = async (type: NoteType) => {
    setActiveNoteType(type);
    setIsGenerating(true);

    try {
      const combinedUploadContext = topic.uploadedFiles
        .map((f) => f.extractedText)
        .filter(Boolean)
        .join('\n\n');

      const markdown = await fetchGeneratedNotes({
        topicName: topic.topicName,
        subject: topic.subject,
        classLevel: topic.classLevel,
        chapter: topic.chapter,
        noteType: type,
        uploadedContextText: combinedUploadContext,
      });

      const updatedTopic: TopicWorkspaceItem = {
        ...topic,
        notes: {
          ...topic.notes,
          aiGeneratedText: markdown,
          noteType: type,
          lastGeneratedAt: new Date().toISOString(),
        },
      };

      onUpdateTopic(updatedTopic);
      setActiveTab('preview');
    } catch (err) {
      console.error('Notes generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualNotesChange = (text: string) => {
    const updatedTopic: TopicWorkspaceItem = {
      ...topic,
      notes: {
        ...topic.notes,
        studentManualText: text,
      },
    };
    onUpdateTopic(updatedTopic);
  };

  const handleUploadFile = (file: WorkspaceUploadedFile) => {
    const updatedTopic: TopicWorkspaceItem = {
      ...topic,
      uploadedFiles: [...topic.uploadedFiles, file],
    };
    onUpdateTopic(updatedTopic);
  };

  const handleDeleteFile = (fileId: string) => {
    const updatedTopic: TopicWorkspaceItem = {
      ...topic,
      uploadedFiles: topic.uploadedFiles.filter((f) => f.id !== fileId),
    };
    onUpdateTopic(updatedTopic);
  };

  const copyToClipboard = () => {
    const textToCopy = `${topic.notes.aiGeneratedText}\n\n--- STUDENT NOTES ---\n${topic.notes.studentManualText}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Note Style Action Buttons */}
      <div className="bg-amber-50/70 dark:bg-slate-900/80 p-4 rounded-2xl border border-amber-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
              AI Notes Generator & Formats
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Click any button to generate specific study notes
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {noteButtons.map((btn) => {
            const Icon = btn.icon;
            const isSelected = activeNoteType === btn.type;
            return (
              <button
                key={btn.type}
                type="button"
                onClick={() => handleGenerateNotes(btn.type)}
                disabled={isGenerating}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                  isSelected
                    ? 'bg-amber-100 dark:bg-slate-800 border-amber-400 dark:border-amber-500 text-slate-900 dark:text-amber-200 shadow-xs ring-2 ring-amber-400/20'
                    : 'bg-white dark:bg-slate-950/60 border-amber-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100/50 dark:hover:bg-slate-800'
                } disabled:opacity-50`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${btn.color}`} />
                <span className="truncate">{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* File Upload Section */}
      <FileUploadWidget
        uploadedFiles={topic.uploadedFiles}
        onUploadFile={handleUploadFile}
        onDeleteFile={handleDeleteFile}
      />

      {/* Main Digital Notebook Canvas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-200/90 dark:border-slate-800 shadow-md overflow-hidden relative">
        {/* Notebook Top Bar Header */}
        <div className="px-5 py-3.5 bg-amber-100/50 dark:bg-slate-800/80 border-b border-amber-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          {/* Content Source Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>AI Generated ({activeNoteType.toUpperCase()})</span>
            </span>

            {topic.notes.studentManualText.trim() && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800">
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Student Created & Edited</span>
              </span>
            )}

            {topic.uploadedFiles.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>{topic.uploadedFiles.length} Uploaded Source File(s)</span>
              </span>
            )}
          </div>

          {/* Controls: Edit/Preview Toggle & Copy */}
          <div className="flex items-center gap-2">
            <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-amber-200 dark:border-slate-700 flex items-center gap-1 text-xs font-bold">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'preview'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-amber-50'
                }`}
              >
                Notebook View
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'editor'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-amber-50'
                }`}
              >
                Edit Notes
              </button>
            </div>

            <button
              onClick={copyToClipboard}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-50 text-xs font-bold flex items-center gap-1"
              title="Copy All Notes"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Paper Notebook Texture & Content Area */}
        <div className="p-6 min-h-[400px] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
          {isGenerating ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Crafting official AI study notes for {topic.topicName}...
              </div>
              <div className="text-xs text-slate-500">
                Prioritizing uploaded materials & curriculum mark-scheme rules
              </div>
            </div>
          ) : activeTab === 'preview' ? (
            <div className="space-y-6">
              {/* AI Generated Markdown Section */}
              {topic.notes.aiGeneratedText ? (
                <div className="prose prose-amber dark:prose-invert max-w-none font-serif text-slate-800 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-wrap bg-amber-50/30 dark:bg-slate-900/40 p-5 rounded-2xl border border-amber-200/50 dark:border-slate-800">
                  {topic.notes.aiGeneratedText}
                </div>
              ) : (
                <div className="text-center py-10 bg-amber-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-amber-300 dark:border-slate-800 space-y-3">
                  <FileText className="w-8 h-8 text-amber-600 mx-auto" />
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    No AI Notes Generated Yet
                  </div>
                  <button
                    onClick={() => handleGenerateNotes('detailed')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Notes Now</span>
                  </button>
                </div>
              )}

              {/* Student Manual Notes Block */}
              <div className="bg-amber-100/40 dark:bg-slate-800/50 p-5 rounded-2xl border border-amber-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      My Personal Classroom Notes & Additions
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                    Student Written
                  </span>
                </div>

                <textarea
                  value={topic.notes.studentManualText}
                  onChange={(e) => handleManualNotesChange(e.target.value)}
                  placeholder="Type your own classroom notes, teacher tips, exam reminders, or personal formulas here..."
                  rows={5}
                  className="w-full p-3.5 rounded-xl border border-amber-300/80 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                />
              </div>
            </div>
          ) : (
            /* Manual Raw Markdown Editor Mode */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Edit AI Generated Notes Markdown
                </label>
                <textarea
                  value={topic.notes.aiGeneratedText}
                  onChange={(e) => {
                    onUpdateTopic({
                      ...topic,
                      notes: { ...topic.notes, aiGeneratedText: e.target.value },
                    });
                  }}
                  rows={12}
                  className="w-full p-4 rounded-xl border border-amber-300 dark:border-slate-700 bg-slate-950 text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  My Personal Classroom Additions
                </label>
                <textarea
                  value={topic.notes.studentManualText}
                  onChange={(e) => handleManualNotesChange(e.target.value)}
                  rows={5}
                  className="w-full p-3.5 rounded-xl border border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
