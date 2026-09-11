import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useFocus } from '../../context/FocusContext';
import {
  Sparkles,
  Flame,
  Zap,
  Crown,
  BookOpen,
  User,
  Search,
  Bell,
  WifiOff,
  Timer,
  Sun,
  Moon,
} from 'lucide-react';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { NotificationDrawer } from '../notifications/NotificationDrawer';
import { HamburgerMenuDrawer } from './HamburgerMenuDrawer';

export const Navbar: React.FC = () => {
  const { user, setIsUpgradeModalOpen, setActiveTab, activeTab, notifications, isOffline, isProfileLoading, isDarkMode, toggleDarkMode } = useApp();
  const { openZen, isRunning, timeLeft, mode } = useFocus();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <header
        id="main-navbar"
        className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border-none px-3 sm:px-6 py-3 transition-colors"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Brand Logo & Hamburger Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            <HamburgerMenuDrawer />

            <div
              id="brand-logo-btn"
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 cursor-pointer group select-none"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 dark:shadow-none group-hover:scale-105 transition-transform shrink-0">
                <div className="relative">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1.5 -right-1.5 animate-pulse" />
                </div>
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">StudyPilot</span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden md:block font-medium">
                  Study smarter. Improve every day.
                </p>
              </div>
            </div>
          </div>

          {/* Center: Search Trigger Button */}
          <button
            id="navbar-search-btn"
            onClick={() => setIsSearchOpen(true)}
            className="hidden lg:flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer w-64 justify-between"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400 font-medium truncate">Search syllabus & notes...</span>
            </div>
            <kbd className="text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Right: Status Indicators & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* NCERT Books Quick Button */}
            <button
              id="navbar-ncert-btn"
              onClick={() => setActiveTab('ncert')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
              title="Open NCERT School Books & Page Quizzes"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>NCERT Books</span>
            </button>

            {/* Offline Pill */}
            {isOffline && (
              <div
                id="offline-indicator-badge"
                className="hidden sm:flex items-center gap-1 bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300"
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline</span>
              </div>
            )}

            {/* Quick Pomodoro / Zen Focus Trigger */}
            <button
              id="navbar-zen-focus-btn"
              onClick={openZen}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
                isRunning
                  ? 'bg-slate-900 text-amber-300 border border-amber-500/40 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
              }`}
              title="Launch Fullscreen Zen Study Focus Mode"
            >
              <Timer className={`w-3.5 h-3.5 ${isRunning ? 'text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
              <span className="font-mono text-xs">{formatTime(timeLeft)}</span>
            </button>

            {/* Streak Indicator */}
            <div
              id="streak-indicator"
              className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 sm:px-2.5 py-1.5 rounded-full text-amber-800 dark:text-amber-300 text-xs font-semibold shadow-xs"
              title={`${user.streak} day study streak!`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-bounce" />
              <span className="font-bold">{user.streak}</span>
            </div>

            {/* XP & Level Badge */}
            <div
              id="xp-level-badge"
              className="hidden sm:flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 px-2.5 py-1.5 rounded-full text-indigo-800 dark:text-indigo-300 text-xs font-semibold shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-indigo-600" />
              {isProfileLoading ? (
                <span className="text-[10px]">Loading...</span>
              ) : (
                <span className="font-bold">Lvl {user.level || 1}</span>
              )}
            </div>

            {/* Notifications Bell */}
            <button
              id="navbar-notifications-btn"
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center -mt-0.5 -mr-0.5">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle Button */}
            <button
              id="navbar-dark-mode-toggle"
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>

            {/* Subscription Tier Button */}
            {user.subscriptionPlan === 'free' ? (
              <button
                id="upgrade-plan-btn"
                onClick={() => setIsUpgradeModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-100" />
                <span>Upgrade</span>
              </button>
            ) : (
              <span
                id="premium-plan-badge"
                onClick={() => setIsUpgradeModalOpen(true)}
                className="hidden sm:flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase px-2.5 py-1 rounded-full cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pro</span>
              </span>
            )}

            {/* User Profile Button */}
            <button
              id="navbar-profile-btn"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 p-1 rounded-full transition-all cursor-pointer ${activeTab === 'profile' ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:ring-2 hover:ring-slate-300 hover:ring-offset-1 dark:hover:ring-slate-700'}`}
              title="Open Profile"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white dark:border-slate-800"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Global Modals */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  );
};
