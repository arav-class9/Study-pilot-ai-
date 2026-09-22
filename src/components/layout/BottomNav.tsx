import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, BookOpen, CheckCircle2, BookMarked, User, Layers } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workspace', label: 'Topics', icon: Layers },
    { id: 'ncert', label: 'NCERT', icon: BookMarked },
    { id: 'practice', label: 'Quiz', icon: CheckCircle2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-3 py-2 shadow-2xl"
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
              className={`flex flex-col items-center min-w-[60px] py-1 cursor-pointer transition-all ${
                isActive ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className={`px-4 py-1.5 rounded-full transition-all ${isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-1 font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
