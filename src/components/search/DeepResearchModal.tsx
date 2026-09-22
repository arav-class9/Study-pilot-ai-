import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Share2,
  Bookmark,
  Layers,
  GraduationCap,
  Globe2,
  Cpu,
  FileText,
  Volume2,
  Copy,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  GitFork,
  Image as ImageIcon,
  Check,
  Zap,
} from 'lucide-react';
import {
  executeDeepResearchAPI,
  DeepResearchResult,
} from '../../services/deepResearchClient';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

interface DeepResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const SAMPLE_RESEARCH_PROMPTS = [
  'Explain muscular tissue in detail for class 9 exam',
  'Photosynthesis complete light & dark reaction mechanisms',
  'Derive Ohm\'s Law and resistors in series vs parallel with diagrams',
  'Quadratic equations discriminant nature of roots and word problems',
  'Compare AI education models and learning tools in 2026',
];

const STAGE_LABELS = [
  'Understanding Query & Intent Decomposition...',
  'Finding Relevant Sources (NCERT, Govt, Edu)...',
  'Deep Searching Subtopics & Extracting Facts...',
  'Cross-Checking Claims & Verifying Formulas...',
  'Scanning Research Gaps & Resolving Contradictions...',
  'Constructing Knowledge Graph & Visual Cues...',
  'Synthesizing Grounded Notes...',
];

