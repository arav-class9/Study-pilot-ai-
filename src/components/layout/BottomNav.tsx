import React from 'react';
import { useApp } from '../../context/AppContext';
import { triggerHaptic } from '../../utils/androidBridge';
import { Home, CheckCircle2, BookMarked, User, Layers } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      isActive: activeTab === 'home',
    },
    {
      id: 'workspace',
      label: 'Topics',
      icon: Layers,
      isActive: ['workspace', 'topic-workspace', 'topic', 'learn', 'notes'].includes(activeTab),
    },
    {
      id: 'ncert',
      label: 'Books',
      icon: BookMarked,
      isActive: ['ncert', 'books'].includes(activeTab),
    },
    {
      id: 'practice',
      label: 'Quiz',
      icon: CheckCircle2,
      isActive: ['practice', 'exam', 'radar', 'mistakes'].includes(activeTab),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      isActive: ['profile', 'parent', 'teacher', 'admin'].includes(activeTab),
    },
  ];

  const handleNavClick = (id: string) => {
    triggerHaptic('selection');
    setActiveTab(id);
  };

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Android Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 pt-1 pb-[max(8px,env(safe-area-inset-bottom,8px))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 select-none cursor-pointer transition-all active:scale-95 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-black'
                  : 'text-slate-500 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div
                className={`relative px-4 py-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-105'
                    : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 leading-tight ${isActive ? 'font-black' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
