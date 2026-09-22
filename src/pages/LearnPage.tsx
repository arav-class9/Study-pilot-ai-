import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { generateAINotes } from '../services/aiClient';
import {
  getCurriculumChapters,
  getCurriculumSubjects,
  SUPPORTED_BOARDS,
  ALL_CLASSES,
} from '../data/curriculumDatabase';
import { NoteDetailLevel, SubjectId, StudyNote, CurriculumSubject, ClassLevel } from '../types';
import {
  BookOpen,
  Sparkles,
  FileText,
  Search,
  Bookmark,
  BookmarkCheck,
  Download,
  Copy,
  Trash2,
  Edit3,
  Loader2,
  Check,
  ChevronRight,
  Filter,
  Volume2,
  Brain,
  Zap,
  ChevronDown,
  Layers,
  Compass,
  Mic,
  Lightbulb,
  Globe,
  ExternalLink,
  ShieldCheck,
  RotateCw,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  Award,
  FileCheck,
} from 'lucide-react';
import { VoiceTutorPlayer } from '../components/voice/VoiceTutorPlayer';
import { SubjectDiscussionChat } from '../components/common/SubjectDiscussionChat';
import { NotesChatWidget } from '../components/ai/NotesChatWidget';
import { ConceptMindmapModal } from '../components/ai/ConceptMindmapModal';
import { VivaVoiceSimulatorModal } from '../components/ai/VivaVoiceSimulatorModal';
import { FeynmanExplainerModal } from '../components/ai/FeynmanExplainerModal';

import { toast } from 'react-hot-toast';

