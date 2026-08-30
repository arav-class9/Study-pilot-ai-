import React, { useState, useEffect } from 'react';

import { X, Clock, Target, Calendar, Plus, Trash2, ArrowRight, Sparkles, AlertTriangle, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getCurriculumSubjects, getCurriculumChapters } from '../../data/curriculumDatabase';
import { CustomTimetable, TimetableSession, SubjectId } from '../../types';

interface SelectedTopic {
  id: string;
  subjectId: SubjectId;
  subjectName: string;
  chapterName: string;
  topicName: string;
  priority: 'high' | 'normal' | 'low';
}

export const TimetableGeneratorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { user, saveCustomTimetable } = useApp();
  
  // Selection
  const [selectedTopics, setSelectedTopics] = useState<SelectedTopic[]>([]);
  
  // Current Selectors
  const [currSubject, setCurrSubject] = useState<SubjectId | ''>('');
  const [currChapter, setCurrChapter] = useState<string>('');
  const [currTopic, setCurrTopic] = useState<string>('');
  
  // Time Settings
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('21:00');
  const [studyDurationType, setStudyDurationType] = useState<'full' | 'custom'>('full');
  const [customDurationMins, setCustomDurationMins] = useState<number>(120);
  
  // Break Settings
  const [breakDuration, setBreakDuration] = useState<number>(10); // 0 means no breaks
  const [breakInterval, setBreakInterval] = useState<number>(50);

  // Computed available time
  const [availableMins, setAvailableMins] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Curriculum Data
  const subjects = getCurriculumSubjects(user.classLevel, user.board);
  const chapters = currSubject ? getCurriculumChapters(user.classLevel, user.board, currSubject as SubjectId) : [];
  const topics = currChapter ? chapters.find(c => c.id === currChapter)?.topics || [] : [];

  useEffect(() => {
    // Calculate total available time
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    let diff = (end.getTime() - start.getTime()) / 60000;
    if (diff < 0) diff += 24 * 60; // overnight
    setAvailableMins(diff);
  }, [startTime, endTime]);

  if (!isOpen) return null;

  const handleAddTopic = () => {
    if (!currSubject || !currChapter || !currTopic) return;
    const sub = subjects.find(s => s.id === currSubject);
    const chap = chapters.find(c => c.id === currChapter);
    const top = topics.find(t => t.id === currTopic);
    
    if (sub && chap && top) {
      // prevent duplicates
      if (selectedTopics.find(t => t.topicName === top.name)) {
        setErrorMsg('Topic already added.');
        return;
      }
      setSelectedTopics([...selectedTopics, {
        id: Math.random().toString(36).substring(7),
        subjectId: sub.id as SubjectId,
        subjectName: sub.name,
        chapterName: chap.name,
        topicName: top.name,
        priority: 'normal'
      }]);
      setCurrTopic('');
      setErrorMsg('');
    }
  };

  const removeTopic = (id: string) => {
    setSelectedTopics(selectedTopics.filter(t => t.id !== id));
  };

  const updatePriority = (id: string, priority: 'high' | 'normal' | 'low') => {
    setSelectedTopics(selectedTopics.map(t => t.id === id ? { ...t, priority } : t));
  };

  const generateTimetable = () => {
    if (selectedTopics.length === 0) {
      setErrorMsg('Please select at least one topic to study.');
      return;
    }

    let actualStudyMins = studyDurationType === 'full' ? availableMins : customDurationMins;
    if (actualStudyMins > availableMins) actualStudyMins = availableMins;
    
    // Priority weights: high = 3, normal = 2, low = 1
    const totalWeight = selectedTopics.reduce((acc, t) => acc + (t.priority === 'high' ? 3 : t.priority === 'normal' ? 2 : 1), 0);
    
    let currentStart = new Date(`2000-01-01T${startTime}:00`);
    const finalEnd = new Date(`2000-01-01T${endTime}:00`);
    if (finalEnd.getTime() < currentStart.getTime()) finalEnd.setDate(finalEnd.getDate() + 1);

    const sessions: TimetableSession[] = [];
    let remainingStudyMins = actualStudyMins;
    let timeSinceLastBreak = 0;

    for (let i = 0; i < selectedTopics.length; i++) {
      const topic = selectedTopics[i];
      const weight = topic.priority === 'high' ? 3 : topic.priority === 'normal' ? 2 : 1;
      
      // Calculate how many minutes this topic gets
      // We also need to leave time for breaks, but actualStudyMins is the *pure study* time requested.
      // Or is it? If actualStudyMins is the block size, breaks eat into it.
      // Let's assume actualStudyMins is the pure study time.
      // Wait, if studyDurationType is 'full', actualStudyMins = availableMins, meaning breaks MUST eat into it.
      let allocatedPureStudy = Math.floor((weight / totalWeight) * (studyDurationType === 'full' ? actualStudyMins * 0.85 : actualStudyMins)); // rough 15% reduction for breaks if full
      if (allocatedPureStudy < 10) allocatedPureStudy = 10; // minimum 10 mins

      // We break this allocated study down into chunks if it exceeds breakInterval
      let topicRemaining = allocatedPureStudy;
      while (topicRemaining > 0) {
        if (currentStart.getTime() >= finalEnd.getTime()) break; // out of time

        let chunk = Math.min(topicRemaining, breakInterval - timeSinceLastBreak);
        if (chunk <= 0 && breakDuration > 0) {
          // insert break
          const breakEnd = new Date(currentStart.getTime() + breakDuration * 60000);
          if (breakEnd.getTime() <= finalEnd.getTime()) {
            sessions.push({
              id: Math.random().toString(36).substring(7),
              type: 'break',
              startTime: currentStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
              endTime: breakEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
              durationMinutes: breakDuration,
              status: 'pending'
            });
            currentStart = breakEnd;
            timeSinceLastBreak = 0;
            chunk = Math.min(topicRemaining, breakInterval);
          } else {
             break; // no time for break
          }
        }

        if (currentStart.getTime() >= finalEnd.getTime()) break;

        // Ensure chunk doesn't push past finalEnd
        const maxPossible = (finalEnd.getTime() - currentStart.getTime()) / 60000;
        chunk = Math.min(chunk, maxPossible);
        if (chunk <= 0) break;

        const sessionEnd = new Date(currentStart.getTime() + chunk * 60000);
        sessions.push({
          id: Math.random().toString(36).substring(7),
          type: 'study',
          subjectId: topic.subjectId,
          chapterName: topic.chapterName,
          topicName: topic.topicName,
          priority: topic.priority,
          startTime: currentStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          endTime: sessionEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          durationMinutes: Math.round(chunk),
          status: 'pending'
        });

        currentStart = sessionEnd;
        topicRemaining -= chunk;
        timeSinceLastBreak += chunk;
      }
    }

    const timetable: CustomTimetable = {
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString().split('T')[0],
      startTime,
      endTime,
      sessions,
      createdAt: new Date().toISOString()
    };

    saveCustomTimetable(timetable);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div
        
        
        className="bg-white w-full max-w-2xl sm:rounded-3xl shadow-xl min-h-screen sm:min-h-0 flex flex-col"
      >
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white sm:rounded-t-3xl">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold">Create My Timetable</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-8">
          
          {/* STEP 1: Topics */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">1. What do you want to study?</h3>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select value={currSubject} onChange={e => { setCurrSubject(e.target.value as SubjectId); setCurrChapter(''); setCurrTopic(''); }} className="h-11 px-3 rounded-xl border border-slate-200 text-sm">
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select value={currChapter} onChange={e => { setCurrChapter(e.target.value); setCurrTopic(''); }} className="h-11 px-3 rounded-xl border border-slate-200 text-sm" disabled={!currSubject}>
                  <option value="">Select Chapter</option>
                  {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={currTopic} onChange={e => setCurrTopic(e.target.value)} className="h-11 px-3 rounded-xl border border-slate-200 text-sm" disabled={!currChapter}>
                  <option value="">Select Topic</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <button onClick={handleAddTopic} disabled={!currTopic} className="h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Plus className="w-4 h-4" /> Add Topic
              </button>
            </div>

            {selectedTopics.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                {selectedTopics.map((topic, i) => (
                  <div key={topic.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-500 uppercase">{topic.subjectName}</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{topic.topicName}</p>
                    </div>
                    <select
                      value={topic.priority}
                      onChange={(e) => updatePriority(topic.id, e.target.value as any)}
                      className="h-9 px-2 text-xs border border-slate-200 rounded-lg bg-slate-50"
                    >
                      <option value="high">🔥 High</option>
                      <option value="normal">⭐ Normal</option>
                      <option value="low">🟢 Low</option>
                    </select>
                    <button onClick={() => removeTopic(topic.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STEP 2: Time */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">2. Available Time</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Start Time</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="h-12 px-4 rounded-xl border border-slate-200 font-bold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">End Time</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="h-12 px-4 rounded-xl border border-slate-200 font-bold" />
              </div>
            </div>
            <p className="text-xs font-semibold text-indigo-600 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
              Total Available Time: {Math.floor(availableMins / 60)}h {availableMins % 60}m
            </p>
          </div>

          {/* STEP 3 & 4: Settings */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">3. Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-700">Study Duration</label>
                <select value={studyDurationType} onChange={e => setStudyDurationType(e.target.value as any)} className="h-11 px-3 border border-slate-200 rounded-xl text-sm">
                  <option value="full">Use full available time</option>
                  <option value="custom">Custom duration</option>
                </select>
                {studyDurationType === 'custom' && (
                  <input type="number" min="10" placeholder="Mins" value={customDurationMins} onChange={e => setCustomDurationMins(parseInt(e.target.value))} className="h-11 px-3 border border-slate-200 rounded-xl text-sm" />
                )}
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-700">Break Settings</label>
                <div className="flex gap-2 items-center">
                  <select value={breakDuration} onChange={e => setBreakDuration(parseInt(e.target.value))} className="flex-1 h-11 px-2 border border-slate-200 rounded-xl text-xs">
                    <option value={0}>No breaks</option>
                    <option value={5}>5m break</option>
                    <option value={10}>10m break</option>
                    <option value={15}>15m break</option>
                  </select>
                  <span className="text-xs font-semibold text-slate-500">after</span>
                  <select value={breakInterval} onChange={e => setBreakInterval(parseInt(e.target.value))} className="flex-1 h-11 px-2 border border-slate-200 rounded-xl text-xs" disabled={breakDuration === 0}>
                    <option value={25}>25m</option>
                    <option value={45}>45m</option>
                    <option value={60}>60m</option>
                    <option value={90}>90m</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex gap-2 text-rose-700 text-sm font-semibold">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

        </div>

        <div className="p-4 sm:p-6 border-t border-slate-100 bg-white sm:rounded-b-3xl">
          <button
            onClick={generateTimetable}
            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>GENERATE MY TIMETABLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
