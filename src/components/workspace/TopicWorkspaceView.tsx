import React, { useState, useEffect } from 'react';
import { NoteType, TopicWorkspaceItem } from '../../types/workspace';
import {
  getAllTopicWorkspaces,
  saveTopicWorkspace,
  deleteTopicWorkspace,
  createNewTopicWorkspace,
} from '../../services/topicWorkspaceStorage';
import { fetchGeneratedNotes } from '../../services/topicWorkspaceClient';
import { TopicHeader } from './TopicHeader';
import { TopicDefinitionBlock } from './TopicDefinitionBlock';
import { LeftTopicSidebar } from './LeftTopicSidebar';
import { RightDockedPanel } from './RightDockedPanel';
import { NotesEditor } from './NotesEditor';
import { SelfExplanation } from './SelfExplanation';
import { QuestionBank } from './QuestionBank';
import { ActiveRecallMode } from './ActiveRecallMode';
import { TopicProgressTracker } from './TopicProgressTracker';
import { RevisionGenerator } from './RevisionGenerator';
import { TopicListDrawer } from './TopicListDrawer';
import { CreateTopicModal } from './CreateTopicModal';
import { BookOpen, Plus, ArrowLeft } from 'lucide-react';

interface TopicWorkspaceViewProps {
  onBackToDashboard?: () => void;
}

