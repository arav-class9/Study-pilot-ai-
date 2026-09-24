import { useState, useEffect, useCallback } from 'react';

export interface RouteState {
  path: string;
  type:
    | 'home'
    | 'about'
    | 'features'
    | 'ai-planner'
    | 'ai-notes'
    | 'ai-quiz'
    | 'ncert-hub'
    | 'ncert-class'
    | 'ncert-subject'
    | 'ncert-chapter'
    | 'topic'
    | 'tab'
    | '404';
  params: {
    classLevel?: string;
    subjectId?: string;
    chapterSlug?: string;
    topicSlug?: string;
    tabName?: string;
  };
}

export function parseRoute(pathname: string): RouteState {
  const path = pathname.trim();
  const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;

  // 1. Root / Home
  if (cleanPath === '' || cleanPath === '/') {
    return { path: '/', type: 'home', params: {} };
  }

  // 2. Static Public Informational Pages
  if (cleanPath === '/about') {
    return { path: '/about', type: 'about', params: {} };
  }
  if (cleanPath === '/features') {
    return { path: '/features', type: 'features', params: {} };
  }
  if (cleanPath === '/ai-study-planner') {
    return { path: '/ai-study-planner', type: 'ai-planner', params: {} };
  }
  if (cleanPath === '/ai-notes') {
    return { path: '/ai-notes', type: 'ai-notes', params: {} };
  }
  if (cleanPath === '/ai-quiz-generator') {
    return { path: '/ai-quiz-generator', type: 'ai-quiz', params: {} };
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
        subjectId: ncertChapterMatch[2],
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
        subjectId: ncertSubjectMatch[2],
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
        subjectId: altClassSubjectMatch[2],
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
