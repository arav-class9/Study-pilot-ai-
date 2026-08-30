import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Users,
  BookOpen,
  CheckCircle2,
  BarChart3,
  Calendar,
  Send,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TeacherClass, TeacherAssignment } from '../types';

export const TeacherDashboardPage: React.FC = () => {
  const { user } = useApp();

  const [classes, setClasses] = useState<TeacherClass[]>([
    {
      id: 'class-10a',
      teacherUid: user.uid,
      name: 'Class 10-A Science Batch',
      subject: 'science',
      classLevel: '9',
      board: 'CBSE',
      inviteCode: 'SCI-10A-992',
      studentCount: 38,
      createdAt: '2026-08-01',
    },
    {
      id: 'class-9b',
      teacherUid: user.uid,
      name: 'Class 9-B Mathematics',
      subject: 'math',
      classLevel: '9',
      board: 'CBSE',
      inviteCode: 'MATH-9B-412',
      studentCount: 34,
      createdAt: '2026-08-05',
    },
  ]);

  const [assignments, setAssignments] = useState<TeacherAssignment[]>([
    {
      id: 'asg-1',
      classId: 'class-10a',
      title: 'Light — Mirror Formula Numerical Drill',
      type: 'homework',
      subject: 'science',
      chapterName: 'Light — Reflection and Refraction',
      dueDate: '2026-08-28',
      questionCount: 5,
      assignedAt: '2026-08-22',
      submissionsCount: 29,
    },
    {
      id: 'asg-2',
      classId: 'class-10a',
      title: 'Electricity Series & Parallel Test',
      type: 'quiz',
      subject: 'science',
      chapterName: 'Electricity',
      dueDate: '2026-08-30',
      questionCount: 10,
      assignedAt: '2026-08-21',
      submissionsCount: 35,
    },
  ]);

  const [newClassName, setNewClassName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newClass: TeacherClass = {
      id: `class-${Date.now()}`,
      teacherUid: user.uid,
      name: newClassName,
      subject: 'science',
      classLevel: '9',
      board: 'CBSE',
      inviteCode: `CODE-${Math.floor(100 + Math.random() * 900)}`,
      studentCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setClasses([...classes, newClass]);
    setNewClassName('');
    setShowCreateModal(false);
  };

  return (
    <div id="teacher-dashboard-page" className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Teacher Academic Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Classroom Management & Assignments 👩‍🏫
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Create student cohorts, assign NCERT-aligned practice quizzes, and inspect classroom weak topic heatmaps.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-sm cursor-pointer transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Cohort</span>
          </button>
        </div>
      </div>

      {/* Cohorts Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Your Active Batches ({classes.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{c.name}</h4>
                  <p className="text-xs text-slate-500">
                    Class {c.classLevel} ({c.board}) • {c.subject.toUpperCase()}
                  </p>
                </div>
                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl">
                  {c.studentCount} Students
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-500">Student Invite Code:</span>
                <code className="font-mono font-bold text-indigo-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  {c.inviteCode}
                </code>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl cursor-pointer">
                  Assign Quiz
                </button>
                <button className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">
                  Class Analytics
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Assignments */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Classroom Assignments</h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">Live syllabus tracking</span>
        </div>

        <div className="divide-y divide-slate-100">
          {assignments.map((asg) => (
            <div key={asg.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">{asg.title}</h4>
                <p className="text-xs text-slate-500">
                  {asg.chapterName} • Due {asg.dueDate} • {asg.questionCount} Questions
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    {asg.submissionsCount} Submitted
                  </span>
                </div>
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                  View Results
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for creating class */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="font-bold text-slate-900 text-base">Create Student Cohort</h3>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Batch / Cohort Name
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Class 10-A Science Board Batch"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
                >
                  Create Cohort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
