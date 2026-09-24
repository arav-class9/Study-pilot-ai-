import { useState, useEffect, useCallback } from 'react';

export type RouteType =
  | 'home'
  | 'about'
  | 'features'
  | 'ai-assistant'
  | 'ai-notes'
  | 'ai-quiz'
  | 'ai-flashcards'
  | 'ai-planner'
  | 'ai-solver'
  | 'ncert-hub'
  | 'ncert-class'
  | 'ncert-subject'
  | 'ncert-chapter'
  | 'topic'
  | 'tab'
  | '404';

export interface RouteState {
  path: string;
  type: RouteType;
  params: {
    classLevel?: string;
    subjectId?: string;
    chapterSlug?: string;
    topicSlug?: string;
    tabName?: string;
  };
}

export function normalizeSubjectSlug(slug: string): string {
  const s = slug.toLowerCase().trim();
  if (s === 'math' || s === 'maths' || s === 'mathematics') return 'math';
  if (s === 'social' || s === 'social-science' || s === 'social_science' || s === 'sst') return 'social';
  if (s === 'sci' || s === 'science') return 'science';
  if (s === 'eng' || s === 'english') return 'english';
  if (s === 'hin' || s === 'hindi') return 'hindi';
  if (s === 'phy' || s === 'physics') return 'physics';
  if (s === 'chem' || s === 'chemistry') return 'chemistry';
  if (s === 'bio' || s === 'biology') return 'biology';
  return s;
}

export function parseRoute(pathname: string): RouteState {
  const path = pathname.trim();
  const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;

  // 1. Root / Home
  if (cleanPath === '' || cleanPath === '/') {
    return { path: '/', type: 'home', params: {} };
  }

  // 2. Static Public Informational & Feature Lander Pages
  if (cleanPath === '/about') {
    return { path: '/about', type: 'about', params: {} };
  }
  if (cleanPath === '/features') {
    return { path: '/features', type: 'features', params: {} };
  }
  if (cleanPath === '/ai-study-assistant' || cleanPath === '/ai-assistant') {
    return { path: '/ai-study-assistant', type: 'ai-assistant', params: {} };
  }
  if (cleanPath === '/ai-notes-generator' || cleanPath === '/ai-notes') {
    return { path: '/ai-notes-generator', type: 'ai-notes', params: {} };
  }
  if (cleanPath === '/ai-quiz-generator' || cleanPath === '/ai-quiz') {
    return { path: '/ai-quiz-generator', type: 'ai-quiz', params: {} };
  }
  if (cleanPath === '/ai-flashcards') {
    return { path: '/ai-flashcards', type: 'ai-flashcards', params: {} };
  }
  if (cleanPath === '/ai-study-planner' || cleanPath === '/ai-planner') {
    return { path: '/ai-study-planner', type: 'ai-planner', params: {} };
  }
  if (cleanPath === '/ai-question-solver' || cleanPath === '/ai-solver') {
    return { path: '/ai-question-solver', type: 'ai-solver', params: {} };
  }

  // 3. NCERT Routes: /ncert, /ncert/:class, /ncert/:class/:subject, /ncert/:class/:subject/:chapter
  if (cleanPath === '/ncert') {
    return { path: '/ncert', type: 'ncert-hub', params: {} };
  }

  const ncertChapterMatch = cleanPath.match(/^\/ncert\/class-?([0-9]{1,2})\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)$/i);
  if (ncertChapterMatch) {
    return {
      path: cleanPath,
      type: 'ncert-chapter',
      params: {
        classLevel: ncertChapterMatch[1],
        subjectId: normalizeSubjectSlug(ncertChapterMatch[2]),
        chapterSlug: ncertChapterMatch[3],
      },
    };
  }

  const ncertSubjectMatch = cleanPath.match(/^\/ncert\/class-?([0-9]{1,2})\/([a-zA-Z0-9_-]+)$/i);
  if (ncertSubjectMatch) {
    return {
      path: cleanPath,
      type: 'ncert-subject',
      params: {
        classLevel: ncertSubjectMatch[1],
        subjectId: normalizeSubjectSlug(ncertSubjectMatch[2]),
      },
    };
  }

  const ncertClassMatch = cleanPath.match(/^\/ncert\/class-?([0-9]{1,2})$/i);
  if (ncertClassMatch) {
    return {
      path: cleanPath,
      type: 'ncert-class',
      params: { classLevel: ncertClassMatch[1] },
    };
  }

  // Also support /class/:class and /class/:class/:subject
  const altClassSubjectMatch = cleanPath.match(/^\/class\/([0-9]{1,2})\/([a-zA-Z0-9_-]+)$/i);
  if (altClassSubjectMatch) {
    return {
      path: cleanPath,
      type: 'ncert-subject',
      params: {
        classLevel: altClassSubjectMatch[1],
        subjectId: normalizeSubjectSlug(altClassSubjectMatch[2]),
      },
    };
  }

  const altClassMatch = cleanPath.match(/^\/class\/([0-9]{1,2})$/i);
  if (altClassMatch) {
    return {
      path: cleanPath,
      type: 'ncert-class',
      params: { classLevel: altClassMatch[1] },
    };
  }

  // 4. Topic Routes: /topic/:topicSlug
  const topicMatch = cleanPath.match(/^\/topic\/([a-zA-Z0-9_-]+)$/i);
  if (topicMatch) {
    return {
      path: cleanPath,
      type: 'topic',
      params: { topicSlug: topicMatch[1] },
    };
  }

  // Explicit Topic Workspace aliases
  if (cleanPath === '/topic' || cleanPath === '/topics' || cleanPath === '/workspace' || cleanPath === '/topic-workspace') {
    return {
      path: cleanPath,
      type: 'tab',
      params: { tabName: 'workspace' },
    };
  }

  // 5. Existing Known Application Tabs
  const knownTabs = [
    'dashboard',
    'workspace',
    'topic',
    'topics',
    'topic-workspace',
    'tutor',
    'learn',
    'notes',
    'practice',
    'radar',
    'revision',
    'plan',
    'timetable',
    'progress',
    'mistakes',
    'coach',
    'study-coach',
    'pomo-schedule',
    'feynman',
    'flashcards',
    'diagnostic',
    'triage',
    'exam',
    'parent',
    'teacher',
    'profile',
    'admin',
    'auth',
  ];

  const strippedTab = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
  if (knownTabs.includes(strippedTab)) {
    return {
      path: cleanPath,
      type: 'tab',
      params: { tabName: strippedTab },
    };
  }

  // 6. Unknown 404
  return {
    path: cleanPath,
    type: '404',
    params: {},
  };
}

export function useSEORouter() {
  const [currentRoute, setCurrentRoute] = useState<RouteState>(() => {
    if (typeof window !== 'undefined') {
      return parseRoute(window.location.pathname);
    }
    return { path: '/', type: 'home', params: {} };
  });

  const navigate = useCallback((targetPath: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
      setCurrentRoute(parseRoute(targetPath));
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseRoute(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return {
    currentRoute,
    navigate,
  };
}
