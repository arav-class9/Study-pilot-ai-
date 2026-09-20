import React, { useState, useEffect } from 'react';
import { Users, Swords, Send, MessageSquare, Trophy, Copy, Check, Sparkles, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PeerMessage {
  id: string;
  senderName: string;
  text: string;
  timestamp: string;
}

interface PeerParticipant {
  id: string;
  name: string;
  avatar: string;
  score: number;
}

interface PeerStudyRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PeerStudyRoomModal: React.FC<PeerStudyRoomModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState<string>('STUDY-7821');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'battle'>('chat');
  const [messages, setMessages] = useState<PeerMessage[]>([
    {
      id: 'm1',
      senderName: 'Aarav Sharma',
      text: 'Hey team! Ready to solve the Class 10 Chemistry chapter test together?',
      timestamp: '10:14 AM',
    },
    {
      id: 'm2',
      senderName: 'Priya Patel',
      text: 'Yes! Let’s launch the AI Live Quiz Battle on Page 24 concepts.',
      timestamp: '10:15 AM',
    },
  ]);
  const [inputMsg, setInputMsg] = useState<string>('');
  const [participants, setParticipants] = useState<PeerParticipant[]>([
    { id: 'p1', name: user?.displayName || 'You', avatar: '👨‍🎓', score: 120 },
    { id: 'p2', name: 'Aarav Sharma', avatar: '🚀', score: 180 },
    { id: 'p3', name: 'Priya Patel', avatar: '⭐', score: 150 },
  ]);

  // Quiz Battle State
  const [battleActive, setBattleActive] = useState<boolean>(false);
  const [currentBattleQ, setCurrentBattleQ] = useState<number>(0);
  const [myBattleScore, setMyBattleScore] = useState<number>(0);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newM: PeerMessage = {
      id: `msg-${Date.now()}`,
      senderName: user?.displayName || 'You',
      text: inputMsg.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newM]);
    setInputMsg('');
  };

  const BATTLE_QUESTIONS = [
    {
      q: 'Which gas is evolved when Zinc reacts with dilute Sulphuric Acid?',
      options: ['Hydrogen Gas (H₂)', 'Oxygen Gas (O₂)', 'Carbon Dioxide (CO₂)', 'Nitrogen Gas (N₂)'],
      correctIndex: 0,
    },
    {
      q: 'What is the pH value of pure distilled water at room temperature?',
      options: ['pH = 0', 'pH = 7 (Neutral)', 'pH = 14', 'pH = 5.5'],
      correctIndex: 1,
    },
  ];

  const handleAnswerBattle = (idx: number) => {
    if (idx === BATTLE_QUESTIONS[currentBattleQ].correctIndex) {
      setMyBattleScore((prev) => prev + 50);
    }
    if (currentBattleQ < BATTLE_QUESTIONS.length - 1) {
      setCurrentBattleQ(currentBattleQ + 1);
    } else {
      setBattleActive(false);
      // Update score in leaderboard
      setParticipants((prev) =>
        prev.map((p) => (p.id === 'p1' ? { ...p, score: p.score + myBattleScore + 50 } : p))
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Real-time Peer Study Room
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Room:</span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white font-mono text-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>{roomCode}</span>
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Group Chat & Notes</span>
          </button>
          <button
            onClick={() => setActiveTab('battle')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'battle'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>AI Quiz Battle</span>
          </button>
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4 flex flex-col justify-between h-[300px]">
              <div className="overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 h-full">
                {messages.map((m) => (
                  <div key={m.id} className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {m.senderName}
                      </span>
                      <span className="text-[9px] text-slate-400">{m.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      {m.text}
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type notes or doubt to peers..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>

            {/* Participants Sidebar */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Live Room Leaderboard</span>
              </h3>
              <div className="space-y-2">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span>{p.avatar}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {p.score} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quiz Battle Tab */}
        {activeTab === 'battle' && (
          <div className="p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-900/50 space-y-4">
            {!battleActive ? (
              <div className="text-center space-y-4 py-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg">
                  <Swords className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Live Peer Quiz Battle
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                    Challenge all active room members to a speed quiz on Class 10 NCERT Chemistry.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setBattleActive(true);
                    setCurrentBattleQ(0);
                  }}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-widest shadow-xl transition cursor-pointer"
                >
                  Launch Quiz Battle Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Battle Question {currentBattleQ + 1} of {BATTLE_QUESTIONS.length}</span>
                  <span className="text-emerald-600">Score: {myBattleScore} XP</span>
                </div>
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  {BATTLE_QUESTIONS[currentBattleQ].q}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {BATTLE_QUESTIONS[currentBattleQ].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerBattle(idx)}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-500 hover:text-white text-slate-900 dark:text-white font-medium text-xs border border-slate-200 dark:border-slate-800 text-left transition cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
