import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { sendMultiTurnGeminiChat, GeminiChatMessage } from '../../services/aiClient';
import { DatabaseService } from '../../lib/firebase/db';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '../../utils/androidBridge';
import katex from 'katex';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  Brain,
  BookOpen,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  BookmarkPlus,
  Image as ImageIcon,
  X,
  Mic,
  MicOff,
  User,
  SlidersHorizontal,
  ChevronDown,
  Sparkle,
  Cpu,
  Layers,
  FileText
} from 'lucide-react';

interface ChatMessageDisplay {
  id: string;
  role: 'user' | 'model';
  text: string;
  imagePreview?: string;
  modelUsed?: string;
  timestamp: string;
  roleId?: string;
  groundingSources?: Array<{ title?: string; uri?: string }>;
}

interface ChatPersona {
  id: string;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultComplexity: 'general' | 'complex' | 'fast';
  defaultModel: string;
  color: string;
  bgColor: string;
  systemInstruction: string;
  suggestions: string[];
}

const CHAT_PERSONAS: ChatPersona[] = [
  {
    id: 'socratic',
    name: 'Socratic Tutor',
    tagline: 'Step-by-step guidance with analogies & questions',
    icon: GraduationIcon,
    defaultComplexity: 'general',
    defaultModel: 'gemini-3.8-flash',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    systemInstruction:
      'You are StudyPilot AI, an encouraging Socratic Study Coach for Class 9-12 CBSE & State Board students. Guide the student step-by-step. Ask guiding questions, explain concepts conceptually with clear analogies, and format math/science using LaTeX ($...$ or $$...$$).',
    suggestions: [
      'Explain Newton\'s Second Law of Motion with an everyday analogy.',
      'How does photosynthesis convert light energy into chemical energy?',
      'Why is democracy considered the best form of government?'
    ]
  },
  {
    id: 'stem_complex',
    name: 'STEM & Math Solver',
    tagline: 'Deep proofs, physics derivations & chemistry mechanisms',
    icon: Brain,
    defaultComplexity: 'complex',
    defaultModel: 'gemini-4-argon',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    systemInstruction:
      'You are StudyPilot AI Senior STEM Professor powered by Gemini 4 Argon. Provide deep, rigorous, step-by-step mathematical proofs, physics derivations, and chemistry mechanisms for complex questions. Show every step clearly with LaTeX mathematical equations.',
    suggestions: [
      'Derive the quadratic formula by completing the square step-by-step.',
      'Derive the 3 equations of motion using graphical and calculus methods.',
      'Explain the mechanism of Esterification and Saponification in organic chemistry.'
    ]
  },
  {
    id: 'quick_revision',
    name: 'Fast Revision Coach',
    tagline: 'Ultra-fast bullet points & high-yield memory triggers',
    icon: Zap,
    defaultComplexity: 'fast',
    defaultModel: 'gemini-3.1-flash-lite',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    systemInstruction:
      'You are StudyPilot AI Express Revision Coach powered by Gemini 3.1 Flash Lite. Provide instant, high-density, bulleted answers and key memory triggers for fast exam review. Keep responses concise and focused on high-yield points.',
    suggestions: [
      'Give me 5 bullet points to revise Mendelian Inheritance for Class 10.',
      'Quick formula checklist for Electricity and Electric Power.',
      'Top 4 key events of The French Revolution for fast recap.'
    ]
  },
  {
    id: 'essay_critic',
    name: 'Language & Writing Critic',
    tagline: 'Grammar analysis, essay structure & literary critique',
    icon: BookOpen,
    defaultComplexity: 'general',
    defaultModel: 'gemini-3.8-flash',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    systemInstruction:
      'You are StudyPilot AI English Literature & Writing Mentor. Analyze grammar, essay structure, character analysis, and literary devices for Class 9-12 English curriculum. Provide constructive feedback and polished writing examples.',
    suggestions: [
      'How to structure a 5-paragraph analytical essay on "The Letter" by Dhumketu?',
      'Explain the literary devices used in the poem "The Road Not Taken".',
      'Provide a template for a formal letter to the editor regarding local pollution.'
    ]
  }
];