export const LearnPage: React.FC = () => {
  const {
    user,
    notesList,
    saveNote,
    updateNote,
    deleteNote,
    toggleFavoriteNote,
    checkAndConsumeUsage,
    addXP,
    activeTab,
    learnSubTab,
    setLearnSubTab,
    selectedSubjectId: globalSubject,
    setSelectedSubjectId: setGlobalSubject,
    selectedClassLevel: globalClass,
    setSelectedClassLevel: setGlobalClass,
    selectedBoard: globalBoard,
    setSelectedBoard: setGlobalBoard,
    navigateToTab,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'explore' | 'generator' | 'my_notes'>(() => {
    if (activeTab === 'notes') return 'my_notes';
    if (learnSubTab === 'generator' || learnSubTab === 'my_notes') return learnSubTab;
    return 'explore';
  });

  // Keep subTab in sync if navigated with specific subTab
  React.useEffect(() => {
    if (learnSubTab === 'generator' || learnSubTab === 'my_notes' || learnSubTab === 'explore') {
      setActiveSubTab(learnSubTab);
    } else if (activeTab === 'notes') {
      setActiveSubTab('my_notes');
    }
  }, [learnSubTab, activeTab]);

  // Hierarchy Selection State
  const [board, setBoard] = useState<string>(globalBoard || user.board || 'CBSE');
  const [classLevel, setClassLevel] = useState<ClassLevel>((globalClass || user.classLevel || '10') as ClassLevel);
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>((globalSubject || 'science') as SubjectId);
  const [chapterSearch, setChapterSearch] = useState('');

  // Sync back to global context whenever local filters change
  const handleBoardChange = (newBoard: string) => {
    setBoard(newBoard);
    setGlobalBoard(newBoard);
  };

  const handleClassChange = (newClass: ClassLevel) => {
    setClassLevel(newClass);
    setGlobalClass(newClass);
  };

  const handleSubjectChange = (newSub: SubjectId) => {
    setSelectedSubject(newSub);
    setGlobalSubject(newSub);
  };

  // Voice player toggle state
  const [showVoicePlayer, setShowVoicePlayer] = useState(false);
  const [voiceChapterTarget, setVoiceChapterTarget] = useState<string>('');
  const [showMindmapModal, setShowMindmapModal] = useState(false);
  const [showVivaModal, setShowVivaModal] = useState(false);
  const [showFeynmanModal, setShowFeynmanModal] = useState(false);

  // Generator State
  const [genSubject, setGenSubject] = useState<SubjectId>('science');
  const [genChapter, setGenChapter] = useState('Work and Energy');
  const [genTopic, setGenTopic] = useState('');
  const [genDetailLevel, setGenDetailLevel] = useState<NoteDetailLevel>('detailed');
  const [isGenerating, setIsGenerating] = useState(false);
  const [researchStep, setResearchStep] = useState<number>(0);
  const [activeNoteViewer, setActiveNoteViewer] = useState<StudyNote | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Available subjects for selected Class & Board
  const availableSubjects = useMemo(() => {
    return getCurriculumSubjects(classLevel, board);
  }, [classLevel, board]);

  // Ensure selectedSubject is valid
  React.useEffect(() => {
    if (!availableSubjects.some((s) => s.id === selectedSubject)) {
      if (availableSubjects[0]) setSelectedSubject(availableSubjects[0].id);
    }
  }, [availableSubjects, selectedSubject]);

  // Available chapters for selected Class + Board + Subject (No slicing limits!)
  const availableChapters = useMemo(() => {
    return getCurriculumChapters(classLevel, board, selectedSubject);
  }, [classLevel, board, selectedSubject]);

  // Filtered chapters for explore
  const filteredChapters = useMemo(() => {
    if (!chapterSearch.trim()) return availableChapters;
    const q = chapterSearch.toLowerCase().trim();
    return availableChapters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.topics.some((t) => t.name.toLowerCase().includes(q) || t.keyConcepts.some((k) => k.toLowerCase().includes(q)))
    );
  }, [availableChapters, chapterSearch]);

  // Filtered personal notes
  const filteredNotes = notesList.filter(
    (n) =>
      n.title.toLowerCase().includes(chapterSearch.toLowerCase()) ||
      n.chapterName.toLowerCase().includes(chapterSearch.toLowerCase()) ||
      n.content.toLowerCase().includes(chapterSearch.toLowerCase())
  );

  const handleGenerate = async () => {
    if (!checkAndConsumeUsage('notesGenerated')) return;

    setIsGenerating(true);
    setResearchStep(1);

    const stepTimer1 = setTimeout(() => setResearchStep(2), 1200);
    const stepTimer2 = setTimeout(() => setResearchStep(3), 2800);
    const stepTimer3 = setTimeout(() => setResearchStep(4), 4500);
    const stepTimer4 = setTimeout(() => setResearchStep(5), 6500);

    try {
      const subjectName = availableSubjects.find((s) => s.id === genSubject)?.name || 'Science';
      const result = await generateAINotes({
        subject: subjectName,
        classLevel,
        chapter: genChapter,
        topic: genTopic || undefined,
        detailLevel: genDetailLevel,
      });

      const newNote: StudyNote = {
        id: `note-${Date.now()}`,
        userId: user.uid,
        title: result.title || `${genChapter} Revision Notes`,
        subjectId: genSubject,
        chapterName: genChapter,
        topicName: genTopic || 'Complete Chapter',
        detailLevel: genDetailLevel,
        overview: result.overview,
        simpleDefinition: result.simpleDefinition,
        content: result.content || '',
        keyPoints: result.keyPoints || [],
        definitions: result.definitions || [],
        keyFormulas: result.keyFormulas || [],
        examples: result.examples || [],
        commonMistakes: result.commonMistakes || [],
        examTips: result.examTips || [],
        quickRevisionPoints: result.quickRevisionPoints || [],
        practiceQuestions: result.practiceQuestions || [],
        ncertComparison: result.ncertComparison,
        sources: result.sources || [],
        researchMetadata: result.researchMetadata,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveNote(newNote);
      addXP(50, `Generated ${genChapter} Revision Notes`);
      setActiveNoteViewer(newNote);
      setActiveSubTab('my_notes');
      toast.success('Research completed! Notes saved to workspace.');
    } catch (err) {
      console.error('Failed to generate research notes:', err);
      toast.error('Failed to generate study notes. Please try again.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);
      setIsGenerating(false);
      setResearchStep(0);
    }
  };

  const handleRegenerateNote = async (note: StudyNote) => {
    setIsGenerating(true);
    setResearchStep(1);

    const stepTimer1 = setTimeout(() => setResearchStep(2), 1200);
    const stepTimer2 = setTimeout(() => setResearchStep(3), 2800);
    const stepTimer3 = setTimeout(() => setResearchStep(4), 4500);
    const stepTimer4 = setTimeout(() => setResearchStep(5), 6500);

    try {
      const subjectName = availableSubjects.find((s) => s.id === note.subjectId)?.name || 'Science';
      const result = await generateAINotes({
        subject: subjectName,
        classLevel,
        chapter: note.chapterName,
        topic: note.topicName !== 'Complete Chapter' ? note.topicName : undefined,
        detailLevel: note.detailLevel,
        forceFreshSearch: true,
      });

      const updatedNote: StudyNote = {
        ...note,
        title: result.title || note.title,
        overview: result.overview || note.overview,
        simpleDefinition: result.simpleDefinition || note.simpleDefinition,
        content: result.content || note.content,
        keyPoints: result.keyPoints || note.keyPoints,
        definitions: result.definitions || note.definitions,
        keyFormulas: result.keyFormulas || note.keyFormulas,
        examples: result.examples || note.examples,
        commonMistakes: result.commonMistakes || note.commonMistakes,
        examTips: result.examTips || note.examTips,
        quickRevisionPoints: result.quickRevisionPoints || note.quickRevisionPoints,
        practiceQuestions: result.practiceQuestions || note.practiceQuestions,
        sources: result.sources || note.sources,
        researchMetadata: result.researchMetadata || note.researchMetadata,
        updatedAt: new Date().toISOString(),
      };

      saveNote(updatedNote);
      setActiveNoteViewer(updatedNote);
      toast.success('Regenerated notes with fresh global web research!');
    } catch (err) {
      console.error('Failed to regenerate notes:', err);
      toast.error('Failed to regenerate research notes. Please try again.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);
      setIsGenerating(false);
      setResearchStep(0);
    }
  };

  const handleCopyNote = (note: StudyNote) => {
    const text = `${note.title}\n\n${note.content}\n\nKey Formulas:\n${
      note.keyFormulas?.join('\n') || ''
    }\n\nQuick Revision:\n${note.quickRevisionPoints?.join('\n') || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(note.id);
    toast.success('Notes copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="learn-page" className="space-y-6 pb-20 md:pb-8 max-w-6xl mx-auto">
      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setActiveSubTab('explore');
              setActiveNoteViewer(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'explore'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Curriculum Explorer
          </button>

          <button
            onClick={() => {
              setActiveSubTab('generator');
              setActiveNoteViewer(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'generator'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Notes Generator</span>
          </button>

          <button
            onClick={() => setActiveSubTab('my_notes')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'my_notes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Saved Notes ({notesList.length})</span>
          </button>
        </div>

        {activeSubTab === 'my_notes' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search saved notes..."
              value={chapterSearch}
              onChange={(e) => setChapterSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-600"
            />
          </div>
        )}
      </div>

      {/* 1. CURRICULUM EXPLORER TAB */}
      {activeSubTab === 'explore' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Textbook Syllabus & Conceptual Knowledge Base</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Curriculum Explorer 📚
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Browse complete textbook chapters for Class 1 to 12 across CBSE, ICSE, BSEB, and State boards.
              </p>
            </div>
          </div>

          {/* Cascading Hierarchy Selector */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Compass className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Curriculum Filter (Class, Board & Subject)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Board Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Educational Board
                </label>
                <div className="relative">
                  <select
                    value={board}
                    onChange={(e) => handleBoardChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-semibold rounded-2xl px-3.5 py-2.5 appearance-none focus:bg-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
                  >
                    {SUPPORTED_BOARDS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.country})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Class Level Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Class Level (1 - 12)
                </label>
                <div className="relative">
                  <select
                    value={classLevel}
                    onChange={(e) => handleClassChange(e.target.value as ClassLevel)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-semibold rounded-2xl px-3.5 py-2.5 appearance-none focus:bg-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
                  >
                    {ALL_CLASSES.map((c) => (
                      <option key={c.level} value={c.level}>
                        {c.label} ({c.stage})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Subject Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Subject
                </label>
                <div className="relative">
                  <select
                    value={selectedSubject}
                    onChange={(e) => handleSubjectChange(e.target.value as SubjectId)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-semibold rounded-2xl px-3.5 py-2.5 appearance-none focus:bg-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
                  >
                    {availableSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Subject Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {availableSubjects.map((sub) => {
                const isSelected = selectedSubject === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub.id)}
                    className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold shrink-0 transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar & Chapter Grid */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                {availableSubjects.find((s) => s.id === selectedSubject)?.name} Chapters ({filteredChapters.length})
              </h2>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search chapters, topics, formulas..."
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Chapters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredChapters.length > 0 ? (
                filteredChapters.map((ch, idx) => (
                  <div
                    key={ch.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                            Chapter {ch.order || idx + 1}
                          </span>
                          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg pt-1">
                            {ch.name}
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed">{ch.description}</p>
                        </div>
                      </div>

                      {/* Topics List */}
                      {ch.topics && ch.topics.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <p className="text-[11px] font-bold uppercase text-slate-400">Core Sub-Topics:</p>
                          {ch.topics.map((t) => (
                            <div
                              key={t.id}
                              className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-700 space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-slate-900">{t.name}</p>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                                  {t.difficulty}
                                </span>
                              </div>

                              {t.keyConcepts && t.keyConcepts.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                  {t.keyConcepts.map((kc, kIdx) => (
                                    <span
                                      key={kIdx}
                                      className="bg-white text-slate-600 px-2 py-0.5 rounded text-[10px] border border-slate-200 font-medium"
                                    >
                                      {kc}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setGenSubject(ch.subjectId);
                          setGenChapter(ch.name);
                          setActiveSubTab('generator');
                        }}
                        className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Notes</span>
                      </button>

                      <button
                        onClick={() => {
                          navigateToTab('practice', {
                            subject: ch.subjectId,
                            classLevel,
                            board,
                            chapters: [ch.name],
                          });
                        }}
                        className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Practice quiz for this chapter"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Practice Drill</span>
                      </button>

                      <button
                        onClick={() => {
                          setVoiceChapterTarget(ch.name);
                          setShowVoicePlayer(true);
                        }}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Listen with AI Voice Tutor"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="hidden sm:inline">Voice</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No chapters found for your filter</p>
                  <p className="text-xs text-slate-500">
                    Try searching with another keyword or pick another subject from the selector above.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Peer-to-Peer Subject Discussion Chat */}
          <div className="pt-4">
            <SubjectDiscussionChat
              subjectId={selectedSubject}
              subjectName={availableSubjects.find((s) => s.id === selectedSubject)?.name || selectedSubject}
            />
          </div>
        </div>
      )}

      {/* 2. AI NOTES GENERATOR TAB */}
      {activeSubTab === 'generator' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">AI Notes Generator</h2>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Global Web Research</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Every topic undergoes real-time multi-source web research, fact verification, and NCERT alignment before notes are created.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Subject</label>
                <select
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value as SubjectId)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 cursor-pointer"
                >
                  {availableSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Topic / Chapter Name</label>
                <input
                  type="text"
                  value={genChapter}
                  onChange={(e) => setGenChapter(e.target.value)}
                  placeholder="e.g. Muscular Tissue, Photosynthesis, Newton's Laws..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Specific Focus or Sub-Topic (Optional)
              </label>
              <input
                type="text"
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                placeholder="e.g. Types of muscular tissue, dark reaction equation, exam traps..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Note Detail Level</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'quick_summary', label: 'Quick Summary', desc: '1-page cheatsheet' },
                  { id: 'detailed', label: 'Detailed Notes', desc: 'Concept mastery' },
                  { id: 'exam_revision', label: 'Exam Focus', desc: 'High-yield points' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setGenDetailLevel(lvl.id as NoteDetailLevel)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      genDetailLevel === lvl.id
                        ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">{lvl.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Research Active Stepper Indicator */}
            {isGenerating && (
              <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    <span className="font-extrabold text-sm text-indigo-950">Generating AI Study Notes</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                    Step {Math.min(researchStep, 5)} of 5
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-indigo-200/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full transition-all duration-500 ease-out"
                      style={{ width: `${(Math.min(researchStep, 5) / 5) * 100}%` }}
                    />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700 font-medium pt-1">
                    <div className={`flex items-center gap-2 ${researchStep >= 1 ? 'text-indigo-950 font-bold' : 'text-slate-400'}`}>
                      <CheckCircle2 className={`w-4 h-4 ${researchStep >= 1 ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>Understanding topic & searching NCERT textbooks...</span>
                    </div>
                    <div className={`flex items-center gap-2 ${researchStep >= 2 ? 'text-indigo-950 font-bold' : 'text-slate-400'}`}>
                      <CheckCircle2 className={`w-4 h-4 ${researchStep >= 2 ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>Gathering trusted study sources & key definitions...</span>
                    </div>
                    <div className={`flex items-center gap-2 ${researchStep >= 3 ? 'text-indigo-950 font-bold' : 'text-slate-400'}`}>
                      <CheckCircle2 className={`w-4 h-4 ${researchStep >= 3 ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>Organizing important concepts, formulas & examples...</span>
                    </div>
                    <div className={`flex items-center gap-2 ${researchStep >= 4 ? 'text-indigo-950 font-bold' : 'text-slate-400'}`}>
                      <CheckCircle2 className={`w-4 h-4 ${researchStep >= 4 ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>Checking accuracy & high-yield exam points...</span>
                    </div>
                    <div className={`flex items-center gap-2 ${researchStep >= 5 ? 'text-indigo-950 font-bold' : 'text-slate-400'}`}>
                      <CheckCircle2 className={`w-4 h-4 ${researchStep >= 5 ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>Preparing your clear study sheet...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !genChapter.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-sm py-4 rounded-2xl shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-all mt-4"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Researching Topic & Generating Notes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Research Topic & Generate Notes (+50 XP)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3. SAVED NOTES TAB */}
      {activeSubTab === 'my_notes' && (
        <div className="space-y-6">
          {activeNoteViewer ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <button
                  onClick={() => setActiveNoteViewer(null)}
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Back to Notes List
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleRegenerateNote(activeNoteViewer)}
                    disabled={isGenerating}
                    className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Rerun multi-source web research & regenerate notes"
                  >
                    <RotateCw className={`w-3.5 h-3.5 text-emerald-600 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>Regenerate (Fresh Web Research)</span>
                  </button>
                  <button
                    onClick={() => setShowMindmapModal(true)}
                    className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Brain className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Mindmap</span>
                  </button>
                  <button
                    onClick={() => setShowVivaModal(true)}
                    className="px-3 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Mic className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
                    <span>Oral Viva Voce</span>
                  </button>
                  <button
                    onClick={() => setShowFeynmanModal(true)}
                    className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>Feynman Studio</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this note?')) {
                        deleteNote(activeNoteViewer.id);
                        setActiveNoteViewer(null);
                      }
                    }}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                  <button
                    onClick={() => handleCopyNote(activeNoteViewer)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === activeNoteViewer.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Note Header & Badges */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">
                    {activeNoteViewer.subjectId} • Class {classLevel} • {activeNoteViewer.chapterName}
                  </span>
                  {activeNoteViewer.researchMetadata && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      <span>✓ Global Research Verified • {activeNoteViewer.researchMetadata.totalSourcesAnalyzed} Sources Analyzed</span>
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {activeNoteViewer.title}
                </h1>
              </div>

              {/* Simple Definition & Topic Overview Card */}
              {(activeNoteViewer.simpleDefinition || activeNoteViewer.overview) && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-slate-50 border border-indigo-100/80 space-y-3">
                  {activeNoteViewer.simpleDefinition && (
                    <div>
                      <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Simple Definition</span>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">{activeNoteViewer.simpleDefinition}</p>
                    </div>
                  )}
                  {activeNoteViewer.overview && (
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Executive Overview</span>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{activeNoteViewer.overview}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Key Points Takeaways */}
              {activeNoteViewer.keyPoints && activeNoteViewer.keyPoints.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Core Key Concepts & Takeaways</span>
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
                    {activeNoteViewer.keyPoints.map((kp, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Main Content Notes */}
              <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-800 space-y-4 whitespace-pre-line bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
                {activeNoteViewer.content}
              </div>

              {/* Essential Terminology & Definitions */}
              {activeNoteViewer.definitions && activeNoteViewer.definitions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Essential Terminology & Definitions</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeNoteViewer.definitions.map((def, idx) => (
                      <div key={idx} className="p-3.5 bg-indigo-50/40 rounded-2xl border border-indigo-100/60 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-indigo-950">{def.term}</span>
                          {def.isNcertCore && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">NCERT Core</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{def.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Formulas & Identities */}
              {activeNoteViewer.keyFormulas && activeNoteViewer.keyFormulas.length > 0 && (
                <div className="p-5 bg-indigo-900 text-white rounded-2xl space-y-3 shadow-sm">
                  <h3 className="font-black text-xs uppercase tracking-wider text-indigo-200 flex items-center gap-2">
                    <span>📐 Formulas, Equations & Structural Frameworks</span>
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activeNoteViewer.keyFormulas.map((f, idx) => (
                      <li key={idx} className="font-mono bg-indigo-950/80 p-3 rounded-xl border border-indigo-700/50 text-indigo-100">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Practical Examples */}
              {activeNoteViewer.examples && activeNoteViewer.examples.length > 0 && (
                <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-100 space-y-3">
                  <h3 className="font-black text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Real-World & Textbook Examples</span>
                  </h3>
                  <ul className="list-disc list-inside text-xs text-emerald-950 space-y-1.5 leading-relaxed">
                    {activeNoteViewer.examples.map((ex, idx) => (
                      <li key={idx}>{ex}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Misconceptions / Traps */}
              {activeNoteViewer.commonMistakes && activeNoteViewer.commonMistakes.length > 0 && (
                <div className="p-5 bg-rose-50/70 rounded-2xl border border-rose-100 space-y-3">
                  <h3 className="font-black text-xs uppercase tracking-wider text-rose-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Common Student Traps & Misconceptions</span>
                  </h3>
                  <ul className="list-disc list-inside text-xs text-rose-950 space-y-1.5 leading-relaxed">
                    {activeNoteViewer.commonMistakes.map((cm, idx) => (
                      <li key={idx}>{cm}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Exam Tips */}
              {activeNoteViewer.examTips && activeNoteViewer.examTips.length > 0 && (
                <div className="p-5 bg-violet-50/70 rounded-2xl border border-violet-100 space-y-3">
                  <h3 className="font-black text-xs uppercase tracking-wider text-violet-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-violet-600" />
                    <span>High-Yield Exam Focus & Scoring Advice</span>
                  </h3>
                  <ul className="list-disc list-inside text-xs text-violet-950 space-y-1.5 leading-relaxed">
                    {activeNoteViewer.examTips.map((et, idx) => (
                      <li key={idx}>{et}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Revision Cheatsheet */}
              {activeNoteViewer.quickRevisionPoints && activeNoteViewer.quickRevisionPoints.length > 0 && (
                <div className="p-5 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-3">
                  <h3 className="font-black text-xs uppercase tracking-wider text-amber-900 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-amber-600" />
                    <span>Quick Revision Cheatsheet</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-950">
                    {activeNoteViewer.quickRevisionPoints.map((qrp, idx) => (
                      <div key={idx} className="bg-white/80 p-2.5 rounded-xl border border-amber-200/50 flex items-start gap-2">
                        <span className="font-bold text-amber-600">•</span>
                        <span>{qrp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Questions */}
              {activeNoteViewer.practiceQuestions && activeNoteViewer.practiceQuestions.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-600" />
                    <span>Self-Assessment & Practice Questions</span>
                  </h3>
                  <div className="space-y-3">
                    {activeNoteViewer.practiceQuestions.map((pq, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900">Q{idx + 1}: {pq.question}</span>
                          {pq.difficulty && (
                            <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                              {pq.difficulty}
                            </span>
                          )}
                        </div>
                        <details className="text-xs cursor-pointer group">
                          <summary className="font-bold text-indigo-600 group-hover:underline">Show Solution / Answer</summary>
                          <p className="mt-2 text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                            {pq.answer}
                          </p>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sources & References Section */}
              {activeNoteViewer.sources && activeNoteViewer.sources.length > 0 && (
                <div className="p-5 bg-slate-900 text-white rounded-3xl space-y-4 mt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-100">
                        Verified Global Web Research Sources ({activeNoteViewer.sources.length})
                      </h3>
                    </div>
                    {activeNoteViewer.researchMetadata?.crossCheckStatus && (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/50">
                        {activeNoteViewer.researchMetadata.crossCheckStatus}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeNoteViewer.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-2xl border border-slate-700/60 transition-all flex items-start justify-between gap-3 group"
                      >
                        <div className="space-y-1 overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/50">
                              {src.sourceType || 'Web Source'}
                            </span>
                            {src.authorityScore && (
                              <span className="text-[9px] text-emerald-400 font-bold">
                                Score: {src.authorityScore}/100
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-xs text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
                            {src.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {src.domain}
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0 mt-1 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteViewer(note)}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {note.subjectId}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{note.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-3">{note.content}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400 font-semibold">
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      <span className="text-indigo-600 font-bold">Read Note →</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No saved notes yet</p>
                  <p className="text-xs text-slate-500">
                    Use the AI Notes Generator or generate notes from any chapter in the Curriculum Explorer!
                  </p>
                  <button
                    onClick={() => setActiveSubTab('generator')}
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Generate Your First Note
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Voice Tutor Player Modal */}
      {showVoicePlayer && (
        <VoiceTutorPlayer
          initialTopic={voiceChapterTarget}
          onClose={() => setShowVoicePlayer(false)}
        />
      )}

      {/* Floating Chat with your Notes Widget */}
      <NotesChatWidget notesList={notesList} activeNote={activeNoteViewer} />

      {/* AI Concept Mindmap Modal */}
      {activeNoteViewer && (
        <ConceptMindmapModal
          isOpen={showMindmapModal}
          onClose={() => setShowMindmapModal(false)}
          chapterName={activeNoteViewer.chapterName}
          subject={activeNoteViewer.subjectId}
          classLevel={classLevel}
        />
      )}

      {/* AI Oral Viva Voce Simulator Modal */}
      {activeNoteViewer && (
        <VivaVoiceSimulatorModal
          isOpen={showVivaModal}
          onClose={() => setShowVivaModal(false)}
          chapterName={activeNoteViewer.chapterName}
          subject={activeNoteViewer.subjectId}
        />
      )}

      {/* AI Feynman Technique Studio Modal */}
      <FeynmanExplainerModal
        isOpen={showFeynmanModal}
        onClose={() => setShowFeynmanModal(false)}
        defaultTopic={activeNoteViewer?.chapterName || 'Photosynthesis'}
        defaultSubject={activeNoteViewer?.subjectId || 'science'}
      />
    </div>
  );
};

export default LearnPage;
