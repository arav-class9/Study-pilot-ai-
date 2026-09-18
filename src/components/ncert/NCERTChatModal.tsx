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
  Languages,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { askTextbookRAG, CitationItem } from '../../services/ncertRAGClient';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  citations?: CitationItem[];
  groundingScore?: number;
  hallucinationRisk?: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface NCERTChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: NCERTChapter;
  pageContent: NCERTPageContent | null;
  pageNumber: number;
  onNavigateToPage?: (pageNum: number) => void;
}

export const NCERTChatModal: React.FC<NCERTChatModalProps> = ({
  isOpen,
  onClose,
  chapter,
  pageContent,
  pageNumber,
  onNavigateToPage,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcoming message on open or page change
  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hello! I am your StudyPilot AI Textbook-Grounded RAG Tutor for **${chapter.title}** (Page ${pageNumber}).\n\nAll my answers are strictly grounded in your official NCERT textbook with page-by-page citations. Ask me anything!`,
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

    const pageText = (pageContent?.paragraphs || []).join('\n') || pageContent?.heading || 'NCERT Chapter Text';

    try {
      const ragResult = await askTextbookRAG({
        query: userMsg.text,
        bookTitle: `NCERT Class ${chapter.classLevel} ${chapter.subjectId}`,
        chapterName: chapter.title,
        classLevel: chapter.classLevel,
        subject: chapter.subjectId,
        language,
        availablePages: [
          {
            pageNumber,
            sectionTitle: pageContent?.sectionTitle,
            heading: pageContent?.heading,
            text: pageText,
            formulas: pageContent?.formulas,
            keyPoints: pageContent?.keyConcepts,
          },
        ],
        filterPageNumber: pageNumber,
      });

      const aiMsg: Message = {
        id: ragResult.id || `ai-${Date.now()}`,
        sender: 'ai',
        text: ragResult.answer,
        citations: ragResult.citations,
        groundingScore: ragResult.groundingConfidenceScore,
        hallucinationRisk: ragResult.hallucinationCheck?.hallucinationRisk,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `I had trouble querying the NCERT textbook RAG engine: ${err.message || 'Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    `Explain the core concept on Page ${pageNumber} with citations.`,
    `What formulas are highlighted in this section?`,
    `Give a board exam level question from this page.`,
    `What laboratory activity is described here?`,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl h-[88vh] sm:h-[650px] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs shadow-inner">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base leading-tight">Textbook-Grounded RAG Tutor</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase">
                  Page {pageNumber}
                </span>
              </div>
              <p className="text-[11px] text-blue-100 truncate max-w-xs sm:max-w-sm">
                NCERT Class {chapter.classLevel} • {chapter.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Multilingual Selector */}
            <div className="flex items-center bg-white/20 rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  language === 'en' ? 'bg-white text-indigo-700 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  language === 'hi' ? 'bg-white text-indigo-700 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hinglish')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  language === 'hinglish' ? 'bg-white text-indigo-700 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                Hinglish
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick prompt chips */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" /> Grounded Prompts:
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[88%] sm:max-w-[82%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                    isAI
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                      : 'bg-blue-600 text-white shadow-sm'
                  }`}
                >
                  {/* Grounding Badge */}
                  {isAI && msg.groundingScore && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md w-fit">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{msg.groundingScore}% Grounded Citation Match</span>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Textbook Citations Block */}
                  {isAI && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/80 space-y-1.5">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-indigo-500" />
                        <span>Textbook Sources & Citations:</span>
                      </p>
                      <div className="space-y-1">
                        {msg.citations.map((cite) => (
                          <div
                            key={cite.citationId}
                            className="bg-white dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] flex items-center justify-between gap-2"
                          >
                            <div className="truncate">
                              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                {cite.bookTitle} (Page {cite.pageNumber})
                              </span>
                              {cite.exactQuote && (
                                <p className="text-slate-500 dark:text-slate-400 truncate italic">
                                  "{cite.exactQuote}"
                                </p>
                              )}
                            </div>
                            {onNavigateToPage && (
                              <button
                                type="button"
                                onClick={() => {
                                  onNavigateToPage(cite.pageNumber);
                                  onClose();
                                }}
                                className="shrink-0 px-2 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg font-bold text-[10px] hover:bg-indigo-100 flex items-center gap-1"
                              >
                                <span>Go to Page</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-white dark:bg-slate-700 text-slate-500 hover:text-slate-900 transition-opacity cursor-pointer"
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
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
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
              <span>Grounding answer against textbook corpus on Page {pageNumber}...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
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
              placeholder={`Ask a grounded question about Page ${pageNumber}...`}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
