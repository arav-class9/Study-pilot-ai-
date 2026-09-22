import { toast } from 'react-hot-toast';
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { askAIDoubt } from '../services/aiClient';
import { translateUI, SupportedLanguage } from '../services/i18n';
import { DoubtSolution, SubjectId, ClassLevel } from '../types';
import {
  Bot,
  Send,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  BookmarkPlus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
  Shield,
  Award,
} from 'lucide-react';
import { motion } from 'motion/react';
import { HandwrittenSolutionTab } from '../components/tutor/HandwrittenSolutionTab';
import { TextbookPhotoTab } from '../components/tutor/TextbookPhotoTab';
import { VivaFeynmanTab } from '../components/tutor/VivaFeynmanTab';
import { CitationInjector, CitationListPanel } from '../components/tutor/CitationInjector';
import { CitationBadge } from '../components/tutor/CitationBadge';
import { Calculator, BookOpen, FileCode } from 'lucide-react';
import { formatDoubtSolutionAsLaTeX } from '../utils/latexExporter';

export const AITutorPage: React.FC = () => {
  const {
    user,
    saveNote,
    checkAndConsumeUsage,
    addXP,
    isDeepWork,
    toggleDeepWork,
    selectedSubjectId: globalSubject,
    selectedClassLevel: globalClass,
    language,
  } = useApp();

  const [activeTutorTab, setActiveTutorTab] = useState<'doubt' | 'handwritten' | 'textbook_photo' | 'viva_feynman'>('doubt');
  const [questionText, setQuestionText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>(globalSubject || 'science');
  const [selectedClass, setSelectedClass] = useState<ClassLevel>((globalClass || user?.classLevel || '10') as ClassLevel);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');

  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState<DoubtSolution | null>(null);
  const [tutorError, setTutorError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [revealedPracticeAnswer, setRevealedPracticeAnswer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleVoiceInputToggle = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setQuestionText((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const suggestedQuestions = [
    { text: 'A constant force of 20 N acts on an object of mass 4 kg. Find the acceleration produced and velocity after 5 seconds.', subject: 'science' },
    { text: 'Find the zeroes of the quadratic polynomial x² + 7x + 10 and verify the relationship with coefficients.', subject: 'math' },
    { text: 'Explain the mechanism of photosynthesis with light and dark reaction equations.', subject: 'science' },
    { text: 'Convert from Direct to Indirect Speech: The teacher said to the students, "The sun rises in the east."', subject: 'english' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageMimeType(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (!questionText.trim() && !imagePreview) return;

    if (!checkAndConsumeUsage('aiQuestions')) {
      return;
    }

    setIsLoading(true);
    setSolution(null);
    setTutorError(null);
    setRevealedPracticeAnswer(false);
    setSavedSuccess(false);

    try {
      const res = await askAIDoubt({
        questionText: questionText.trim(),
        imageBase64: imagePreview || undefined,
        imageMimeType,
        subject: selectedSubject,
        classLevel: selectedClass,
        language,
      });
      if (!res) throw new Error('Unable to retrieve solution from AI Tutor.');
      setSolution(res);
      addXP(20, 'Doubt Solved');
    } catch (err: any) {
      console.error('Error solving doubt:', err);
      setTutorError(err.message || 'Unable to solve doubt right now. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeechToggle = () => {
    if (!solution) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const speechText = `Concept: ${solution.concept}. Explanation: ${solution.conceptExplanation}. Final answer: ${solution.finalAnswer}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveToNotes = () => {
    if (!solution) return;
    saveNote({
      id: `note-${Date.now()}`,
      userId: user.uid,
      title: `${solution.concept} — Solved Doubt`,
      subjectId: (solution.detectedSubject?.toLowerCase() || 'science') as SubjectId,
      chapterName: solution.detectedTopic || 'Doubt Solutions',
      topicName: solution.concept,
      detailLevel: 'medium',
      content: `### Question\n${solution.question}\n\n### Concept\n${solution.conceptExplanation}\n\n### Step-by-Step Solution\n${solution.stepByStep.map((s) => `**Step ${s.stepNumber}: ${s.title}**\n${s.explanation}\n${s.calculation ? `*Calculation*: ${s.calculation}` : ''}`).join('\n\n')}\n\n**Final Answer**: ${solution.finalAnswer}`,
      definitions: [{ term: solution.concept, definition: solution.conceptExplanation }],
      keyFormulas: solution.numericalBreakdown ? [solution.numericalBreakdown.formula] : [],
      commonMistakes: solution.commonMistakes,
      examTips: ['Review standard step-by-step derivation before solving numericals.'],
      quickRevisionPoints: [solution.finalAnswer],
      isFavorite: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setSavedSuccess(true);
  };

  const handleCopySolution = () => {
    if (!solution) return;
    const textToCopy = `Question: ${solution.question}\n\nConcept: ${solution.concept}\n\nSolution:\n${solution.stepByStep.map((s) => `Step ${s.stepNumber}: ${s.title}\n${s.explanation}`).join('\n\n')}\n\nFinal Answer: ${solution.finalAnswer}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLatex = () => {
    if (!solution) return;
    const latexCode = formatDoubtSolutionAsLaTeX(solution, {
      subject: selectedSubject,
      classLevel: selectedClass,
    });
    navigator.clipboard.writeText(latexCode);
    setCopiedLatex(true);
    toast.success('LaTeX snippet copied! Ready for your notes or Overleaf.');
    setTimeout(() => setCopiedLatex(false), 2000);
  };

  const currentLang = (language as SupportedLanguage) || 'en';

  return (
    <div id="ai-tutor-page" className="space-y-6 pb-20 md:pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{translateUI('AI Tutor', currentLang)}</h1>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                Step-by-Step Helper
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Ask any question, solve math &amp; physics numericals step-by-step, or scan textbook photos.
            </p>
          </div>
        </div>

        {/* Filters & Deep Work Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleDeepWork}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isDeepWork
                ? 'bg-amber-500 text-slate-950 animate-pulse ring-2 ring-amber-300'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
            }`}
            title="Toggle Deep Work Mode (Hides other UI & blocks notifications)"
          >
            <Shield className={`w-4 h-4 ${isDeepWork ? 'text-slate-950' : 'text-indigo-600'}`} />
            <span>{isDeepWork ? 'Deep Work Active 🧘' : 'Deep Work Mode'}</span>
          </button>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:border-indigo-600 cursor-pointer"
          >
            <option value="science">Science (Phy/Chem/Bio)</option>
            <option value="math">Mathematics</option>
            <option value="english">English</option>
            <option value="social_science">Social Science</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value as ClassLevel)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:border-indigo-600 cursor-pointer"
          >
            {['6', '7', '8', '9', '10', '11', '12'].map((c) => (
              <option key={c} value={c}>Class {c}th</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tutor Mode Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTutorTab('doubt')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTutorTab === 'doubt'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI Doubt &amp; Formula Solver</span>
        </button>

        <button
          onClick={() => setActiveTutorTab('handwritten')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTutorTab === 'handwritten'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Handwritten Solution Checker</span>
        </button>

        <button
          onClick={() => setActiveTutorTab('textbook_photo')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTutorTab === 'textbook_photo'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Textbook Scanner</span>
        </button>

        <button
          onClick={() => setActiveTutorTab('viva_feynman')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTutorTab === 'viva_feynman'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Viva Voce &amp; Feynman Mode</span>
        </button>
      </div>

      {activeTutorTab === 'handwritten' && (
        <HandwrittenSolutionTab currentClass={selectedClass} currentSubject={selectedSubject} />
      )}

      {activeTutorTab === 'textbook_photo' && (
        <TextbookPhotoTab
          currentClass={selectedClass}
          currentSubject={selectedSubject}
          onSendToDoubtSolver={(text, img) => {
            setActiveTutorTab('doubt');
            setQuestionText(text);
            if (img) {
              setImagePreview(`data:image/jpeg;base64,${img}`);
            }
          }}
        />
      )}

      {activeTutorTab === 'viva_feynman' && (
        <VivaFeynmanTab currentClass={selectedClass} currentSubject={selectedSubject} />
      )}

      {activeTutorTab === 'doubt' && (
        <>
          {/* Deep Work Active Banner */}
      {isDeepWork && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 px-5 py-4 rounded-3xl flex items-center justify-between shadow-xl animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold text-lg shadow-md">
              🧘
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider">Deep Work Session Engaged</h4>
              <p className="text-xs font-medium opacity-90">Distractions hidden • Notifications blocked • Maximum cognitive focus active</p>
            </div>
          </div>
          <button
            onClick={toggleDeepWork}
            className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-md transition-colors cursor-pointer shrink-0"
          >
            Exit Deep Work
          </button>
        </div>
      )}

      {/* Input Box Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        {imagePreview && (
          <div className="relative inline-block border border-slate-200 rounded-2xl p-2 bg-slate-50">
            <img src={imagePreview} alt="Uploaded question" className="max-h-48 rounded-xl object-contain" />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 text-xs hover:bg-rose-600 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="relative">
          <textarea
            id="doubt-question-input"
            rows={4}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Type your question or paste a numerical problem here... (e.g. An object is placed 10 cm in front of a concave mirror of focal length 15 cm. Find image position and magnification.)"
            className="w-full p-4 rounded-2xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-slate-900 text-sm leading-relaxed focus:outline-hidden resize-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-slate-600" />
              <span>Scan / Upload Image</span>
            </button>

            <button
              type="button"
              onClick={handleVoiceInputToggle}
              className={`flex items-center gap-1.5 px-3.5 py-2 font-bold text-xs rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-200'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
              title="Ask Verbally (Speech to Text)"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-600" />}
              <span>{isListening ? 'Listening... (Speak Now)' : 'Ask Verbally (Mic)'}</span>
            </button>
          </div>

          <button
            id="solve-doubt-btn"
            type="button"
            disabled={isLoading || (!questionText.trim() && !imagePreview)}
            onClick={handleSolve}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing & Solving...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Solve with AI Tutor</span>
              </>
            )}
          </button>
        </div>

        {tutorError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{tutorError}</span>
            </div>
            <button
              type="button"
              onClick={handleSolve}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs cursor-pointer shrink-0 self-start sm:self-auto"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Suggested Prompts */}
        {!solution && !isLoading && !isDeepWork && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Try these sample questions:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestionText(q.text);
                    setSelectedSubject(q.subject);
                  }}
                  className="text-left text-xs text-slate-600 bg-slate-50 hover:bg-indigo-50/70 hover:text-indigo-900 border border-slate-200/80 p-2.5 rounded-xl transition-colors truncate"
                >
                  • {q.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Solution Presentation */}
      {solution && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Solution Header Banner */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                  Concept: {solution.concept}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSpeechToggle}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isSpeaking ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Listen to Explanation (Audio Tutor)"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSpeaking ? 'Mute' : 'Listen'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySolution}
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  id="copy-latex-snippet-button"
                  onClick={handleCopyLatex}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    copiedLatex
                      ? 'bg-violet-100 text-violet-800 border-violet-300'
                      : 'border-slate-200 bg-slate-50 hover:bg-violet-50 hover:text-violet-900 text-slate-700'
                  }`}
                  title="Copy explanation and equations as formatted LaTeX for your notes or Overleaf"
                >
                  <FileCode className="w-4 h-4 text-violet-600" />
                  <span>{copiedLatex ? 'LaTeX Copied!' : 'Copy LaTeX'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveToNotes}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    savedSuccess
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>{savedSuccess ? 'Saved in Notes' : 'Save to Notes'}</span>
                </button>
              </div>
            </div>

            {/* Concept Intuition Box */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 text-xs sm:text-sm text-indigo-950 leading-relaxed">
              <strong className="block text-indigo-900 font-bold mb-1">💡 Core Academic Intuition:</strong>
              <CitationInjector
                text={solution.conceptExplanation}
                citations={solution.citations}
                defaultBookTitle={`NCERT Class ${selectedClass} ${selectedSubject}`}
                defaultChapterName={solution.concept}
              />
            </div>

            {/* Verified NCERT Textbook Citations List */}
            {((solution.citations && solution.citations.length > 0) || solution.source) && (
              <CitationListPanel
                citations={
                  solution.citations && solution.citations.length > 0
                    ? solution.citations
                    : solution.source
                    ? [
                        {
                          citationId: 'cite-auto-1',
                          pageNumber: solution.source.pageNumber || 1,
                          bookTitle: solution.source.bookTitle || `NCERT Class ${selectedClass} ${selectedSubject}`,
                          chapterName: solution.source.chapterName || solution.concept,
                          sectionTitle: solution.source.sectionTitle,
                          exactQuote: solution.source.exactQuote,
                          relevanceScore: 98,
                        },
                      ]
                    : []
                }
                bookTitle={`NCERT Class ${selectedClass} ${selectedSubject}`}
                chapterName={solution.concept}
              />
            )}

            {/* Numerical Breakdown Box (If Numerical) */}
            {solution.numericalBreakdown && (
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-5 space-y-3 font-mono text-xs sm:text-sm">
                <p className="font-sans font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  🔬 Numerical Formulation Matrix
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-400">Given:</span> {solution.numericalBreakdown.given.join(', ')}
                  </div>
                  <div>
                    <span className="text-slate-400">Formula:</span> <span className="text-emerald-400 font-bold">{solution.numericalBreakdown.formula}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Substitution:</span> {solution.numericalBreakdown.substitution}
                  </div>
                  <div>
                    <span className="text-slate-400">Calculation:</span> {solution.numericalBreakdown.calculation}
                  </div>
                </div>
              </div>
            )}

            {/* Step-by-Step Cards */}
            <div className="space-y-3 pt-2">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Step-by-Step Educational Solution</h3>
              {solution.stepByStep.map((step) => (
                <div
                  key={step.stepNumber}
                  className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {step.stepNumber}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{step.title}</h4>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-8">
                    <CitationInjector
                      text={step.explanation}
                      citations={solution.citations}
                      defaultBookTitle={`NCERT Class ${selectedClass} ${selectedSubject}`}
                      defaultChapterName={solution.concept}
                    />
                  </div>
                  {step.calculation && (
                    <div className="ml-8 bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-xs text-indigo-900">
                      {step.calculation}
                    </div>
                  )}
                  {step.whyItWorks && (
                    <div className="text-[11px] text-slate-500 italic pl-8">
                      <strong>Why this works:</strong>{' '}
                      <CitationInjector
                        text={step.whyItWorks}
                        citations={solution.citations}
                        defaultBookTitle={`NCERT Class ${selectedClass} ${selectedSubject}`}
                        defaultChapterName={solution.concept}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Final Answer Banner */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">Final Answer</p>
                <p className="font-black text-emerald-950 text-base sm:text-lg">{solution.finalAnswer}</p>
              </div>
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>

            {/* Common Mistakes Warning */}
            {solution.commonMistakes && solution.commonMistakes.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Common Student Mistakes (Board Exam Traps)</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-amber-950">
                  {solution.commonMistakes.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Similar Practice Question */}
            {solution.similarPracticeQuestion && (
              <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-sky-900 font-bold text-xs uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-sky-600" />
                  <span>Similar Practice Drill (Test Your Understanding)</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  {solution.similarPracticeQuestion.question}
                </p>
                <p className="text-xs text-slate-600 italic">
                  <strong>Hint:</strong> {solution.similarPracticeQuestion.hint}
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setRevealedPracticeAnswer(!revealedPracticeAnswer)}
                    className="text-xs font-bold text-sky-700 bg-white border border-sky-300 px-3 py-1.5 rounded-xl hover:bg-sky-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{revealedPracticeAnswer ? 'Hide Solution' : 'Reveal Answer & Solution'}</span>
                    {revealedPracticeAnswer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {revealedPracticeAnswer && (
                    <div className="mt-2.5 p-3 rounded-xl bg-white border border-sky-200 text-xs text-slate-800">
                      <strong>Solution:</strong> {solution.similarPracticeQuestion.answer}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Follow-Up Action Chips */}
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Ask AI Tutor a Follow-up:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  `Explain ${solution.concept} with a simple real-life everyday analogy.`,
                  `What are the high-yield NCERT exam questions on ${solution.concept}?`,
                  `Give me 3 practice multiple choice questions (MCQs) on ${solution.concept} with explanations.`,
                  `What are the most common student mistakes or formula traps in ${solution.concept}?`
                ].map((followUpText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuestionText(followUpText);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setTimeout(() => {
                        handleSolve();
                      }, 200);
                    }}
                    className="text-xs bg-white hover:bg-indigo-600 hover:text-white text-indigo-950 font-medium px-3 py-2 rounded-xl border border-indigo-200 shadow-xs transition-all cursor-pointer text-left"
                  >
                    💡 {followUpText}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
      </>
      )}
    </div>
  );
};

export default AITutorPage;
