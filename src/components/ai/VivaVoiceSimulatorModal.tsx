import React, { useState, useEffect } from 'react';
import { conductVivaVoiceTurnApi } from '../../services/aiClient';
import { Mic, Send, X, Sparkles, Bot, User, Loader2, Award, CheckCircle2, Volume2 } from 'lucide-react';

interface VivaVoiceSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterName: string;
  subject: string;
}

export const VivaVoiceSimulatorModal: React.FC<VivaVoiceSimulatorModalProps> = ({
  isOpen,
  onClose,
  chapterName,
  subject,
}) => {
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(
    `Explain the fundamental principle and key formula behind ${chapterName} in ${subject}.`
  );
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<any[]>([
    {
      sender: 'examiner',
      text: `Welcome to your Board Viva Voce Oral Examination for Chapter: "${chapterName}". I am your AI Examiner. Here is your first question:\n\nExplain the fundamental principle and key formula behind ${chapterName} in ${subject}.`,
    },
  ]);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [scoreCount, setScoreCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuestionNumber(1);
      setStudentAnswer('');
      setIsTestComplete(false);
      setTotalScore(0);
      setScoreCount(0);
      setCurrentQuestion(`Explain the fundamental principle and key formula behind ${chapterName} in ${subject}.`);
      setConversation([
        {
          sender: 'examiner',
          text: `Welcome to your Board Viva Voce Oral Examination for Chapter: "${chapterName}". I am your AI Examiner. Here is your first question:\n\nExplain the fundamental principle and key formula behind ${chapterName} in ${subject}.`,
        },
      ]);
    }
  }, [isOpen, chapterName, subject]);

  if (!isOpen) return null;

  const handleSubmitAnswer = async () => {
    if (!studentAnswer.trim()) return;

    const userAns = studentAnswer.trim();
    const qNum = questionNumber;

    setConversation((prev) => [...prev, { sender: 'student', text: userAns }]);
    setStudentAnswer('');
    setIsLoading(true);

    try {
      const res = await conductVivaVoiceTurnApi({
        chapterName,
        subject,
        studentAnswer: userAns,
        questionNumber: qNum,
      });

      setTotalScore((prev) => prev + res.evalScore);
      setScoreCount((prev) => prev + 1);

      const examinerFeedback = `**Evaluation Score: ${res.evalScore}/10**\n\n**Examiner Feedback:** ${res.feedback}\n\n**Model Answer:** ${res.modelAnswer}`;

      if (res.isComplete || qNum >= 3) {
        setIsTestComplete(true);
        setConversation((prev) => [
          ...prev,
          { sender: 'examiner', text: examinerFeedback },
          {
            sender: 'examiner',
            text: `🎉 **Viva Voce Examination Concluded!** You successfully answered all questions. Great job preparing for your board examinations!`,
          },
        ]);
      } else {
        setQuestionNumber(qNum + 1);
        setCurrentQuestion(res.nextQuestion);
        setConversation((prev) => [
          ...prev,
          { sender: 'examiner', text: examinerFeedback },
          { sender: 'examiner', text: `**Question ${qNum + 1}:** ${res.nextQuestion}` },
        ]);
      }
    } catch (error: any) {
      setConversation((prev) => [
        ...prev,
        { sender: 'examiner', text: `Error evaluating answer: ${error.message}. Please continue with the next question!` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const finalAverageScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : '8.5';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">
                  AI Board Examiner • Viva Voce
                </span>
                <span className="text-[10px] text-slate-400">Question {questionNumber} / 3</span>
              </div>
              <h2 className="font-black text-base sm:text-lg">{chapterName} ({subject})</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {conversation.map((turn, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${turn.sender === 'student' ? 'justify-end' : 'justify-start'}`}
            >
              {turn.sender === 'examiner' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 space-y-2 text-xs sm:text-sm leading-relaxed ${
                  turn.sender === 'student'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                }`}
              >
                <p className="whitespace-pre-line">{turn.text}</p>
              </div>

              {turn.sender === 'student' && (
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Examiner is reviewing your explanation & scoring...</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          {isTestComplete ? (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-emerald-600" />
                <div>
                  <h4 className="font-extrabold text-emerald-900 text-sm">Viva Voce Successfully Completed!</h4>
                  <p className="text-xs text-emerald-700">Average Examiner Score: <strong>{finalAverageScore} / 10</strong></p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm"
              >
                Close & Save Mastery
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitAnswer();
              }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                placeholder="Type your verbal explanation or answer here..."
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-50"
              />
              <button
                type="submit"
                disabled={isLoading || !studentAnswer.trim()}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer flex items-center gap-2 shrink-0"
              >
                <span>Answer Examiner</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
