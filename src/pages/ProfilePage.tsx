import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClassLevel, SubjectId } from '../types';
import {
  User,
  Settings,
  Crown,
  Shield,
  LogOut,
  Save,
  Clock,
  BookOpen,
  Calendar,
  Check,
  Zap,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, setIsUpgradeModalOpen, logout, loginWithGoogle, isProfileLoading } = useApp();

  const [name, setName] = useState(user.name);
  const [classLevel, setClassLevel] = useState<ClassLevel>(user.classLevel);
  const [board, setBoard] = useState(user.board);
  const [dailyMinutes, setDailyMinutes] = useState(user.dailyStudyMinutes);
  const [examDate, setExamDate] = useState(user.examDate || '2026-03-15');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      classLevel,
      board,
      dailyStudyMinutes: dailyMinutes,
      examDate,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div id="profile-page" className="space-y-6 pb-20 md:pb-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
                {user.name.charAt(0)}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.name}</h1>
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Class {user.classLevel}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 px-3 py-2 rounded-2xl text-indigo-900">
            <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />
            <div>
              <p className="text-[10px] font-extrabold uppercase text-indigo-600">Level {user.level || 1}</p>
              <p className="text-xs sm:text-sm font-black">
                {isProfileLoading ? (
                  <span className="animate-pulse text-indigo-400">Loading XP...</span>
                ) : (
                  `${user.totalXP ?? 0} XP`
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsUpgradeModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>Manage Plan ({user.subscriptionPlan.toUpperCase()})</span>
          </button>
        </div>
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <Settings className="w-5 h-5 text-indigo-600" />
          <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">Academic Preferences</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Student Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Class Standard</label>
            <select
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value as ClassLevel)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 cursor-pointer"
            >
              {['6', '7', '8', '9', '10', '11', '12'].map((c) => (
                <option key={c} value={c}>Class {c}th</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Board of Education</label>
            <select
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 cursor-pointer"
            >
              <option value="CBSE">CBSE (NCERT Syllabus)</option>
              <option value="ICSE">ICSE Board</option>
              <option value="State Board">State Board</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Daily Study Target</label>
            <select
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 cursor-pointer"
            >
              <option value={30}>30 Minutes / day</option>
              <option value={60}>1 Hour / day</option>
              <option value={120}>2 Hours / day (Recommended)</option>
              <option value={180}>3 Hours / day (Exam Sprint)</option>
              <option value={240}>4+ Hours / day</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Target Exam Date</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Changes saved successfully!
            </span>
          ) : (
            <span className="text-xs text-slate-400">Settings update immediately</span>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Account Switcher / Sign in */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Google Account Connection</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {user.email ? `Connected as ${user.email}` : 'Sync study data and XP across devices'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!user.email && (
            <button
              type="button"
              onClick={loginWithGoogle}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4 text-indigo-600" />
              <span>Connect Google Account</span>
            </button>
          )}

          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Reset / Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
