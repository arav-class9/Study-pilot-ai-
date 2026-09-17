import React, { useState, useRef, useEffect } from 'react';
import { NCERTChapter, NCERTPageContent } from '../../types/ncert';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Copy,
  Check,
} from 'lucide-react';
import { auth } from '../../lib/firebase/config';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface NCERTChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: NCERTChapter;
  pageContent: NCERTPageContent | null;
  pageNumber: number;
}

export const NCERTChatModal: React.FC<NCERTChatModalProps> = ({
  isOpen,
  onClose,
  chapter,
  pageContent,
  pageNumber,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcoming message on open or page change
  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hello! I am your StudyPilot AI NCERT Tutor for **${chapter.title}** (Page ${pageNumber}).\n\nAsk me anything about definitions, activities, formulas, or in-text questions on this page!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, chapter.title, pageNumber]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    // Build context excerpt from current page
    const pageText = [
      pageContent?.sectionTitle ? `Section: ${pageContent.sectionTitle}` : '',
      pageContent?.heading ? `Heading: ${pageContent.heading}` : '',
      'Content:',
      ...(pageContent?.paragraphs || []),
      pageContent?.keyConcepts?.length ? `Key Concepts: ${pageContent.keyConcepts.join('; ')}` : '',
      pageContent?.formulas?.length ? `Formulas: ${pageContent.formulas.join('; ')}` : '',
      pageContent?.ncertHighlights?.length ? `Highlights: ${pageContent.ncertHighlights.join('; ')}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      let authToken = '';
      if (auth.currentUser) {
        authToken = await auth.currentUser.getIdToken();
      }

      const res = await fetch('/api/ai/notes-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          question: userMsg.text,
          notesContent: pageText || `Chapter ${chapter.title} Page ${pageNumber} of NCERT Class ${chapter.classLevel} ${chapter.subjectId}`,
          chapterName: `${chapter.title} (Page ${pageNumber})`,
          subject: chapter.subjectId,
          classLevel: chapter.classLevel,
        }),
      });

      if (!res.ok) {
        throw new Error('Could not get response from AI tutor');
      }

      const json = await res.json();
      const aiResponseText =
        json?.data?.answer ||
        json?.data?.response ||
        json?.data ||
        "I've reviewed this NCERT page. Feel free to ask more specific questions on the concepts or formulas!";

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `I had trouble connecting to the NCERT tutor: ${err.message || 'Please try again in a moment.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    `Explain the main concept on Page ${pageNumber} in simple terms.`,
    `What are the key formulas or equations on this page?`,
    `Give me a real-world example of what is described here.`,
    `What possible exam questions can come from Page ${pageNumber}?`,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl h-[85vh] sm:h-[620px] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm sm:text-base leading-tight">Ask AI Tutor</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                  Page {pageNumber} Context
                </span>
              </div>
              <p className="text-[11px] text-blue-100 truncate max-w-xs sm:max-w-sm">
                NCERT Class {chapter.classLevel} • {chapter.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick prompt chips */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" /> Quick Ask:
          </span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    isAI
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                      : 'bg-blue-600 text-white shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div
                    className={`text-[9px] mt-1 text-right ${
                      isAI ? 'text-slate-400' : 'text-blue-200'
                    }`}
                  >
                    {msg.timestamp}
                  </div>

                  {isAI && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-white dark:bg-slate-700 text-slate-500 hover:text-slate-900 transition-opacity"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {!isAI && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center animate-pulse">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span>StudyPilot AI is formulating an answer from Page {pageNumber}...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask a question about Page ${pageNumber}...`}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
