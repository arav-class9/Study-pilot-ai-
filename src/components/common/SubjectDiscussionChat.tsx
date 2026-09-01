import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../lib/firebase/config';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  limit,
} from 'firebase/firestore';
import { MessageSquare, Send, ThumbsUp, User, Sparkles, AlertCircle } from 'lucide-react';

interface SubjectDiscussionChatProps {
  subjectId: string;
  subjectName: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: any;
  likes: number;
}

export const SubjectDiscussionChat: React.FC<SubjectDiscussionChatProps> = ({ subjectId, subjectName }) => {
  const { user } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!subjectId) return;

    try {
      const q = query(
        collection(db, 'subjectDiscussions'),
        where('subjectId', '==', subjectId),
        orderBy('createdAt', 'asc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const loaded = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as ChatMessage[];
          setMessages(loaded);
          setErrorMsg(null);
        },
        (err) => {
          console.warn('Real-time chat snapshot error (possibly missing index):', err.message);
          // Fallback query without orderBy if index is building
          try {
            const fallbackQ = query(
              collection(db, 'subjectDiscussions'),
              where('subjectId', '==', subjectId),
              limit(50)
            );
            return onSnapshot(fallbackQ, (fallbackSnap) => {
              const loaded = fallbackSnap.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
              })) as ChatMessage[];
              // sort client side
              loaded.sort((a, b) => {
                const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return ta - tb;
              });
              setMessages(loaded);
            });
          } catch (e2) {
            setErrorMsg('Unable to sync live discussions. Please check connection.');
          }
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.warn('Chat subscription init error:', err.message);
    }
  }, [subjectId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, 'subjectDiscussions'), {
        subjectId,
        subjectName,
        userId: user.uid,
        userName: user.name || 'Student Pilot',
        userPhoto: user.photoURL || null,
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
        likes: 0,
      });
      setNewMessage('');
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleLikeMessage = async (msgId: string) => {
    try {
      const ref = doc(db, 'subjectDiscussions', msgId);
      await updateDoc(ref, {
        likes: increment(1),
      });
    } catch (e) {
      console.warn('Failed to like message:', e);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Peer Study Lounge: {subjectName}
            </h3>
            <p className="text-xs text-slate-500">
              Discuss homework doubts, share tips, and collaborate with peers in real-time.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
          Live Sync ⚡
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Messages Feed */}
      <div className="h-72 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
        {messages.length > 0 ? (
          messages.map((msg) => {
            const isMe = msg.userId === user.uid;
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                  isMe
                    ? 'bg-indigo-50/50 border-indigo-100 ml-6 sm:ml-12'
                    : 'bg-slate-50 border-slate-200 mr-6 sm:mr-12'
                }`}
              >
                {msg.userPhoto ? (
                  <img
                    src={msg.userPhoto}
                    alt={msg.userName}
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-300"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {msg.userName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{msg.userName}</span>
                    <span className="text-[10px] text-slate-400">
                      {msg.createdAt?.toDate
                        ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Just now'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed break-words">
                    {msg.text}
                  </p>

                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => handleLikeMessage(msg.id)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs"
                    >
                      <ThumbsUp className="w-3 h-3 text-indigo-500" />
                      <span>{msg.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
            <MessageSquare className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-bold text-slate-600">No messages in this subject lounge yet</p>
            <p className="text-[11px] text-slate-500">
              Be the first to start a discussion or ask a question about {subjectName}!
            </p>
          </div>
        )}
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <input
          type="text"
          placeholder={`Ask a question or discuss ${subjectName}...`}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-indigo-600"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || isSending}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