export const DeepResearchModal: React.FC<DeepResearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const { saveNote, setActiveTab, selectedClassLevel, selectedSubjectId } = useApp();
  const [query, setQuery] = useState(initialQuery);
  const [classLevel, setClassLevel] = useState<string>(selectedClassLevel || '10');
  const [subject, setSubject] = useState<string>(selectedSubjectId || 'General Science');
  const [depth, setDepth] = useState<'quick' | 'detailed' | 'deep' | 'very_deep'>('deep');
  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('en');

  const [isResearching, setIsResearching] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [result, setResult] = useState<DeepResearchResult | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'notes' | 'graph' | 'sources' | 'diagram'>('notes');
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedGraphNode, setSelectedGraphNode] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Stage progress timer simulation while awaiting backend response
  useEffect(() => {
    let interval: any;
    if (isResearching) {
      setCurrentStageIndex(0);
      interval = setInterval(() => {
        setCurrentStageIndex((prev) => {
          if (prev < STAGE_LABELS.length - 1) return prev + 1;
          return prev;
        });
      }, 2200);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isResearching]);

  if (!isOpen) return null;

  const handleRunResearch = async (promptToRun?: string) => {
    const q = (promptToRun || query).trim();
    if (!q) {
      toast.error('Please enter a topic or research question.');
      return;
    }

    setQuery(q);
    setIsResearching(true);
    setResult(null);
    setIsSaved(false);

    try {
      const data = await executeDeepResearchAPI({
        query: q,
        classLevel,
        subject,
        depth,
        language,
      });
      setResult(data);
      setCurrentStageIndex(STAGE_LABELS.length - 1);
      toast.success('AI Deep Research Complete!');
    } catch (err: any) {
      console.error('Deep research failed:', err);
      toast.error(err.message || 'Deep Research encountered an error. Please try again.');
    } finally {
      setIsResearching(false);
    }
  };

  const handleSaveToWorkspace = () => {
    if (!result) return;
    const newNote = {
      id: `note-${Date.now()}`,
      title: result.educationalNotes.title || result.query,
      subjectId: subject.toLowerCase().includes('math') ? 'math' : 'science',
      chapterName: result.intentAnalysis.topic || 'Deep Research',
      topicName: result.query,
      classLevel: result.intentAnalysis.classLevel,
      detailLevel: 'detailed',
      content: `# ${result.educationalNotes.title}\n\n${result.educationalNotes.summary}\n\n` +
        result.educationalNotes.sections.map((s) => `## ${s.heading}\n${s.content}`).join('\n\n'),
      keyTerms: result.educationalNotes.glossary.map((g) => `${g.term}: ${g.definition}`),
      examTips: result.educationalNotes.examHighYield.commonTraps,
      formulaSheet: result.educationalNotes.sections.flatMap((s) => s.formulas || []),
      createdAt: new Date().toISOString(),
    };

    saveNote(newNote as any);
    setIsSaved(true);
    toast.success('Saved to your Study Notes Workspace!');
  };

  const handleCopyNotes = () => {
    if (!result) return;
    const fullText = `${result.educationalNotes.title}\n\n${result.educationalNotes.summary}\n\n` +
      result.educationalNotes.sections.map((s) => `${s.heading}\n${s.content}`).join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success('Copied notes to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTextToSpeech = () => {
    if (!result || typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToRead = `${result.educationalNotes.title}. ${result.educationalNotes.summary}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
      toast.success('Reading research summary out loud...');
    } else {
      toast.error('Text-to-speech not supported in this browser.');
    }
  };

  return (
    <div
      id="deep-research-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="deep-research-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-indigo-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-200 shadow-inner">
              <Cpu className="w-5 h-5 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  StudyPilot AI Deep Research Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Multi-Stage Grounded
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                Grounded multi-source web search, claim verification, contradiction detection & NCERT notes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Query Input Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 absolute left-4 pointer-events-none" />
              <input
                id="deep-research-input-field"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunResearch()}
                placeholder="Enter any complex research topic (e.g. 'Explain muscular tissue in detail for class 9 exam')..."
                className="w-full pl-12 pr-28 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm sm:text-base font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs placeholder:text-slate-400"
              />
              <button
                id="deep-research-run-btn"
                onClick={() => handleRunResearch()}
                disabled={isResearching || !query.trim()}
                className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isResearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Deep Research</span>
                  </>
                )}
              </button>
            </div>

            {/* Controls Bar: Class Level, Subject, Depth, Language */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-500 dark:text-slate-400">Class:</span>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg px-2.5 py-1 focus:outline-hidden"
                  >
                    {['6', '7', '8', '9', '10', '11', '12', 'College / JEE'].map((c) => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-500 dark:text-slate-400">Subject:</span>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg px-2.5 py-1 focus:outline-hidden"
                  >
                    {['General Science', 'Biology', 'Physics', 'Chemistry', 'Mathematics', 'History', 'Civics', 'Computer Science', 'General Knowledge'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-500 dark:text-slate-400">Depth:</span>
                  <select
                    value={depth}
                    onChange={(e) => setDepth(e.target.value as any)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg px-2.5 py-1 focus:outline-hidden"
                  >
                    <option value="quick">Quick Research</option>
                    <option value="detailed">Detailed Notes</option>
                    <option value="deep">Deep Multi-Source</option>
                    <option value="very_deep">Very Deep Investigation</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-500 dark:text-slate-400">Lang:</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg px-2.5 py-1 focus:outline-hidden"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="hinglish">Hinglish</option>
                  </select>
                </div>
              </div>

              <div className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Anti-Hallucination Grounded</span>
              </div>
            </div>

            {/* Trending Prompts */}
            {!result && !isResearching && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Try Sample Deep Research Queries:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_RESEARCH_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleRunResearch(p)}
                      className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 font-medium px-3 py-1.5 rounded-full hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs text-left cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Research Progress Status Indicator */}
          {isResearching && (
            <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center animate-spin">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-indigo-900 dark:text-indigo-200">
                      Multi-Stage AI Deep Research Engine Executing
                    </h4>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                      {STAGE_LABELS[currentStageIndex]}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                  Stage {currentStageIndex + 1} of 7
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-indigo-200/60 dark:bg-indigo-900/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((currentStageIndex + 1) / 7) * 100)}%` }}
                />
              </div>

              {/* Multi-Step Breakdown Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-semibold text-indigo-800 dark:text-indigo-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${currentStageIndex >= 0 ? 'text-indigo-600' : 'text-slate-300'}`} />
                  <span>1. Intent & Scope</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${currentStageIndex >= 1 ? 'text-indigo-600' : 'text-slate-300'}`} />
                  <span>2. Multi-Source Search</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${currentStageIndex >= 3 ? 'text-indigo-600' : 'text-slate-300'}`} />
                  <span>3. Fact Verification</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${currentStageIndex >= 6 ? 'text-indigo-600' : 'text-slate-300'}`} />
                  <span>4. Teacher Notes</span>
                </div>
              </div>
            </div>
          )}

          {/* Research Results View */}
          {result && !isResearching && (
            <div className="space-y-6">
              {/* Intent Summary Banner */}
              <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 dark:from-slate-800 dark:via-indigo-950 dark:to-slate-800 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white">
                      Class {result.intentAnalysis.classLevel}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      {result.intentAnalysis.subject}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {result.sources.length} Grounded Sources
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {result.educationalNotes.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {result.educationalNotes.summary}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSaveToWorkspace}
                    disabled={isSaved}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                    }`}
                  >
                    {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    <span>{isSaved ? 'Saved to Workspace' : 'Save Note'}</span>
                  </button>

                  <button
                    onClick={handleCopyNotes}
                    className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                    title="Copy Notes"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleTextToSpeech}
                    className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                    title="Listen to Research Summary"
                  >
                    <Volume2 className="w-4 h-4 text-indigo-600" />
                  </button>
                </div>
              </div>

              {/* Navigation View Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-700 gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveViewTab('notes')}
                  className={`px-4 py-2.5 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                    activeViewTab === 'notes'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Educational Notes & NCERT</span>
                </button>

                <button
                  onClick={() => setActiveViewTab('graph')}
                  className={`px-4 py-2.5 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                    activeViewTab === 'graph'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <GitFork className="w-4 h-4" />
                  <span>Knowledge Graph ({result.knowledgeGraph.nodes.length} Nodes)</span>
                </button>

                <button
                  onClick={() => setActiveViewTab('sources')}
                  className={`px-4 py-2.5 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                    activeViewTab === 'sources'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Globe2 className="w-4 h-4" />
                  <span>Sources & Fact Claims ({result.sources.length})</span>
                </button>

                {result.diagramRecommendation && (
                  <button
                    onClick={() => setActiveViewTab('diagram')}
                    className={`px-4 py-2.5 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                      activeViewTab === 'diagram'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Visual Diagram Guide</span>
                  </button>
                )}
              </div>

              {/* TAB 1: Grounded Educational Notes */}
              {activeViewTab === 'notes' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Decomposed Subtopic Tags */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Decomposed Research Subtopics Analyzed:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.intentAnalysis.subtopics.map((st, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sections */}
                  {result.educationalNotes.sections.map((section, sIdx) => (
                    <div
                      key={sIdx}
                      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-black flex items-center justify-center">
                            {sIdx + 1}
                          </span>
                          {section.heading}
                        </h4>

                        {section.isAdditionalInfo && (
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-md border border-amber-300/40">
                            Additional Knowledge
                          </span>
                        )}
                      </div>

                      <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-2 whitespace-pre-line">
                        {section.content}
                      </div>

                      {section.bulletPoints && section.bulletPoints.length > 0 && (
                        <ul className="list-disc list-inside space-y-1.5 pl-2 text-sm text-slate-700 dark:text-slate-300">
                          {section.bulletPoints.map((bp, bpIdx) => (
                            <li key={bpIdx} className="font-medium">
                              {bp}
                            </li>
                          ))}
                        </ul>
                      )}

                      {section.formulas && section.formulas.length > 0 && (
                        <div className="bg-slate-900 text-emerald-300 p-3.5 rounded-xl font-mono text-xs overflow-x-auto space-y-1 border border-slate-800">
                          <p className="text-[10px] uppercase font-sans font-bold text-slate-400">Key Formula / Derived Equation:</p>
                          {section.formulas.map((f, fIdx) => (
                            <div key={fIdx} className="font-bold tracking-wide">
                              {f}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* NCERT Corner Callout */}
                  <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-2xl border border-blue-700 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-amber-400" />
                        <h4 className="text-base font-extrabold tracking-tight">
                          NCERT Textbook Corner & Alignment
                        </h4>
                      </div>
                      <span className="text-xs font-bold text-blue-200">
                        {result.educationalNotes.ncertCorner.textbookReference}
                      </span>
                    </div>

                    <blockquote className="italic border-l-4 border-amber-400 pl-3 text-sm text-blue-100">
                      "{result.educationalNotes.ncertCorner.exactQuote}"
                    </blockquote>

                    <div>
                      <p className="text-xs font-bold uppercase text-amber-300 mb-1">
                        Key Learning Outcomes (CBSE Board Standard):
                      </p>
                      <ul className="list-disc list-inside text-xs text-blue-100 space-y-1">
                        {result.educationalNotes.ncertCorner.keyLearningOutcomes.map((klo, kIdx) => (
                          <li key={kIdx}>{klo}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Exam High-Yield Section */}
                  <div className="bg-rose-50/70 dark:bg-rose-950/30 p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-3">
                    <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-extrabold text-sm sm:text-base">
                      <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      <span>Exam High-Yield Points & Common Misconceptions</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-rose-100 dark:border-rose-900/40">
                        <p className="font-extrabold text-slate-900 dark:text-white mb-2">
                          Frequently Asked Board Exam Questions:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                          {result.educationalNotes.examHighYield.importantQuestions.map((q, qIdx) => (
                            <li key={qIdx}>{q}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-rose-100 dark:border-rose-900/40">
                        <p className="font-extrabold text-slate-900 dark:text-white mb-2">
                          Common Student Traps & Misconceptions:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                          {result.educationalNotes.examHighYield.commonTraps.map((t, tIdx) => (
                            <li key={tIdx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <p className="text-xs font-extrabold text-rose-800 dark:text-rose-300">
                      Marks Weightage Advice: {result.educationalNotes.examHighYield.marksWeightageAdvice}
                    </p>
                  </div>

                  {/* Glossary Accordion / Cards */}
                  {result.educationalNotes.glossary && result.educationalNotes.glossary.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Important Terminology & Glossary
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {result.educationalNotes.glossary.map((g, gIdx) => (
                          <div
                            key={gIdx}
                            className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700"
                          >
                            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 block">
                              {g.term}
                            </span>
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                              {g.definition}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Dynamic Knowledge Graph */}
              {activeViewTab === 'graph' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                          <GitFork className="w-4 h-4 text-indigo-400" />
                          Interactive Topic Relationship Map
                        </h4>
                        <p className="text-xs text-slate-400">
                          Click any node to highlight concept relationships.
                        </p>
                      </div>

                      <span className="text-xs font-bold text-slate-400">
                        {result.knowledgeGraph.nodes.length} Connected Nodes
                      </span>
                    </div>

                    {/* Node Cards Graph */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {result.knowledgeGraph.nodes.map((node) => {
                        const isSelected = selectedGraphNode === node.id;
                        let badgeColor = 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30';
                        if (node.type === 'root') badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-400/30';
                        if (node.type === 'formula') badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
                        if (node.type === 'exam_point') badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-400/30';

                        return (
                          <div
                            key={node.id}
                            onClick={() => setSelectedGraphNode(isSelected ? null : node.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-indigo-900/80 border-indigo-400 shadow-lg ring-2 ring-indigo-400'
                                : 'bg-slate-800/80 border-slate-700 hover:border-indigo-500'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${badgeColor}`}>
                                {node.type}
                              </span>
                            </div>
                            <h5 className="text-xs font-extrabold text-white">{node.label}</h5>
                            {node.description && (
                              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                                {node.description}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Edge Connection List */}
                    <div className="pt-2 border-t border-slate-800">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Concept Connections & Dependencies:
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {result.knowledgeGraph.edges.map((edge, eIdx) => (
                          <div
                            key={eIdx}
                            className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 flex items-center gap-1.5 font-mono text-[11px]"
                          >
                            <span className="font-extrabold text-indigo-400">{edge.from}</span>
                            <span className="text-slate-500">→ [{edge.label || 'relates to'}] →</span>
                            <span className="font-extrabold text-emerald-400">{edge.to}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Sources & Claims Panel */}
              {activeViewTab === 'sources' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Sources Cards */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Grounded Multi-Web Sources ({result.sources.length})
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.sources.map((source) => (
                        <div
                          key={source.id}
                          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                {source.sourceType}
                              </span>

                              <div className="flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{source.authorityScore}% Authority</span>
                              </div>
                            </div>

                            <h5 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">
                              {source.title}
                            </h5>
                            <p className="text-xs font-mono text-slate-400">{source.domain}</p>

                            {source.keyFactsExtracted && source.keyFactsExtracted.length > 0 && (
                              <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 mt-2 space-y-0.5">
                                {source.keyFactsExtracted.slice(0, 2).map((fact, fIdx) => (
                                  <li key={fIdx} className="line-clamp-1">{fact}</li>
                                ))}
                              </ul>
                            )}
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400">
                              Confidence: {source.confidence}
                            </span>

                            {source.url && (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                              >
                                <span>Open Source</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Claims Verification Table */}
                  {result.claims && result.claims.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Claim-Level Verification Matrix
                      </h4>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-extrabold uppercase">
                              <th className="py-2 px-3">Grounded Claim</th>
                              <th className="py-2 px-3">Confidence</th>
                              <th className="py-2 px-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
                            {result.claims.map((claim, cIdx) => (
                              <tr key={cIdx}>
                                <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                                  {claim.claimText}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-emerald-600">
                                  {claim.confidence}
                                </td>
                                <td className="py-2.5 px-3 font-extrabold text-indigo-600">
                                  {claim.conflictStatus}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Contradictions Resolution */}
                  {result.contradictions && result.contradictions.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Source Discrepancies & Contradictions Resolved
                      </h4>

                      {result.contradictions.map((contra, ctIdx) => (
                        <div key={ctIdx} className="bg-white dark:bg-slate-900 p-3 rounded-xl text-xs space-y-1">
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            Aspect: {contra.topicAspect}
                          </p>
                          <p className="text-slate-600 dark:text-slate-300">
                            <span className="font-bold">Cause:</span> {contra.cause}
                          </p>
                          <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                            <span className="font-bold">Teacher Resolution:</span> {contra.resolutionText}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Diagram Recommendation */}
              {activeViewTab === 'diagram' && result.diagramRecommendation && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold">
                          {result.diagramRecommendation.title}
                        </h4>
                        <p className="text-xs text-slate-300">
                          {result.diagramRecommendation.description}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Key Labels to Practice in Board Exam Diagram:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.diagramRecommendation.keyLabelsToIdentify.map((label, lIdx) => (
                          <span
                            key={lIdx}
                            className="px-3 py-1 bg-indigo-950 border border-indigo-700/60 rounded-lg text-xs font-bold text-indigo-200"
                          >
                            🏷️ {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium">
            StudyPilot AI Deep Research Engine • Grounded with Google Search
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl transition-colors cursor-pointer"
          >
            Close Engine
          </button>
        </div>
      </div>
    </div>
  );
};
