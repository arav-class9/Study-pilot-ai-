import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomTimetable, TimetableSession } from '../../types';
import { Edit2, Play, CheckCircle2, XCircle, Trash2, Clock, Check, Coffee, MoreVertical, SkipForward, ArrowRight } from 'lucide-react';
import { TimetableGeneratorModal } from './TimetableGeneratorModal';

export const TimetableDashboard: React.FC = () => {
  const { customTimetable, setCustomTimetable, saveCustomTimetable } = useApp();
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [generatorMode, setGeneratorMode] = useState<'manual' | 'ai'>('manual');

  const deleteTimetable = () => {
    if (confirm('Are you sure you want to delete this timetable?')) {
      setCustomTimetable(null);
      localStorage.removeItem('studypilot_custom_timetable');
    }
  };

  const updateSessionStatus = (id: string, status: 'completed' | 'partial' | 'skipped') => {
    if (!customTimetable) return;
    const updated = {
      ...customTimetable,
      sessions: customTimetable.sessions.map(s => s.id === id ? { ...s, status } : s)
    };
    saveCustomTimetable(updated);
  };

  const removeSession = (id: string) => {
    if (!customTimetable) return;
    const updated = {
      ...customTimetable,
      sessions: customTimetable.sessions.filter(s => s.id !== id)
    };
    saveCustomTimetable(updated);
  };

  if (!customTimetable) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col gap-5 items-start">
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-300 rounded-2xl flex items-center justify-center border border-indigo-400/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">What do you want to study today?</h2>
            <p className="text-slate-300 text-sm">Choose how you want to build your study schedule for maximum board exam success.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
            <button
              onClick={() => { setGeneratorMode('manual'); setIsGeneratorOpen(true); }}
              className="h-14 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Clock className="w-5 h-5" />
              MAKE OWN TIMETABLE
            </button>
            <button
              onClick={() => { setGeneratorMode('ai'); setIsGeneratorOpen(true); }}
              className="h-14 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              ✨ AI GENERATOR TIMETABLE
            </button>
          </div>
        </div>
        <TimetableGeneratorModal isOpen={isGeneratorOpen} onClose={() => setIsGeneratorOpen(false)} mode={generatorMode} />
      </div>
    );
  }

  // Find next pending session
  const now = new Date();
  const currentStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const pendingSession = customTimetable.sessions.find(s => s.status === 'pending');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Today's Timetable</h2>
          <p className="text-sm font-medium text-slate-500">{customTimetable.startTime} - {customTimetable.endTime}</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button onClick={() => { setGeneratorMode('manual'); setIsGeneratorOpen(true); }} className="h-11 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors border border-indigo-200 cursor-pointer">
            Make Own Timetable
          </button>
          <button onClick={() => { setGeneratorMode('ai'); setIsGeneratorOpen(true); }} className="h-11 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl transition-colors border border-purple-200 cursor-pointer">
            AI Generator Timetable
          </button>
          <button onClick={deleteTimetable} className="h-11 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors border border-rose-200 cursor-pointer">
            Clear
          </button>
        </div>
      </div>
      <TimetableGeneratorModal isOpen={isGeneratorOpen} onClose={() => setIsGeneratorOpen(false)} mode={generatorMode} />

      {pendingSession && pendingSession.type === 'study' && (
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 w-full">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Current / Next Session</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{pendingSession.startTime}</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="text-2xl font-bold">{pendingSession.endTime}</span>
            </div>
            <h3 className="text-lg font-bold truncate mt-1">{pendingSession.topicName}</h3>
            <p className="text-sm text-slate-400">{pendingSession.subjectName} • {pendingSession.durationMinutes} mins</p>
          </div>
          <button className="w-full sm:w-auto h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 shrink-0">
            <Play className="w-5 h-5 fill-white" />
            START SESSION
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 relative">
        <div className="absolute left-[39px] sm:left-[55px] top-6 bottom-6 w-0.5 bg-slate-100 z-0"></div>
        <div className="flex flex-col gap-2 relative z-10">
          {customTimetable.sessions.map((session) => {
            const isBreak = session.type === 'break';
            const isCompleted = session.status === 'completed';
            const isSkipped = session.status === 'skipped';
            const isPartial = session.status === 'partial';

            return (
              <div key={session.id} className={`flex gap-3 sm:gap-4 p-2 sm:p-3 rounded-2xl transition-colors ${isCompleted ? 'opacity-60' : 'hover:bg-slate-50'}`}>
                <div className="w-16 sm:w-20 pt-2 shrink-0 text-right">
                  <span className="text-xs sm:text-sm font-bold text-slate-700">{session.startTime}</span>
                </div>
                
                <div className="relative shrink-0 flex justify-center w-6">
                  <div className={`w-6 h-6 rounded-full border-[3px] border-white flex items-center justify-center mt-1.5 shadow-sm ${
                    isCompleted ? 'bg-emerald-500 text-white' : 
                    isSkipped ? 'bg-slate-300 text-white' :
                    isBreak ? 'bg-amber-400 text-white' : 'bg-indigo-500 text-white'
                  }`}>
                    {isCompleted ? <Check className="w-3 h-3" /> : 
                     isBreak ? <Coffee className="w-3 h-3" /> : 
                     <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                </div>

                <div className={`flex-1 rounded-2xl border p-4 sm:p-5 flex flex-col gap-3 shadow-sm ${
                  isBreak ? 'bg-amber-50/50 border-amber-100' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      {isBreak ? (
                        <h4 className="text-sm font-bold text-slate-800">Break Time</h4>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{session.subjectName || session.subjectId}</span>
                            {session.priority === 'high' && <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">HIGH PRIORITY</span>}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">{session.topicName}</h4>
                          {session.chapterName && <p className="text-xs text-slate-500 mt-0.5">{session.chapterName}</p>}
                        </>
                      )}
                      <p className="text-xs font-semibold text-slate-500 mt-2">{session.durationMinutes} minutes</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 mt-2 sm:mt-0">
                      {session.status === 'pending' && !isBreak && (
                        <>
                          <button onClick={() => updateSessionStatus(session.id, 'completed')} className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl border border-slate-200 transition-colors" title="Mark Complete">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => updateSessionStatus(session.id, 'partial')} className="p-2 bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-xl border border-slate-200 transition-colors" title="Partially Complete">
                            <Clock className="w-4 h-4" />
                          </button>
                          <button onClick={() => updateSessionStatus(session.id, 'skipped')} className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200 transition-colors" title="Skip">
                            <SkipForward className="w-4 h-4" />
                          </button>
                          <button onClick={() => removeSession(session.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {session.status !== 'pending' && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          isCompleted ? 'bg-emerald-100 text-emerald-700' :
                          isPartial ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {session.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <TimetableGeneratorModal isOpen={isGeneratorOpen} onClose={() => setIsGeneratorOpen(false)} />
    </div>
  );
};
