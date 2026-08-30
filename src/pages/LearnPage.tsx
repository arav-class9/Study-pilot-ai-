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
} from 'lucide-react';
import { VoiceTutorPlayer } from '../components/voice/VoiceTutorPlayer';

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
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'explore' | 'generator' | 'my_notes'>('explore');

  // Hierarchy Selection State
  const [board, setBoard] = useState<string>(user.board || 'CBSE');
  const [classLevel, setClassLevel] = useState<ClassLevel>(user.classLevel || '10');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('science');
  const [chapterSearch, setChapterSearch] = useState('');

  // Voice player toggle state
  const [showVoicePlayer, setShowVoicePlayer] = useState(false);
  const [voiceChapterTarget, setVoiceChapterTarget] = useState<string>('');

  // Generator State
  const [genSubject, setGenSubject] = useState<SubjectId>('science');
  const [genChapter, setGenChapter] = useState('Work and Energy');
  const [genTopic, setGenTopic] = useState('');
  const [genDetailLevel, setGenDetailLevel] = useState<NoteDetailLevel>('detailed');
  const [isGenerating, setIsGenerating] = useState(false);
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
        content: result.content || '',
        definitions: result.definitions || [],
        keyFormulas: result.keyFormulas || [],
        commonMistakes: result.commonMistakes || [],
        examTips: result.examTips || [],
        quickRevisionPoints: result.quickRevisionPoints || [],
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveNote(newNote);
      addXP(50, `Generated ${genChapter} Revision Notes`);
      setActiveNoteViewer(newNote);
      setActiveSubTab('my_notes');
    } catch (err) {
      console.error('Failed to generate notes:', err);
      alert('Failed to generate study notes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyNote = (note: StudyNote) => {
    const text = `${note.title}\n\n${note.content}\n\nKey Formulas:\n${
      note.keyFormulas?.join('\n') || ''
    }\n\nQuick Revision:\n${note.quickRevisionPoints?.join('\n') || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(note.id);
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
                    onChange={(e) => setBoard(e.target.value)}
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
                    onChange={(e) => setClassLevel(e.target.value as ClassLevel)}
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
                    onChange={(e) => setSelectedSubject(e.target.value as SubjectId)}
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
                        <span>Generate AI Notes</span>
                      </button>

                      <button
                        onClick={() => {
                          setVoiceChapterTarget(ch.name);
                          setShowVoicePlayer(true);
                        }}
                        className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Listen with AI Voice Tutor"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="hidden sm:inline">Voice Tutor</span>
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
        </div>
      )}

      {/* 2. AI NOTES GENERATOR TAB */}
      {activeSubTab === 'generator' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">AI Notes Generator</h2>
              <p className="text-xs text-slate-500">
                Transform any syllabus chapter into structured revision sheets with definitions, formulas & common traps.
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
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Chapter Name</label>
                <input
                  type="text"
                  value={genChapter}
                  onChange={(e) => setGenChapter(e.target.value)}
                  placeholder="e.g. Electricity, Real Numbers..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Specific Sub-Topic (Optional)
              </label>
              <input
                type="text"
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                placeholder="e.g. Ohm's Law, Series Circuits..."
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

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !genChapter.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-sm py-4 rounded-2xl shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-all mt-4"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Comprehensive Study Sheet...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Revision Sheet (+50 XP)</span>
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
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <button
                  onClick={() => setActiveNoteViewer(null)}
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Back to Notes List
                </button>

                <div className="flex items-center gap-2">
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

              <div className="space-y-3">
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">
                  {activeNoteViewer.subjectId} • {activeNoteViewer.chapterName}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {activeNoteViewer.title}
                </h1>
              </div>

              <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 space-y-4 whitespace-pre-line">
                {activeNoteViewer.content}
              </div>

              {activeNoteViewer.keyFormulas && activeNoteViewer.keyFormulas.length > 0 && (
                <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
                  <h4 className="font-black text-xs text-indigo-900 uppercase">Key Formulas & Identities</h4>
                  <ul className="list-disc list-inside text-xs text-indigo-950 space-y-1">
                    {activeNoteViewer.keyFormulas.map((f, idx) => (
                      <li key={idx} className="font-mono">{f}</li>
                    ))}
                  </ul>
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
    </div>
  );
};
