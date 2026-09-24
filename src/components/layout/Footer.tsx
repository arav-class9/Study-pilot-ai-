import React from 'react';
import { Sparkles, BookOpen, Brain, Layers, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand & Mission */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-base shadow-sm">
              S
            </div>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              StudyPilot AI
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
            AI-powered study assistant for students with notes, explanations, NCERT learning, quizzes, revision tools and personalized study support.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>Aligned with CBSE &amp; NCERT Standards</span>
            <span>•</span>
            <span>Free Student Access</span>
          </div>
        </div>

        {/* AI Capabilities */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            AI Study Tools
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href="/ai-study-assistant"
                onClick={(e) => handleLinkClick(e, '/ai-study-assistant')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                AI Study Assistant
              </a>
            </li>
            <li>
              <a
                href="/ai-notes-generator"
                onClick={(e) => handleLinkClick(e, '/ai-notes-generator')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                AI Notes Generator
              </a>
            </li>
            <li>
              <a
                href="/ai-quiz-generator"
                onClick={(e) => handleLinkClick(e, '/ai-quiz-generator')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                AI Quiz Generator
              </a>
            </li>
            <li>
              <a
                href="/ai-flashcards"
                onClick={(e) => handleLinkClick(e, '/ai-flashcards')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                AI Flashcards
              </a>
            </li>
            <li>
              <a
                href="/ai-study-planner"
                onClick={(e) => handleLinkClick(e, '/ai-study-planner')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                AI Study Planner
              </a>
            </li>
            <li>
              <a
                href="/ai-question-solver"
                onClick={(e) => handleLinkClick(e, '/ai-question-solver')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                AI Question Solver
              </a>
            </li>
          </ul>
        </div>

        {/* NCERT Class 9 Hub */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            NCERT Class 9
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href="/ncert/class-9/science"
                onClick={(e) => handleLinkClick(e, '/ncert/class-9/science')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                Class 9 Science Notes
              </a>
            </li>
            <li>
              <a
                href="/ncert/class-9/maths"
                onClick={(e) => handleLinkClick(e, '/ncert/class-9/maths')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                Class 9 Maths Solutions
              </a>
            </li>
            <li>
              <a
                href="/ncert/class-9/social-science"
                onClick={(e) => handleLinkClick(e, '/ncert/class-9/social-science')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                Class 9 Social Science
              </a>
            </li>
            <li>
              <a
                href="/ncert/class-9/english"
                onClick={(e) => handleLinkClick(e, '/ncert/class-9/english')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                Class 9 English
              </a>
            </li>
            <li>
              <a
                href="/ncert/class-9/hindi"
                onClick={(e) => handleLinkClick(e, '/ncert/class-9/hindi')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                Class 9 Hindi
              </a>
            </li>
            <li>
              <a
                href="/ncert/class-9"
                onClick={(e) => handleLinkClick(e, '/ncert/class-9')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                All Class 9 Textbooks
              </a>
            </li>
          </ul>
        </div>

        {/* NCERT Classes & High-Yield Guides */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            NCERT Classes
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href="/ncert/class-10"
                onClick={(e) => handleLinkClick(e, '/ncert/class-10')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                NCERT Class 10
              </a>
            </li>
            <li>
              <a
                href="/ncert/class-11"
                onClick={(e) => handleLinkClick(e, '/ncert/class-11')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                NCERT Class 11
              </a>
            </li>
            <li>
              <a
                href="/ncert/class-12"
                onClick={(e) => handleLinkClick(e, '/ncert/class-12')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                NCERT Class 12
              </a>
            </li>
            <li>
              <a
                href="/ncert/class-8"
                onClick={(e) => handleLinkClick(e, '/ncert/class-8')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                NCERT Class 8
              </a>
            </li>
            <li>
              <a
                href="/ncert"
                onClick={(e) => handleLinkClick(e, '/ncert')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                NCERT Textbooks Hub
              </a>
            </li>
            <li>
              <a
                href="/topic/newtons-laws-of-motion"
                onClick={(e) => handleLinkClick(e, '/topic/newtons-laws-of-motion')}
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                Newton's Laws Concept Guide
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} StudyPilot AI. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a
            href="/about"
            onClick={(e) => handleLinkClick(e, '/about')}
            className="hover:underline"
          >
            About
          </a>
          <a
            href="/features"
            onClick={(e) => handleLinkClick(e, '/features')}
            className="hover:underline"
          >
            Features
          </a>
          <a
            href="/ncert"
            onClick={(e) => handleLinkClick(e, '/ncert')}
            className="hover:underline"
          >
            Syllabus
          </a>
        </div>
      </div>
    </footer>
  );
};
