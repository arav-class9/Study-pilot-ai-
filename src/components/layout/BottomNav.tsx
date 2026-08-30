import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, BookOpen, CheckCircle2, FileCheck2 } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'practice', label: 'Practice', icon: CheckCircle2 },
    { id: 'exam', label: 'Exam', icon: FileCheck2 },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 px-2 py-2 shadow-xl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center min-w-[64px] py-2 cursor-pointer transition-colors ${
                isActive ? 'text-indigo-700 dark:text-indigo-300 font-bold' : 'text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900'
              }`}
            >
              <div className={`px-5 py-1 rounded-full transition-colors ${isActive ? 'bg-indigo-100 dark:bg-indigo-900/60' : 'bg-transparent'}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className="text-[11px] mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
