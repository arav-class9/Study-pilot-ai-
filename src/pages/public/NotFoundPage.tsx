import React from 'react';
import { SEOHead } from '../../components/seo/SEOHead';
import { SEOBreadcrumbs } from '../../components/seo/SEOBreadcrumbs';
import { getCanonicalUrl } from '../../services/seoService';
import { FileQuestion, Home, BookOpen, ArrowRight, Sparkles } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate?: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  const canonicalUrl = getCanonicalUrl('/404');
  const breadcrumbs = [{ label: 'Page Not Found (404)', url: '/404' }];

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-16 text-center">
      <SEOHead
        metadata={{
          title: 'Page Not Found (404) | StudyPilot AI',
          description:
            'The requested educational page could not be found. Explore official NCERT textbooks, syllabus notes, and practice quizzes on StudyPilot AI.',
          canonicalUrl,
          robots: 'noindex, follow',
          breadcrumbs,
        }}
      />

      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
            HTTP Status: 404 Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Educational Resource Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            The page you are looking for might have been moved or updated. You can explore verified NCERT textbooks and curriculum materials below:
          </p>
        </div>

        <div className="space-y-2 text-left">
          <a
            href="/"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('/');
              }
            }}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 flex items-center justify-between transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Home className="w-4 h-4 text-indigo-600" />
              <span>StudyPilot Home</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </a>

          <a
            href="/ncert"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('/ncert');
              }
            }}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 flex items-center justify-between transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Browse NCERT Textbooks (Classes 6–12)</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </a>

          <a
            href="/features"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('/features');
              }
            }}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 flex items-center justify-between transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Platform Study Tools &amp; Features</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </a>
        </div>
      </div>
    </article>
  );
};
