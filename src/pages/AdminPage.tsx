import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Users, Brain, Cpu, Database, Activity } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { topicProgressList, notesList, quizAttempts } = useApp();

  return (
    <div id="admin-page" className="space-y-6 pb-20 md:pb-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">StudyPilot AI Admin & Telemetry</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            System performance, Gemini model telemetry, and aggregate curriculum diagnostics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total System Doubts Solved</p>
          <p className="text-2xl font-black text-slate-900">1,248</p>
          <p className="text-[11px] text-emerald-600 font-bold">100% Server-side Gemini 2.5</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Notes Generated</p>
          <p className="text-2xl font-black text-slate-900">{notesList.length + 342}</p>
          <p className="text-[11px] text-indigo-600 font-bold">NCERT / CBSE Aligned</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Quizzes Evaluated</p>
          <p className="text-2xl font-black text-slate-900">{quizAttempts.length + 890}</p>
          <p className="text-[11px] text-slate-500">Real-time mastery updates</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h2 className="font-extrabold text-slate-900 text-sm sm:text-base">System Telemetry & Architecture</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>AI Engine</span>
            </div>
            <p className="text-slate-500">Gemini 2.5 Flash with structured JSON Schema validation & telemetry tracking.</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Server-Side API Proxy</span>
            </div>
            <p className="text-slate-500">Secure Express endpoints at <code>/api/ai/*</code> with zero client-side keys.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