export const TopicWorkspaceView: React.FC<TopicWorkspaceViewProps> = ({
  onBackToDashboard,
}) => {
  const [topics, setTopics] = useState<TopicWorkspaceItem[]>([]);
  const [currentTopic, setCurrentTopic] = useState<TopicWorkspaceItem | null>(null);
  const [activeSection, setActiveSection] = useState<
    'learn' | 'notes' | 'explain' | 'practice' | 'recall' | 'revision'
  >('learn');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  // Load topics on mount
  useEffect(() => {
    const loaded = getAllTopicWorkspaces();
    setTopics(loaded);
    if (loaded.length > 0) {
      setCurrentTopic(loaded[0]);
    }
  }, []);

  const handleUpdateTopic = (updated: TopicWorkspaceItem) => {
    const saved = saveTopicWorkspace(updated);
    setCurrentTopic(saved);
    setTopics((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
  };

  const handleCreateTopic = (params: {
    topicName: string;
    subject: string;
    classLevel: string;
    chapter: string;
    isBookmarked: boolean;
  }) => {
    const newTopic = createNewTopicWorkspace({
      topicName: params.topicName,
      subject: params.subject,
      classLevel: params.classLevel,
      chapter: params.chapter,
    });

    newTopic.isBookmarked = params.isBookmarked;

    const saved = saveTopicWorkspace(newTopic);
    setTopics((prev) => [saved, ...prev]);
    setCurrentTopic(saved);
    setActiveSection('notes'); // Jump straight into notes workspace
  };

  const handleDeleteTopic = (topicId: string) => {
    deleteTopicWorkspace(topicId);
    const updated = topics.filter((t) => t.id !== topicId);
    setTopics(updated);
    if (currentTopic?.id === topicId) {
      setCurrentTopic(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleBookmarkToggle = () => {
    if (!currentTopic) return;
    const updated = {
      ...currentTopic,
      isBookmarked: !currentTopic.isBookmarked,
    };
    handleUpdateTopic(updated);
  };

  const handleGenerateNotesFromRightPanel = async (type: NoteType) => {
    if (!currentTopic) return;
    setIsGeneratingNotes(true);
    setActiveSection('notes'); // Jump to notes view

    try {
      const combinedText = currentTopic.uploadedFiles
        .map((f) => f.extractedText)
        .filter(Boolean)
        .join('\n\n');

      const markdown = await fetchGeneratedNotes({
        topicName: currentTopic.topicName,
        subject: currentTopic.subject,
        classLevel: currentTopic.classLevel,
        chapter: currentTopic.chapter,
        noteType: type,
        uploadedContextText: combinedText,
      });

      const updated: TopicWorkspaceItem = {
        ...currentTopic,
        notes: {
          ...currentTopic.notes,
          aiGeneratedText: markdown,
          noteType: type,
          lastGeneratedAt: new Date().toISOString(),
        },
      };

      handleUpdateTopic(updated);
    } catch (err) {
      console.error('Error generating notes from panel:', err);
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  if (!currentTopic) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 rounded-3xl bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300">
          <BookOpen className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
          Topic Learning Workspace
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md">
          Create your first study topic notebook to generate AI notes, practice questions, and Feynman self-explanations.
        </p>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Study Topic</span>
        </button>

        <CreateTopicModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateTopic={handleCreateTopic}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EE] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* Optional Top Return Bar */}
      {onBackToDashboard && (
        <div className="bg-amber-900 text-amber-100 px-4 py-2 text-xs font-bold flex items-center justify-between">
          <button
            onClick={onBackToDashboard}
            className="hover:underline flex items-center gap-1 text-amber-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to StudyPilot Dashboard</span>
          </button>
          <span className="text-[11px] font-mono opacity-80">Topic Learning Workspace</span>
        </div>
      )}

      {/* Notebook Header & Navigation Bar */}
      <TopicHeader
        topic={currentTopic}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onBookmarkToggle={handleBookmarkToggle}
        onOpenTopicDrawer={() => setIsDrawerOpen(true)}
        onCreateNewTopic={() => setIsCreateModalOpen(true)}
        onContinueLearning={() => {
          if (!currentTopic.notes.aiGeneratedText) setActiveSection('notes');
          else if (!currentTopic.selfExplanation.checkResult) setActiveSection('explain');
          else if (currentTopic.questionBank.questions.length === 0) setActiveSection('practice');
          else setActiveSection('recall');
        }}
      />

      {/* Responsive Multi-Column Layout Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar (Desktop > 1024px) */}
        <LeftTopicSidebar
          topics={topics}
          currentTopic={currentTopic}
          onSelectTopic={(id) => {
            const selected = topics.find((t) => t.id === id);
            if (selected) setCurrentTopic(selected);
          }}
          onCreateNewTopic={() => setIsCreateModalOpen(true)}
          onDeleteTopic={handleDeleteTopic}
          onBookmarkToggle={handleBookmarkToggle}
        />

        {/* Central Main Workspace Panel */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Top Formal Topic Definition & Breakdown Card (Always Rendered on Selection) */}
          <TopicDefinitionBlock
            topic={currentTopic}
            onUpdateTopic={handleUpdateTopic}
          />

          {/* Active Workspace View Section */}
          {activeSection === 'learn' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <TopicProgressTracker
                topic={currentTopic}
                onNavigateSection={setActiveSection}
              />
              <NotesEditor topic={currentTopic} onUpdateTopic={handleUpdateTopic} />
            </div>
          )}

          {activeSection === 'notes' && (
            <div className="animate-in fade-in duration-200">
              <NotesEditor topic={currentTopic} onUpdateTopic={handleUpdateTopic} />
            </div>
          )}

          {activeSection === 'explain' && (
            <div className="animate-in fade-in duration-200">
              <SelfExplanation topic={currentTopic} onUpdateTopic={handleUpdateTopic} />
            </div>
          )}

          {activeSection === 'practice' && (
            <div className="animate-in fade-in duration-200">
              <QuestionBank topic={currentTopic} onUpdateTopic={handleUpdateTopic} />
            </div>
          )}

          {activeSection === 'recall' && (
            <div className="animate-in fade-in duration-200">
              <ActiveRecallMode topic={currentTopic} onUpdateTopic={handleUpdateTopic} />
            </div>
          )}

          {activeSection === 'revision' && (
            <div className="animate-in fade-in duration-200">
              <RevisionGenerator topic={currentTopic} onUpdateTopic={handleUpdateTopic} />
            </div>
          )}
        </main>

        {/* Right Docked Panel (Desktop > 1024px) */}
        <RightDockedPanel
          topic={currentTopic}
          activeNoteType={currentTopic.notes.noteType || 'detailed'}
          isGeneratingNotes={isGeneratingNotes}
          onGenerateNotes={handleGenerateNotesFromRightPanel}
          onNavigateSection={setActiveSection}
        />
      </div>

      {/* Mobile Topic Selection Drawer (<1024px) */}
      <TopicListDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        topics={topics}
        currentTopicId={currentTopic.id}
        onSelectTopic={(id) => {
          const selected = topics.find((t) => t.id === id);
          if (selected) setCurrentTopic(selected);
        }}
        onCreateNewTopic={() => setIsCreateModalOpen(true)}
        onDeleteTopic={handleDeleteTopic}
      />

      {/* Create Topic Modal */}
      <CreateTopicModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTopic={handleCreateTopic}
      />
    </div>
  );
};
