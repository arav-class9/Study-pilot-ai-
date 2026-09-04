import React, { useState, useRef, useEffect } from 'react';
import { StudyNote } from '../../types';
import { chatWithNotesApi } from '../../services/aiClient';
import { MessageSquare, Send, X, Sparkles, Bot, User, Loader2, BookOpen, ChevronDown } from 'lucide-react';

interface NotesChatWidgetProps {
  notesList: StudyNote[];
  activeNote?: StudyNote | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  relatedKeyConcept?: string;
  followUpSuggestions?: string[];
  timestamp: string;
}

export const NotesChatWidget: React.FC<NotesChatWidgetProps> = ({ notesList, activeNote }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string>(activeNote?.id || notesList[0]?.id || '');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your Notes AI Assistant. Ask me any question about your generated study notes, formulas, or key concepts!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keep selectedNoteId updated if activeNote changes
  useEffect(() => {
    if (activeNote) {
      setSelectedNoteId(activeNote.id);
    }
  }, [activeNote]);

  const currentNote = notesList.find((n) => n.id === selectedNoteId) || notesList[0];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    if (!currentNote) {
      alert('Please generate or select a study note first to chat with.');
      return;
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const res = await chatWithNotesApi({
        question: query.trim(),
        notesContent: currentNote.content,
        chapterName: currentNote.chapterName,
        subject: currentNote.subjectId,
      });

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: res.answer,
        relatedKeyConcept: res.relatedKeyConcept,
        followUpSuggestions: res.followUpSuggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: `I had trouble connecting to the AI notes engine: ${error.message || 'Unknown error'}. Please try asking again!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (notesList.length === 0) {
    return null; // Don't show if no notes exist
  }

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-3.5 rounded-full shadow-xl flex items-center gap-2.5 font-bold text-xs sm:text-sm transition-all hover:scale-105 cursor-pointer border border-indigo-400/30"
          title="Chat with your Notes"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <span>Chat with your Notes</span>
        </button>
      )}

      {/* Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[520px] overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm">Notes AI Assistant</h3>
                <p className="text-[10px] text-slate-400">Contextual answers from your study notes</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Note Selector bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
              <select
                value={selectedNoteId}
                onChange={(e) => setSelectedNoteId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none truncate w-full cursor-pointer"
              >
                {notesList.map((n) => (
                  <option key={n.id} value={n.id}>
                    [{n.subjectId.toUpperCase()}] {n.chapterName} - {n.title}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shrink-0">
              {currentNote ? currentNote.subjectId : 'Active'}
            </span>
          </div>

          {/* Messages Scroll Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 space-y-2 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-xs'
                  }`}
                >
                  {msg.relatedKeyConcept && (
                    <div className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                      {msg.relatedKeyConcept}
                    </div>
                  )}

                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Follow-up suggestion chips */}
                  {msg.followUpSuggestions && msg.followUpSuggestions.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Suggested follow-ups:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.followUpSuggestions.map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSendMessage(suggestion)}
                            className="text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer text-left"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[9px] text-right ${
                      msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Analyzing notes & generating answer...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask anything about "${currentNote?.chapterName || 'Notes'}"...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