function GraduationIcon(props: { className?: string }) {
  return (
    <svg className={props.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  );
}

export const GeminiChatbotTab: React.FC = () => {
  const { user, saveNote, selectedSubjectId, selectedClassLevel } = useApp();

  const [selectedPersona, setSelectedPersona] = useState<ChatPersona>(CHAT_PERSONAS[0]);
  const [taskComplexity, setTaskComplexity] = useState<'general' | 'complex' | 'fast'>('general');
  const [messages, setMessages] = useState<ChatMessageDisplay[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! 👋 I am your Gemini Multi-Turn AI Study Companion.\n\nSelect a chatbot role or task complexity below, ask any academic question, or attach a question photo. I will keep full conversation context!`,
      modelUsed: 'gemini-3.8-flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      roleId: 'socratic'
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedMime, setAttachedMime] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customRoleInstruction, setCustomRoleInstruction] = useState('');
  const [showRoleCustomizer, setShowRoleCustomizer] = useState(false);
  const [useSearchGrounding, setUseSearchGrounding] = useState(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of conversation thread
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSelectPersona = (persona: ChatPersona) => {
    triggerHaptic('selection');
    setSelectedPersona(persona);
    setTaskComplexity(persona.defaultComplexity);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image size must be under 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAttachedImage(result);
      setAttachedMime(file.type || 'image/jpeg');
      toast.success('Diagram / Question image attached!');
    };
    reader.readAsDataURL(file);
  };

  const handleVoiceInputToggle = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast.error('Voice recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e: any) => {
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        setInputQuery(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend && !attachedImage) {
      toast.error('Please enter a message or attach an image.');
      return;
    }

    triggerHaptic('selection');

    // Build user message
    const userMsgId = `user-${Date.now()}`;
    const userDisplayMsg: ChatMessageDisplay = {
      id: userMsgId,
      role: 'user',
      text: textToSend,
      imagePreview: attachedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userDisplayMsg];
    setMessages(newMessages);
    setInputQuery('');
    const currentImg = attachedImage;
    const currentMime = attachedMime;
    setAttachedImage(null);
    setIsLoading(true);

    try {
      // Build API payload formatted for Gemini API multi-turn chat
      const apiMessages: GeminiChatMessage[] = newMessages
        .filter((m) => m.id !== 'welcome-msg')
        .map((m) => {
          const parts: any[] = [];
          if (m.text) {
            parts.push({ text: m.text });
          }
          if (m.id === userMsgId && currentImg) {
            const base64Data = currentImg.replace(/^data:image\/\w+;base64,/, '');
            parts.push({
              inlineData: {
                mimeType: currentMime,
                data: base64Data,
              },
            });
          }
          return {
            role: m.role,
            parts: parts.length > 0 ? parts : [{ text: m.text || '' }],
          };
        });

      const effectiveInstruction = customRoleInstruction.trim() || selectedPersona.systemInstruction;

      const result = await sendMultiTurnGeminiChat({
        messages: apiMessages,
        roleId: selectedPersona.id,
        systemInstruction: effectiveInstruction,
        taskComplexity,
        classLevel: String(selectedClassLevel || '10'),
        subject: String(selectedSubjectId || 'Science'),
        useSearchGrounding,
      });

      const modelDisplayMsg: ChatMessageDisplay = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: result.reply,
        modelUsed: result.modelUsed,
        roleId: selectedPersona.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingSources: result.groundingSources,
      };

      setMessages((prev) => [...prev, modelDisplayMsg]);

      // Save conversation thread to Firestore asynchronously
      if (user?.uid) {
        DatabaseService.saveConversation(user.uid, {
          id: `conv-gemini-${selectedPersona.id}`,
          title: `Gemini Chat - ${selectedPersona.name}`,
          updatedAt: new Date().toISOString(),
          messages: [...newMessages, modelDisplayMsg].slice(-20),
        }).catch(console.error);
      }
    } catch (err: any) {
      console.error('Gemini Chat error:', err);
      toast.error(err.message || 'Failed to get response from Gemini AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    triggerHaptic('selection');
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: `Chat thread cleared! How can I help you with Class ${selectedClassLevel || '10'} ${selectedSubjectId || 'Science'} today?`,
        modelUsed: selectedPersona.defaultModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleId: selectedPersona.id,
      },
    ]);
    toast.success('Chat history cleared!');
  };

  const handleSpeakText = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#$`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    toast.success('Copied message!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveAsNote = (text: string) => {
    triggerHaptic('selection');
    saveNote({
      id: `note-chat-${Date.now()}`,
      userId: user?.uid || 'pilot-student-001',
      title: `Gemini Chat Note — ${selectedPersona.name}`,
      subjectId: (selectedSubjectId as any) || 'science',
      chapterName: 'Gemini AI Conversation',
      topicName: 'Multi-Turn Chat',
      detailLevel: 'medium',
      content: text,
      definitions: [{ term: selectedPersona.name, definition: 'Gemini Chat Response' }],
      keyPoints: [text.substring(0, 120) + '...'],
      overview: text.substring(0, 200),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
    });
    toast.success('Saved response to My Notes!');
  };

  // Simple LaTeX renderer for inline math expressions
  const renderFormattedText = (rawText: string) => {
    // Process math blocks ($$ ... $$ and $ ... $)
    const lines = rawText.split('\n');
    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-2" />;

          // Check if line contains inline math
          if (line.includes('$')) {
            const parts = line.split(/(\$\$.*?\$\$|\$.*?\$)/g);
            return (
              <p key={idx} className="text-slate-800 dark:text-slate-100 font-normal">
                {parts.map((p, pIdx) => {
                  if (p.startsWith('$$') && p.endsWith('$$')) {
                    const mathExpr = p.slice(2, -2);
                    try {
                      const html = katex.renderToString(mathExpr, { displayMode: true, throwOnError: false });
                      return <span key={pIdx} dangerouslySetInnerHTML={{ __html: html }} className="block my-2 overflow-x-auto" />;
                    } catch {
                      return <code key={pIdx} className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600">{p}</code>;
                    }
                  } else if (p.startsWith('$') && p.endsWith('$')) {
                    const mathExpr = p.slice(1, -1);
                    try {
                      const html = katex.renderToString(mathExpr, { displayMode: false, throwOnError: false });
                      return <span key={pIdx} dangerouslySetInnerHTML={{ __html: html }} className="inline-block px-1" />;
                    } catch {
                      return <code key={pIdx} className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600">{p}</code>;
                    }
                  }
                  return p;
                })}
              </p>
            );
          }

          // Bullet points
          if (line.trim().startsWith('•') || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const content = line.trim().replace(/^[\u2022\-\*]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2.5 ml-1 my-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-2 shrink-0" />
                <span className="text-slate-800 dark:text-slate-200">{content}</span>
              </div>
            );
          }

          // Bold section headers
          if (line.startsWith('###') || line.startsWith('##')) {
            return (
              <h4 key={idx} className="font-extrabold text-base text-slate-900 dark:text-white mt-3 mb-1">
                {line.replace(/^#+\s*/, '')}
              </h4>
            );
          }

          return (
            <p key={idx} className="text-slate-800 dark:text-slate-200">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  const IconComp = selectedPersona.icon;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-12">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 rounded-3xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-indigo-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Gemini Multi-Turn Chatbot
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-[10px] font-bold text-indigo-200 uppercase tracking-wider">
                Full Context
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Multi-turn interactive tutor maintaining conversation history across roles & models.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRoleCustomizer(!showRoleCustomizer)}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span>Customize System Role</span>
          </button>

          <button
            onClick={handleClearChat}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Role / Persona Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {CHAT_PERSONAS.map((persona) => {
          const isSelected = selectedPersona.id === persona.id;
          const PersonaIcon = persona.icon;
          return (
            <button
              key={persona.id}
              onClick={() => handleSelectPersona(persona)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/20 text-white' : persona.bgColor + ' ' + persona.color}`}>
                  <PersonaIcon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {persona.defaultModel.replace('gemini-', '')}
                </span>
              </div>
              <div>
                <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {persona.name}
                </p>
                <p className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {persona.tagline}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Speed & Model Selector Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Model Engine:</span>
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setTaskComplexity('fast')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                taskComplexity === 'fast'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Fast Mode: gemini-3.1-flash-lite"
            >
              ⚡ Fast (3.1 Lite)
            </button>

            <button
              onClick={() => setTaskComplexity('general')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                taskComplexity === 'general'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="General Mode: gemini-3.8-flash"
            >
              🎓 Standard (3.8 Flash)
            </button>

            <button
              onClick={() => setTaskComplexity('complex')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                taskComplexity === 'complex'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Complex STEM Mode: gemini-4-argon"
            >
              🧠 Complex (4 Argon)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setUseSearchGrounding(!useSearchGrounding)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              useSearchGrounding
                ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
            title="Google Search Grounding (gemini-3.8-flash with googleSearch tool)"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Google Search Grounded {useSearchGrounding ? 'ON' : 'OFF'}</span>
          </button>

          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Active Role: <strong className="text-slate-800 dark:text-slate-200">{selectedPersona.name}</strong></span>
          </div>
        </div>
      </div>

      {/* Role Customizer Drawer Panel */}
      {showRoleCustomizer && (
        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              Custom System Instruction (Role Prompt)
            </span>
            <button
              onClick={() => setCustomRoleInstruction('')}
              className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Reset to Persona Default
            </button>
          </div>
          <textarea
            value={customRoleInstruction || selectedPersona.systemInstruction}
            onChange={(e) => setCustomRoleInstruction(e.target.value)}
            rows={3}
            className="w-full text-xs font-mono p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
            placeholder="Enter custom persona role instructions..."
          />
        </div>
      )}

      {/* Chat Thread Container */}
      <div
        ref={chatContainerRef}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm min-h-[420px] max-h-[580px] overflow-y-auto space-y-4"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                  isUser
                    ? 'bg-indigo-600 shadow-sm'
                    : 'bg-slate-900 dark:bg-indigo-950 border border-slate-800 text-indigo-400'
                }`}
              >
                {isUser ? (
                  user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Bubble */}
              <div className={`space-y-1.5 max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-3xl text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-slate-50 dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                  }`}
                >
                  {/* Image Attachment inside Bubble */}
                  {msg.imagePreview && (
                    <div className="mb-3 rounded-2xl overflow-hidden border border-white/20 max-w-xs">
                      <img src={msg.imagePreview} alt="Attached Diagram" className="w-full h-auto object-cover" />
                    </div>
                  )}

                  {isUser ? (
                    <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                  ) : (
                    <>
                      {renderFormattedText(msg.text)}
                      {msg.groundingSources && msg.groundingSources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                          <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Grounded Google Search Sources:
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {msg.groundingSources.map((src, sIdx) => (
                              <a
                                key={sIdx}
                                href={src.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-[11px] font-medium text-blue-700 dark:text-blue-300 hover:underline transition-colors"
                              >
                                🔗 <span className="max-w-[180px] truncate">{src.title || src.uri}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Footer Metadata & Actions for Model */}
                <div className={`flex items-center gap-3 px-1 text-[11px] text-slate-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.timestamp}</span>

                  {!isUser && msg.modelUsed && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-[10px] text-indigo-600 dark:text-indigo-400">
                      {msg.modelUsed}
                    </span>
                  )}

                  {!isUser && (
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="Copy message text"
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleSpeakText(msg.id, msg.text)}
                        title="Listen to response"
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                      >
                        {speakingMsgId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleSaveAsNote(msg.text)}
                        title="Save response to My Notes"
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-2xl bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-3xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span>Gemini is analyzing multi-turn context and reasoning...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
          Suggestions:
        </span>
        {selectedPersona.suggestions.map((sugg, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(sugg)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap cursor-pointer transition-all shrink-0"
          >
            {sugg}
          </button>
        ))}
      </div>

      {/* Input Control Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm space-y-2">
        {/* Image Attachment Preview Bar */}
        {attachedImage && (
          <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/60 p-2.5 rounded-2xl border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-2.5 truncate">
              <img src={attachedImage} alt="Attachment" className="w-8 h-8 rounded-xl object-cover shrink-0" />
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 truncate">
                Question Diagram attached (multimodal context)
              </span>
            </div>
            <button
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* File Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach question image / diagram"
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Voice Mic Input */}
          <button
            onClick={handleVoiceInputToggle}
            title={isListening ? "Stop listening" : "Voice input"}
            className={`p-3 rounded-2xl cursor-pointer transition-colors ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Area Input */}
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Ask ${selectedPersona.name} anything... (e.g. explain, solve, compare)`}
            className="flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || (!inputQuery.trim() && !attachedImage)}
            className="h-11 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
