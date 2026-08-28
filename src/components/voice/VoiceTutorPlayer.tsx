import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles, Globe2, Gauge } from 'lucide-react';
import { LanguageCode, SubjectId, ClassLevel } from '../../types';

interface VoiceTutorPlayerProps {
  title?: string;
  topic?: string;
  initialTopic?: string;
  conceptText?: string;
  concept?: string;
  explanationText?: string;
  notesText?: string;
  formulaList?: string[];
  defaultLanguage?: LanguageCode;
  subject?: SubjectId;
  classLevel?: ClassLevel;
  onClose?: () => void;
}

export const VoiceTutorPlayer: React.FC<VoiceTutorPlayerProps> = ({
  title: initialTitle,
  topic,
  initialTopic,
  conceptText: initialConceptText,
  concept,
  explanationText,
  notesText,
  formulaList,
  defaultLanguage = 'en',
  onClose,
}) => {
  const displayTitle = initialTitle || topic || initialTopic || 'Concept Overview';
  const displayConceptText = initialConceptText || concept || 'Key learning concept';

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>(defaultLanguage);
  const [mode, setMode] = useState<'explain' | 'read_notes' | 'explain_slow' | 'quick_revision'>('explain');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Generate speech script tailored to mode and language
  const getSpeechScript = (): string => {
    if (language === 'hi') {
      if (mode === 'quick_revision') {
        return `रिवीजन बुलेटिन: ${displayTitle}। मुख्य विचार: ${displayConceptText}। याद रखें महत्वपूर्ण सूत्र: ${formulaList?.join(', ') || 'समीकरण ध्यान से हल करें'}।`;
      }
      return `नमस्ते! चलिए समझते हैं ${displayTitle} को। मुख्य सिद्धांत है: ${displayConceptText}। ${explanationText || notesText || ''}।`;
    }

    if (language === 'hinglish') {
      if (mode === 'quick_revision') {
        return `Quick revision for ${displayTitle}. Main concept hai: ${displayConceptText}. Formulas to remember: ${formulaList?.join(', ') || 'Practice numericals'}!`;
      }
      return `Hello student! Let's understand ${displayTitle}. Concept yeh hai ki ${displayConceptText}. ${explanationText || ''}`;
    }

    // Default English
    if (mode === 'read_notes') {
      return `StudyPilot Notes: ${displayTitle}. Key Concept: ${displayConceptText}. Detailed breakdown: ${notesText || explanationText || ''}. Key equations: ${formulaList?.join('. ') || 'None'}.`;
    } else if (mode === 'quick_revision') {
      return `60-second high-yield revision for ${displayTitle}. ${displayConceptText}. Essential Formulas: ${formulaList?.join('. ') || 'Understand the core definition'}. Ready for exam questions!`;
    } else if (mode === 'explain_slow') {
      return `Let us study carefully. Chapter topic: ${displayTitle}. First, the fundamental principle: ${displayConceptText}. Take a breath, observe the mechanism: ${explanationText || notesText || ''}.`;
    }
    return `Hello! Today we are studying ${displayTitle}. The fundamental concept is: ${displayConceptText}. ${explanationText || notesText || ''}`;
  };

  const handlePlay = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = getSpeechScript();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Rate adjustments
    let rate = speechRate;
    if (mode === 'explain_slow') rate = 0.8;
    if (mode === 'quick_revision') rate = 1.25;
    utterance.rate = rate;

    // Language code mapping
    if (language === 'hi') utterance.lang = 'hi-IN';
    else utterance.lang = 'en-US';

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if ('speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div
      id="voice-tutor-player-widget"
      className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-indigo-900/50 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">AI Voice Academic Coach</h4>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded">
                Live Audio
              </span>
            </div>
            <p className="text-xs text-slate-400">Audio walkthrough of concepts, formulas & exam tips</p>
          </div>
        </div>

        {/* Audio Visualizer Wave & Close */}
        <div className="flex items-center gap-2">
          {isPlaying && (
            <div className="flex items-center gap-1 h-6 px-3 bg-indigo-950/60 rounded-full border border-indigo-500/30">
              <span className="w-1 h-3 bg-indigo-400 rounded-full animate-bounce" />
              <span className="w-1 h-5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1 h-4 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.3s]" />
              <span className="w-1 h-6 bg-amber-300 rounded-full animate-bounce [animation-delay:0.45s]" />
              <span className="w-1 h-3 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.6s]" />
            </div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Mode & Language Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {/* Language selector */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          <Globe2 className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <span className="text-slate-400 font-medium">Lang:</span>
          {(['en', 'hi', 'hinglish'] as LanguageCode[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                handleStop();
                setLanguage(lang);
              }}
              className={`flex-1 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                language === lang
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'Hinglish'}
            </button>
          ))}
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 ml-1" />
          <span className="text-slate-400 font-medium">Mode:</span>
          <select
            value={mode}
            onChange={(e) => {
              handleStop();
              setMode(e.target.value as any);
            }}
            className="flex-1 bg-transparent text-white font-semibold text-xs focus:outline-hidden cursor-pointer"
          >
            <option value="explain" className="bg-slate-900 text-white">Explain Concept</option>
            <option value="read_notes" className="bg-slate-900 text-white">Read Full Notes</option>
            <option value="explain_slow" className="bg-slate-900 text-white">Explain Slowly (Step-by-step)</option>
            <option value="quick_revision" className="bg-slate-900 text-white">Quick 60s Revision</option>
          </select>
        </div>
      </div>

      {/* Audio Playback Controls */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button
              id="voice-tutor-play-btn"
              onClick={handlePlay}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isPaused ? 'Resume Audio' : 'Listen with Voice Tutor'}</span>
            </button>
          ) : (
            <button
              id="voice-tutor-pause-btn"
              onClick={handlePause}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-white" />
              <span>Pause</span>
            </button>
          )}

          {(isPlaying || isPaused) && (
            <button
              id="voice-tutor-stop-btn"
              onClick={handleStop}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Stop & Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Gauge className="w-3.5 h-3.5" />
          <span>{mode === 'explain_slow' ? '0.8x' : mode === 'quick_revision' ? '1.25x' : '1.0x'} Speed</span>
        </div>
      </div>
    </div>
  );
};
