
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translateUI, SupportedLanguage } from '../../services/i18n';
import { 
  GraduationCap, 
  Search, 
  Bell, 
  User,
  Home,
  BookOpen,
  ClipboardList,
  Sparkles,
  BarChart3,
  ChevronDown,
  Layers,
  Sun,
  Moon
} from 'lucide-react';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { NotificationDrawer } from '../notifications/NotificationDrawer';
import { HamburgerMenuDrawer } from './HamburgerMenuDrawer';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

export const Navbar: React.FC = () => {
  const { user, activeTab, setActiveTab, notifications, isDarkMode, toggleDarkMode, language } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const currentLang = (language as SupportedLanguage) || 'en';
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workspace', label: 'Topic Workspace', icon: Layers },
    { id: 'coach', label: 'Study Coach', icon: Sparkles },
    { id: 'ncert', label: 'NCERT & Books', icon: BookOpen },
    { id: 'practice', label: 'Quiz', icon: ClipboardList },
    { id: 'tutor', label: 'AI Tools', icon: GraduationCap },
    { id: 'progress', label: 'Progress', icon: BarChart3 }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs px-4 sm:px-6 lg:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          
          {/* Left: Logo */}
          <div className="flex-1 flex items-center justify-start gap-2.5 cursor-pointer group" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
               <GraduationCap className="w-6 h-6" fill="currentColor" strokeWidth={1}/>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none flex items-center gap-1">
                Study Pilot <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">AI</span>
              </h1>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Smart Learning Engine</span>
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id || 
                (link.id === 'ncert' && activeTab === 'books') || 
                (link.id === 'tutor' && activeTab === 'radar');
                
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20 font-black' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700/80'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{translateUI(link.label, currentLang)}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-3">
            <LanguageSwitcher />
            <PWAInstallButton />

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            <button 
              id="navbar-search-btn"
              onClick={() => setIsSearchOpen(true)}
              title="Search topics, notes & deep research (Ctrl+K)"
              className="p-2 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              title="Notifications"
              className="p-2 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
              )}
            </button>

            {/* Profile Dropdown Trigger */}
            <button 
              onClick={() => setActiveTab('profile')}
              className="hidden sm:flex items-center gap-2.5 pl-2 pr-1.5 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-sm">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name.substring(0, 2).toUpperCase() : 'AA'
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {user?.name || 'Arav Aryan'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </button>

            {/* Mobile Hamburger Menu */}
            <div className="lg:hidden flex items-center ml-1">
              <HamburgerMenuDrawer />
            </div>
          </div>
        </div>
      </header>

      {/* Global Modals */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  );
};
