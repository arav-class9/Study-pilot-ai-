const fs = require('fs');

const code = `
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  ChevronDown
} from 'lucide-react';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { NotificationDrawer } from '../notifications/NotificationDrawer';
import { HamburgerMenuDrawer } from './HamburgerMenuDrawer';

export const Navbar: React.FC = () => {
  const { user, activeTab, setActiveTab, notifications } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'ncert', label: 'NCERT & Books', icon: BookOpen },
    { id: 'practice', label: 'Quiz', icon: ClipboardList },
    { id: 'tutor', label: 'AI Tools', icon: Sparkles },
    { id: 'progress', label: 'Progress', icon: BarChart3 }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="text-blue-600">
               <GraduationCap className="w-8 h-8" fill="currentColor" strokeWidth={1}/>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
              Study Pilot <span className="text-blue-600">AI</span>
            </h1>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id || 
                (link.id === 'ncert' && activeTab === 'books') || 
                (link.id === 'tutor' && activeTab === 'radar');
                
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={\`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer \${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }\`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
              )}
            </button>

            {/* Profile Dropdown Trigger */}
            <button 
              onClick={() => setActiveTab('profile')}
              className="hidden sm:flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name.substring(0, 2).toUpperCase() : 'AA'
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
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
`;

fs.writeFileSync('src/components/layout/Navbar.tsx', code, 'utf8');
