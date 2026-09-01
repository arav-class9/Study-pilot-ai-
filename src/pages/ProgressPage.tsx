import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUBJECTS_META } from '../data/curriculum';
import { CurriculumSubject } from '../types';
import {
  BarChart3,
  Flame,
  Zap,
  Trophy,
  Award,
  CheckCircle2,
  TrendingUp,
  Target,
  Clock,
  BookOpen,
  Users,
  UserPlus,
  Share2,
  Copy,
  Check,
  Trash2,
  Shield,
  Star,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const ProgressPage: React.FC = () => {
  const { user, topicProgressList, quizAttempts, achievements, isProfileLoading, studyGroupMembers, inviteStudyPartner, removeStudyPartner } = useApp();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const subjectsList: CurriculumSubject[] = Object.values(SUBJECTS_META);

  // Subject Mastery calculation
  const subjectStats = subjectsList.map((sub) => {
    const topics = topicProgressList.filter((t) => t.subjectId === sub.id);
    const totalAttempts = topics.reduce((acc, curr) => acc + curr.attempts, 0);
    const totalCorrect = topics.reduce((acc, curr) => acc + curr.correct, 0);
    const avgAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    const avgMastery = topics.length > 0 ? Math.round(topics.reduce((a, b) => a + b.masteryScore, 0) / topics.length) : 0;

    return {
      id: sub.id,
      name: sub.name,
      topicsCount: topics.length,
      avgAccuracy,
      avgMastery,
      totalAttempts,
    };
  });

  const totalQuestionsSolved = topicProgressList.reduce((acc, t) => acc + t.attempts, 0);
  const totalMasteredTopics = topicProgressList.filter((t) => t.status === 'mastered' || t.status === 'strong').length;

  // Quiz performance chart data
  const quizChartData = quizAttempts.slice(-10).map((attempt, idx) => {
    const dateStr = attempt.completedAt || attempt.createdAt || new Date().toISOString();
    const formattedDate = new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
    return {
      name: `Quiz #${idx + 1} (${formattedDate})`,
      accuracy: attempt.accuracy || Math.round((attempt.score / (attempt.totalQuestions || 1)) * 100),
      subject: attempt.subjectId || 'General',
      timeMinutes: Math.round((attempt.timeTakenSeconds || 60) / 60),
    };
  });

  const defaultQuizData = [
    { name: 'Quiz 1 (Aug 24)', accuracy: 65, subject: 'Science', timeMinutes: 12 },
    { name: 'Quiz 2 (Aug 25)', accuracy: 78, subject: 'Math', timeMinutes: 15 },
    { name: 'Quiz 3 (Aug 27)', accuracy: 82, subject: 'History', timeMinutes: 10 },
    { name: 'Quiz 4 (Aug 29)', accuracy: 90, subject: 'Science', timeMinutes: 18 },
    { name: 'Quiz 5 (Today)', accuracy: 95, subject: 'Math', timeMinutes: 14 },
  ];
  const activeQuizData = quizChartData.length > 0 ? quizChartData : defaultQuizData;

  // Study time trends data
  const studyTimeData = [
    { day: 'Mon', studyMinutes: 45, drillsSolved: 12 },
    { day: 'Tue', studyMinutes: 60, drillsSolved: 18 },
    { day: 'Wed', studyMinutes: 30, drillsSolved: 8 },
    { day: 'Thu', studyMinutes: 75, drillsSolved: 24 },
    { day: 'Fri', studyMinutes: 90, drillsSolved: 30 },
    { day: 'Sat', studyMinutes: 120, drillsSolved: 40 },
    { day: 'Sun', studyMinutes: 65, drillsSolved: 15 },
  ];

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteStudyPartner(inviteEmail.trim(), inviteName.trim() || undefined);
    setInviteEmail('');
    setInviteName('');
    setShowInviteModal(false);
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(`https://studypilot.ai/invite?group=cbse-${user.classLevel}&ref=${user.uid}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div id="progress-page" className="space-y-6 pb-20 md:pb-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Academic Progress & Study Groups</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Real-time telemetry of your CBSE concept retention, practice tests, and study group comparisons.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-2xl">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            <div>
              <p className="text-[10px] font-extrabold uppercase text-amber-700">Streak</p>
              <p className="text-sm font-black text-amber-900">{user.streak} Days</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3.5 py-2 rounded-2xl">
            <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />
            <div>
              <p className="text-[10px] font-extrabold uppercase text-indigo-700">Level {user.level || 1}</p>
              <p className="text-sm font-black text-indigo-900">{isProfileLoading ? 'Loading XP...' : `${user.totalXP ?? 0} XP`}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Performance Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Drills Solved</p>
          <p className="text-2xl font-black text-slate-900">{totalQuestionsSolved}</p>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Concept practice telemetry
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Mastered Concepts</p>
          <p className="text-2xl font-black text-slate-900">{totalMasteredTopics} / {topicProgressList.length}</p>
          <p className="text-[11px] text-indigo-600 font-bold">Over 75% accuracy threshold</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Quizzes Taken</p>
          <p className="text-2xl font-black text-slate-900">{quizAttempts.length}</p>
          <p className="text-[11px] text-slate-500">Adaptive AI evaluations</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Study Streak</p>
          <p className="text-2xl font-black text-amber-600">{user.streak} Days</p>
          <p className="text-[11px] text-amber-700 font-bold">
            {user.streak > 0 ? `${user.streak} consecutive days active` : 'Study today to start your streak'}
          </p>
        </div>
      </div>

      {/* Study Group & Peer Comparison Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">Study Group & Partner Comparison</h2>
              <p className="text-xs text-slate-500">Link accounts, share study plans, and compare streaks & stats with classmates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyInviteLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Study Partner</span>
            </button>
          </div>
        </div>

        {/* Members Grid / Comparison Table */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current User Card (You) */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  You (Main Account)
                </span>
                <span className="text-xs font-bold text-amber-400">Level {user.level || 1}</span>
              </div>
              <h3 className="font-extrabold text-base">{user.name || 'Student Pilot'}</h3>
              <p className="text-[11px] text-slate-300">{user.email || 'CBSE Class ' + user.classLevel}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60 text-center">
              <div className="bg-white/5 p-2 rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase font-bold">XP</p>
                <p className="text-xs font-black text-amber-400">{user.totalXP ?? 0}</p>
              </div>
              <div className="bg-white/5 p-2 rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Streak</p>
                <p className="text-xs font-black text-emerald-400">{user.streak}d</p>
              </div>
              <div className="bg-white/5 p-2 rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Quizzes</p>
                <p className="text-xs font-black text-indigo-300">{quizAttempts.length}</p>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-xl flex items-center justify-between">
              <span>Shared Plan:</span>
              <strong className="text-white truncate max-w-[150px]">CBSE Class {user.classLevel} Master Plan</strong>
            </div>
          </div>

          {/* Study Group Partners */}
          {studyGroupMembers.map((partner) => (
            <div key={partner.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-4 relative group">
              <button
                onClick={() => removeStudyPartner(partner.id)}
                className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Remove study partner"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Study Partner
                  </span>
                  <span className="text-xs font-bold text-slate-500">Joined {new Date(partner.joinedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">{partner.name}</h3>
                <p className="text-[11px] text-slate-500">{partner.email}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
                <div className="bg-white p-2 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">XP</p>
                  <p className="text-xs font-black text-amber-600">{partner.totalXP}</p>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Streak</p>
                  <p className="text-xs font-black text-emerald-600">{partner.streak}d</p>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Accuracy</p>
                  <p className="text-xs font-black text-indigo-600">{partner.avgAccuracy}%</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                <span>Shared Plan:</span>
                <strong className="text-slate-800 truncate max-w-[150px]">{partner.sharedPlanTitle || 'Standard Plan'}</strong>
              </div>
            </div>
          ))}

          {studyGroupMembers.length === 0 && (
            <div className="col-span-2 bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
              <Users className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
              <h4 className="font-bold text-slate-800 text-sm">No Study Partners Linked Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Invite classmates by email or share your study group link to sync study schedules and compare weekly telemetry.
              </p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> Invite First Partner
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 text-base">Invite Study Partner</h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Partner Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Singh"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Partner Email / ID *</label>
                <input
                  type="email"
                  required
                  placeholder="priya@studypilot.ai"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Once linked, your study partner will appear in your Study Group dashboard where you can compare daily streaks, XP rankings, quiz accuracy, and shared study calendars.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  Send Invite & Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Performance Over Time (Area Chart) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">Quiz Performance Over Time</h2>
              <p className="text-xs text-slate-500">Tracking accuracy percentage across recent adaptive quizzes</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeQuizData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [`${value}% Accuracy`, 'Score']}
                />
                <Area type="monotone" dataKey="accuracy" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAccuracy)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study Time Trends (Bar Chart) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">Weekly Study Time Trends</h2>
              <p className="text-xs text-slate-500">Daily focus duration (minutes) and drills solved</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" unit="m" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                  formatter={(value: any, name: any) => [
                    name === 'studyMinutes' ? `${value} mins` : value,
                    name === 'studyMinutes' ? 'Study Time' : 'Drills Solved'
                  ]}
                />
                <Bar dataKey="studyMinutes" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject Mastery Spectrum */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">Subject-Wise Mastery Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjectStats.map((sub) => (
            <div key={sub.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-base">{sub.name}</h3>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {sub.avgMastery}% Mastery
                </span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${sub.avgMastery}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-500 pt-1">
                <span>Accuracy: <strong className="text-slate-800">{sub.avgAccuracy}%</strong></span>
                <span>Questions: <strong className="text-slate-800">{sub.totalAttempts}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements & Badges Showcase */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">Achievements & Badges Gallery</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                ach.unlocked
                  ? 'bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-amber-200 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{ach.icon}</span>
                  {ach.unlocked ? (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase text-slate-400">Locked</span>
                  )}
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">{ach.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{ach.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Reward:</span>
                <strong className="text-indigo-600">+{ach.xpReward} XP</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
