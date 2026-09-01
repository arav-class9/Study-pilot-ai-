import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Sparkles, CheckCircle2, Award, Calendar, Zap, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const StreakTrackerWidget: React.FC = () => {
  const { user, updateProfile, addXP } = useApp();
  const [checkedInToday, setCheckedInToday] = useState<boolean>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return user.lastActiveDate === todayStr && (user.streak > 0);
  });
  const [isAnimating, setIsAnimating] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Generate last 7 days for the visual tracker
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      
      // Check if this date falls within the current active streak window
      const isToday = dateString === todayStr;
      const isActive = isToday
        ? checkedInToday || user.lastActiveDate === todayStr
        : i < (user.streak || 1); // approximate past streak days

      days.push({ dayName, dayNum, dateString, isToday, isActive });
    }
    return days;
  };

  const weekDays = getLast7Days();

  const handleDailyCheckIn = () => {
    if (checkedInToday) return;

    setIsAnimating(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const newStreak = (user.streak || 0) + 1;
    const newLongest = Math.max(newStreak, user.longestStreak || newStreak);
    
    updateProfile({
      streak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: todayStr,
    });

    addXP(25, 'Daily Streak Check-In 🌟');
    setCheckedInToday(true);

    setTimeout(() => setIsAnimating(false), 1000);
  };

  const nextMilestone = user.streak < 7 ? 7 : user.streak < 14 ? 14 : user.streak < 30 ? 30 : Math.ceil((user.streak + 1) / 30) * 30;
  const daysToMilestone = Math.max(1, nextMilestone - user.streak);

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 rounded-3xl p-5 sm:p-6 border border-amber-200/80 shadow-xs relative overflow-hidden space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-200 ${isAnimating ? 'animate-bounce' : ''}`}>
            <Flame className="w-7 h-7 fill-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">
                {user.streak || 0} Day Study Streak 🔥
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                Active Habit
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Consistent daily practice is key to mastering CBSE & NCERT board exams.
            </p>
          </div>
        </div>

        {!checkedInToday && user.lastActiveDate !== todayStr ? (
          <button
            type="button"
            onClick={handleDailyCheckIn}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-md shadow-amber-300 transition-all flex items-center gap-2 cursor-pointer shrink-0 animate-pulse"
          >
            <Sparkles className="w-4 h-4 text-yellow-200" />
            <span>Check-In Today (+25 XP)</span>
          </button>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Checked in today! Great job</span>
          </div>
        )}
      </div>

      {/* 7-Day Visual Calendar Row */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-amber-100 grid grid-cols-7 gap-2 text-center">
        {weekDays.map((d, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              d.isToday
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200 font-bold ring-2 ring-amber-400'
                : d.isActive
                ? 'bg-amber-50 text-amber-900 border border-amber-200 font-semibold'
                : 'bg-slate-50 text-slate-400 border border-slate-100'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider opacity-80">{d.dayName}</span>
            <span className="text-sm font-black my-0.5">{d.dayNum}</span>
            {d.isActive || (d.isToday && checkedInToday) ? (
              <Flame className={`w-3.5 h-3.5 ${d.isToday ? 'fill-white text-white' : 'fill-amber-500 text-amber-500'}`} />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full bg-slate-200 mt-0.5" />
            )}
          </div>
        ))}
      </div>

      {/* Milestone & Reinforcement Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 bg-white/50 px-4 py-2.5 rounded-xl border border-amber-100 gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Only <strong className="text-slate-900">{daysToMilestone} days</strong> until your <strong className="text-amber-600">{nextMilestone}-Day Streak Badge</strong>!
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Longest Streak: {user.longestStreak || user.streak || 0} Days</span>
        </div>
      </div>
    </div>
  );
};
