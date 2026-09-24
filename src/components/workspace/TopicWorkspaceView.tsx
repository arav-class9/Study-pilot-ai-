import React, { useState, useEffect } from 'react';
import { NoteType, TopicWorkspaceItem } from '../../types/workspace';
import {
  getAllTopicWorkspaces,
  saveTopicWorkspace,
  deleteTopicWorkspace,
  createNewTopicWorkspace,
} from '../../services/topicWorkspaceStorage';
import { safeGetStorage, safeSetStorage } from '../../utils/storage';
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
import { StructuredVisualAnswerView } from './StructuredVisualAnswerView';
import { generateOfflineStructuredVisualAnswer } from '../../services/topicWorkspaceClient';
import { BookOpen, Plus, Sparkles, LayoutDashboard } from 'lucide-react';

const ACTIVE_TOPIC_ID_KEY = 'studypilot_active_topic_id';
const ACTIVE_TOPIC_SECTION_KEY = 'studypilot_active_topic_section';

interface TopicWorkspaceViewProps {
  onBackToDashboard?: () => void;
}

export const TopicWorkspaceView: React.FC<TopicWorkspaceViewProps> = ({
  onBackToDashboard,
}) => {
  const [topics, setTopics] = useState<TopicWorkspaceItem[]>(() => getAllTopicWorkspaces());
  const [currentTopic, setCurrentTopic] = useState<TopicWorkspaceItem | null>(() => {
    const loaded = getAllTopicWorkspaces();
    if (!loaded || loaded.length === 0) return null;
    const savedTopicId = safeGetStorage(ACTIVE_TOPIC_ID_KEY);
    if (savedTopicId) {
      const match = loaded.find((t) => t.id === savedTopicId);
      if (match) return match;
    }
    return loaded[0];
  });
  const [activeSection, setActiveSectionState] = useState<
    'learn' | 'notes' | 'explain' | 'practice' | 'recall' | 'revision'
  >(() => {
    const savedSec = safeGetStorage(ACTIVE_TOPIC_SECTION_KEY);
    if (savedSec && ['learn', 'notes', 'explain', 'practice', 'recall', 'revision'].includes(savedSec)) {
      return savedSec as any;
    }
    return 'learn';
  });

  const setActiveSection = (sec: 'learn' | 'notes' | 'explain' | 'practice' | 'recall' | 'revision') => {
    setActiveSectionState(sec);
    safeSetStorage(ACTIVE_TOPIC_SECTION_KEY, sec);
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightTools, setShowRightTools] = useState(false);
  const [showDefinitionBlock, setShowDefinitionBlock] = useState(false);

  // Failsafe: if currentTopic was ever unset but topics exist, recover immediately
  useEffect(() => {
    if (!currentTopic && topics.length > 0) {
      const savedTopicId = safeGetStorage(ACTIVE_TOPIC_ID_KEY);
      const match = savedTopicId ? topics.find((t) => t.id === savedTopicId) : null;
      const target = match || topics[0];
      setCurrentTopic(target);
      safeSetStorage(ACTIVE_TOPIC_ID_KEY, target.id);
    }
  }, [currentTopic, topics]);

  const handleSelectTopic = (topicId: string) => {
    const selected = topics.find((t) => t.id === topicId);
    if (selected) {
      setCurrentTopic(selected);
      safeSetStorage(ACTIVE_TOPIC_ID_KEY, selected.id);
    }
  };

  const handleUpdateTopic = (updated: TopicWorkspaceItem) => {
    const saved = saveTopicWorkspace(updated);
    setCurrentTopic(saved);
    safeSetStorage(ACTIVE_TOPIC_ID_KEY, saved.id);
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
    newTopic.structuredVisualAnswer = generateOfflineStructuredVisualAnswer({
      topicOrQuestion: params.topicName,
      subject: params.subject,
      classLevel: params.classLevel,
      chapter: params.chapter,
    });

    const saved = saveTopicWorkspace(newTopic);
    safeSetStorage(ACTIVE_TOPIC_ID_KEY, saved.id);
    setTopics((prev) => [saved, ...prev]);
    setCurrentTopic(saved);
    setActiveSection('learn'); // Jump straight into the Visual Cards Textbook!
  };

  const handleDeleteTopic = (topicId: string) => {
    deleteTopicWorkspace(topicId);
    const updated = topics.filter((t) => t.id !== topicId);
    setTopics(updated);
    if (currentTopic?.id === topicId) {
      const nextTopic = updated.length > 0 ? updated[0] : null;
      setCurrentTopic(nextTopic);
      if (nextTopic) {
        safeSetStorage(ACTIVE_TOPIC_ID_KEY, nextTopic.id);
      }
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
      {/* Notebook Header & Navigation Bar */}
      <TopicHeader
        topic={currentTopic}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onBookmarkToggle={handleBookmarkToggle}
        onOpenTopicDrawer={() => setIsDrawerOpen(true)}
        onCreateNewTopic={() => setIsCreateModalOpen(true)}
        showLeftSidebar={showLeftSidebar}
        onToggleLeftSidebar={() => setShowLeftSidebar((prev) => !prev)}
        showRightTools={showRightTools}
        onToggleRightTools={() => setShowRightTools((prev) => !prev)}
        onContinueLearning={() => {
          if (!currentTopic.notes.aiGeneratedText) setActiveSection('notes');
          else if (!currentTopic.selfExplanation.checkResult) setActiveSection('explain');
          else if (currentTopic.questionBank.questions.length === 0) setActiveSection('practice');
          else setActiveSection('recall');
        }}
      />

      {/* Responsive Layout Container */}
      <div className="w-full max-w-[1600px] mx-auto px-2.5 sm:px-4 md:px-6 py-3 sm:py-6 flex flex-col lg:flex-row gap-4 sm:gap-6 min-w-0 overflow-x-hidden">
        {/* Left Sidebar (Collapsible, default closed for full reading space) */}
        {showLeftSidebar && (
          <div className="animate-in slide-in-from-left-4 duration-200">
            <LeftTopicSidebar
              topics={topics}
              currentTopic={currentTopic}
              onSelectTopic={handleSelectTopic}
              onCreateNewTopic={() => setIsCreateModalOpen(true)}
              onDeleteTopic={handleDeleteTopic}
              onBookmarkToggle={handleBookmarkToggle}
            />
          </div>
        )}

        {/* Central Main Workspace Panel */}
        <main className={`flex-1 min-w-0 w-full max-w-full space-y-4 sm:space-y-6 overflow-x-hidden ${!showLeftSidebar && !showRightTools ? 'max-w-5xl mx-auto' : ''}`}>
          {/* Sleek 1-line Concept Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3.5 py-2.5 rounded-2xl bg-amber-50/80 dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 shadow-xs gap-1.5 min-w-0">
            <div className="flex items-center gap-2 min-w-0 truncate">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
              <span className="font-semibold truncate">
                {currentTopic.definitionBreakdown?.quickSummary || `Topic: ${currentTopic.topicName} • ${currentTopic.subject}`}
              </span>
            </div>
            <button
              onClick={() => setShowDefinitionBlock((prev) => !prev)}
              className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline shrink-0 sm:ml-3 cursor-pointer self-end sm:self-auto"
            >
              {showDefinitionBlock ? 'Hide Breakdown' : 'Formal Definition & Examples'}
            </button>
          </div>

          {/* Collapsible Formal Definition Breakdown Card */}
          {showDefinitionBlock && (
            <div className="animate-in fade-in duration-200">
              <TopicDefinitionBlock
                topic={currentTopic}
                onUpdateTopic={handleUpdateTopic}
              />
            </div>
          )}

          {/* Active Workspace View Section */}
          {activeSection === 'learn' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <StructuredVisualAnswerView
                topic={currentTopic}
                onUpdateTopic={handleUpdateTopic}
              />
              <TopicProgressTracker
                topic={currentTopic}
                onNavigateSection={setActiveSection}
              />
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

        {/* Right Docked Panel (Collapsible, default closed) */}
        {showRightTools && (
          <div className="animate-in slide-in-from-right-4 duration-200">
            <RightDockedPanel
              topic={currentTopic}
              activeNoteType={currentTopic.notes.noteType || 'detailed'}
              isGeneratingNotes={isGeneratingNotes}
              onGenerateNotes={handleGenerateNotesFromRightPanel}
              onNavigateSection={setActiveSection}
            />
          </div>
        )}
      </div>

      {/* Mobile Topic Selection Drawer (<1024px) */}
      <TopicListDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        topics={topics}
        currentTopicId={currentTopic.id}
        onSelectTopic={handleSelectTopic}
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

export default TopicWorkspaceView;
