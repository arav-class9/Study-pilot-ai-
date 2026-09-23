
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
    { id: 'home', label: 'Home' },
    { id: 'ncert', label: 'NCERT & Books' },
    { id: 'workspace', label: 'Topics' },
    { id: 'practice', label: 'Quiz' },
    { id: 'coach', label: 'Study Tools' },
    { id: 'ai-search', label: 'AI Search' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-[44px] bg-[#000000] text-[#ffffff] border-b border-[#272729] px-4 sm:px-8 select-none transition-colors">
        <div className="max-w-6xl mx-auto h-full grid grid-cols-3 items-center">
          
          {/* Left: StudyPilot Logo */}
          <div className="flex items-center justify-start gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-5 h-5 rounded-full bg-[#0066cc] flex items-center justify-center text-white shrink-0">
              <GraduationCap className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
            <span className="text-[14px] font-semibold tracking-tight text-white">
              StudyPilot
            </span>
          </div>

          {/* Center: Desktop Navigation Links (Stay perfectly centered) */}
          <nav className="hidden md:flex items-center justify-center gap-6">
            {navLinks.map((link) => {
              const isActive =
                activeTab === link.id ||
                (link.id === 'ncert' && activeTab === 'books') ||
                (link.id === 'workspace' && (activeTab === 'topic' || activeTab === 'topic-workspace'));

              return (
                <button
                  key={link.id}
                  onClick={() => {
                    if (link.id === 'ai-search') {
                      setIsSearchOpen(true);
                    } else {
                      setActiveTab(link.id);
                    }
                  }}
                  className={`text-[12px] transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-white font-medium'
                      : 'text-[#a1a1a6] hover:text-white font-normal'
                  }`}
                >
                  {translateUI(link.label, currentLang)}
                </button>
              );
            })}
          </nav>

          {/* Right: Controls & Profile */}
          <div className="flex items-center justify-end gap-3 text-white">
            <button
              id="navbar-search-btn"
              onClick={() => setIsSearchOpen(true)}
              title="Search topics, notes & curriculum (Ctrl+K)"
              className="text-[#a1a1a6] hover:text-white transition-colors cursor-pointer p-1"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsNotificationsOpen(true)}
              title="Notifications"
              className="text-[#a1a1a6] hover:text-white transition-colors relative cursor-pointer p-1"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#0066cc] rounded-full"></span>
              )}
            </button>

            <button
              onClick={toggleDarkMode}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="text-[#a1a1a6] hover:text-white transition-colors cursor-pointer p-1"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Profile */}
            <button
              onClick={() => setActiveTab('profile')}
              title="Student Profile"
              className="w-5 h-5 rounded-full overflow-hidden bg-[#272729] text-[10px] flex items-center justify-center cursor-pointer border border-[#38383a]"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-3 h-3 text-[#a1a1a6]" />
              )}
            </button>

            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center ml-1 text-white">
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
