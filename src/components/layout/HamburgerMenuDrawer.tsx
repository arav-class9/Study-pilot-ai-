import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  X,
  Bot,
  FileText,
  Repeat,
  Target,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  User,
  Crown,
  Settings,
  HelpCircle,
  Info,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Users,
  GraduationCap,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  action?: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const HamburgerMenuDrawer: React.FC = () => {
  const { setActiveTab, activeTab, setIsUpgradeModalOpen, user } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const menuSections: MenuSection[] = [
    {
      title: 'Study Tools',
      items: [
        { id: 'tutor', label: 'AI Socratic Tutor', icon: Bot, badge: 'AI' },
        { id: 'flashcards', label: 'Flashcards', icon: Repeat },
        { id: 'notes', label: 'My Notes', icon: FileText },
        { id: 'radar', label: 'Weakness Radar', icon: Target },
        { id: 'mistakes', label: 'Mistake Notebook', icon: AlertTriangle },
      ],
    },
    {
      title: 'Progress & Planning',
      items: [
        { id: 'progress', label: 'Progress & Mastery', icon: BarChart3 },
        { id: 'plan', label: 'AI Study Roadmap', icon: CalendarDays },
      ],
    },
    {
      title: 'Portals & Roles',
      items: [
        { id: 'parent', label: 'Parent Portal', icon: Users },
        { id: 'teacher', label: 'Teacher Dashboard', icon: GraduationCap },
        ...(user.role === 'admin' ? [{ id: 'admin', label: 'Admin Insights', icon: ShieldAlert }] : []),
      ],
    },
    {
      title: 'Account & Preferences',
      items: [
        { id: 'profile', label: 'My Profile & Streak', icon: User },
        { id: 'upgrade', label: 'Subscription & Pro', icon: Crown, action: () => setIsUpgradeModalOpen(true) },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          label: 'Help & Feedback',
          icon: HelpCircle,
          action: () => alert('StudyPilot AI Support: Contact support@studypilot.ai for prompt assistance.'),
        },
        {
          id: 'about',
          label: 'About StudyPilot AI',
          icon: Info,
          action: () => alert('StudyPilot AI v2.5 - Your personalized curriculum & adaptive study companion.'),
        },
      ],
    },
  ];

  const handleItemClick = (item: MenuItem) => {
    setIsOpen(false);
    if (item.action) {
      item.action();
    } else if (item.id) {
      setActiveTab(item.id);
    }
  };

  const drawerTouchStartX = useRef<number>(0);
  const handleDrawerTouchStart = (e: React.TouchEvent) => {
    drawerTouchStartX.current = e.touches[0].clientX;
  };
  const handleDrawerTouchEnd = (e: React.TouchEvent) => {
    const diffX = drawerTouchStartX.current - e.changedTouches[0].clientX;
    // Swipe left or right to dismiss
    if (Math.abs(diffX) > 60) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger Menu Button */}
      <button
        id="hamburger-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-xs"
        aria-label="Open App Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden animate-fadeIn" />
      )}

      {/* Drawer / Menu Dropdown Panel */}
      {isOpen && (
        <div
          onTouchStart={handleDrawerTouchStart}
          onTouchEnd={handleDrawerTouchEnd}
          className="absolute left-0 top-12 w-[320px] sm:w-[380px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 z-50 animate-fadeIn text-slate-800 dark:text-slate-100 max-h-[80vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                ⚡
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  StudyPilot AI Features
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">All study tools & settings</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Categories & Links */}
          <div className="space-y-5">
            {menuSections.map((sec, idx) => (
              <div key={idx} className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-1">
                  {sec.title}
                </span>
                <div className="space-y-1">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div
                            className={`p-1.5 rounded-xl ${
                              isActive ? 'bg-white/20 text-white' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                          </div>
                          <span className="truncate">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Pro Upgrade Banner in Menu */}
          {user.subscriptionPlan === 'free' && (
            <div className="mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white space-y-2 shadow-md">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-200" />
                <span className="text-xs font-black uppercase tracking-wider">Unlock Pro AI</span>
              </div>
              <p className="text-[11px] opacity-90">
                Unlimited AI tutor queries, advanced exam simulations & offline PDF notes.
              </p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsUpgradeModalOpen(true);
                }}
                className="w-full py-2 bg-white text-orange-700 rounded-xl font-black text-xs hover:bg-amber-50 transition-colors shadow-xs cursor-pointer"
              >
                Upgrade Now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
