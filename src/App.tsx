import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FocusProvider } from './context/FocusContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { AndroidFloatingActionButton } from './components/layout/AndroidFloatingActionButton';
import { useAndroidNavigation } from './hooks/useAndroidNavigation';


import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { WalkthroughModal } from './components/onboarding/WalkthroughModal';
import { UpgradeModal } from './components/common/UpgradeModal';
import { ZenFocusModal } from './components/pomodoro/ZenFocusModal';
import { FocusAnalyticsModal } from './components/pomodoro/FocusAnalyticsModal';
import { FloatingFocusWidget } from './components/pomodoro/FloatingFocusWidget';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { OfflineBanner } from './components/common/OfflineBanner';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Pages
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { PublicHomePage } from './pages/public/PublicHomePage';
import { AboutPage } from './pages/public/AboutPage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { FeatureLanderPage } from './pages/public/FeatureLanderPage';
import { PublicNCERTPage } from './pages/public/PublicNCERTPage';
import { PublicTopicPage } from './pages/public/PublicTopicPage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { SEODiagnosticBar } from './components/seo/SEODiagnosticBar';
import { useSEORouter } from './hooks/useSEORouter';

function safeLazy<P = {}>(factory: () => Promise<any>, exportName: string): React.LazyExoticComponent<React.ComponentType<P>> {
  return React.lazy(async () => {
    const module = await factory();
    const Component = module[exportName] || module.default;
    if (!Component) {
      throw new Error(`Component "${exportName}" not found in lazy module.`);
    }
    return { default: Component };
  });
}

const AITutorPage = safeLazy(() => import('./pages/AITutorPage'), 'AITutorPage');
const LearnPage = safeLazy(() => import('./pages/LearnPage'), 'LearnPage');
const PracticeQuizPage = safeLazy(() => import('./pages/PracticeQuizPage'), 'PracticeQuizPage');
const WeaknessRadarPage = safeLazy(() => import('./pages/WeaknessRadarPage'), 'WeaknessRadarPage');
const StudyPlanPage = safeLazy(() => import('./pages/StudyPlanPage'), 'StudyPlanPage');
const TimetableStudyPage = safeLazy(() => import('./pages/TimetableStudyPage'), 'TimetableStudyPage');
const ProgressPage = safeLazy(() => import('./pages/ProgressPage'), 'ProgressPage');
const ProfilePage = safeLazy(() => import('./pages/ProfilePage'), 'ProfilePage');
const AdminPage = safeLazy(() => import('./pages/AdminPage'), 'AdminPage');
const MistakesPage = safeLazy(() => import('./pages/MistakesPage'), 'MistakesPage');
const ExamPage = safeLazy(() => import('./pages/ExamPage'), 'ExamPage');
const ParentDashboardPage = safeLazy(() => import('./pages/ParentDashboardPage'), 'ParentDashboardPage');
const TeacherDashboardPage = safeLazy(() => import('./pages/TeacherDashboardPage'), 'TeacherDashboardPage');
const NCERTBooksPage = safeLazy(() => import('./pages/NCERTBooksPage'), 'NCERTBooksPage');
const StudyCoachPage = safeLazy<{ initialTab?: string }>(() => import('./pages/StudyCoachPage'), 'StudyCoachPage');
const TopicWorkspaceView = safeLazy<{ onBackToDashboard?: () => void }>(() => import('./components/workspace/TopicWorkspaceView'), 'TopicWorkspaceView');

import { Toaster } from 'react-hot-toast';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, isDarkMode } = useApp();
  const { user, loading, signInGuest } = useAuth();
  const { currentRoute, navigate } = useSEORouter();

  // Android Native Gesture & Hardware Back Button Integration
  useAndroidNavigation({ activeTab, setActiveTab });

  // Sync tab navigation with route if route is tab
  React.useEffect(() => {
    if (currentRoute.type === 'tab' && currentRoute.params.tabName) {
      if (currentRoute.params.tabName !== activeTab) {
        setActiveTab(currentRoute.params.tabName);
      }
    }
  }, [currentRoute, activeTab, setActiveTab]);

  // Sync route when activeTab changes
  const prevTabRef = React.useRef(activeTab);
  React.useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      prevTabRef.current = activeTab;
      const targetPath = activeTab === 'home' ? '/' : `/${activeTab}`;
      if (window.location.pathname !== targetPath) {
        navigate(targetPath);
      }
      // Reset scroll position to top on tab change with default native scroll
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }
    }
  }, [activeTab, navigate]);

  // Scroll to top on route change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [currentRoute.path]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
        {/* Glowing background aura */}
        <div className="absolute w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse delay-1000" />

        <div className="relative z-10 flex flex-col items-center space-y-6 max-w-sm text-center px-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-2xl flex items-center justify-center animate-bounce">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <span className="text-3xl">🚀</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              StudyPilot AI
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Initializing neural tutoring engine & syncing spaced repetition memory...
            </p>
          </div>

          <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-[pulse_1s_ease-in-out_infinite] w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Handle explicitly unauthenticated access to private tabs
  const privateTabs = ['profile', 'mistakes', 'progress', 'timetable', 'admin', 'parent', 'teacher', 'auth'];
  if (!user && currentRoute.type === 'tab' && privateTabs.includes(currentRoute.params.tabName || '')) {
    return <AuthPage />;
  }

  // 1. Render Public Informational & NCERT SEO Pages
  const renderPublicPage = () => {
    switch (currentRoute.type) {
      case 'about':
        return <AboutPage onNavigate={navigate} />;
      case 'features':
        return <FeaturesPage onNavigate={navigate} />;
      case 'ai-planner':
        return <FeatureLanderPage feature="planner" onNavigate={navigate} />;
      case 'ai-notes':
        return <FeatureLanderPage feature="notes" onNavigate={navigate} />;
      case 'ai-quiz':
        return <FeatureLanderPage feature="quiz" onNavigate={navigate} />;
      case 'ncert-hub':
        return (
          <PublicNCERTPage
            onNavigate={navigate}
            onOpenReader={(ch) => {
              setActiveTab('ncert');
              navigate('/ncert');
            }}
          />
        );
      case 'ncert-class':
        return (
          <PublicNCERTPage
            classLevel={currentRoute.params.classLevel}
            onNavigate={navigate}
            onOpenReader={(ch) => {
              setActiveTab('ncert');
              navigate('/ncert');
            }}
          />
        );
      case 'ncert-subject':
        return (
          <PublicNCERTPage
            classLevel={currentRoute.params.classLevel}
            subjectId={currentRoute.params.subjectId}
            onNavigate={navigate}
            onOpenReader={(ch) => {
              setActiveTab('ncert');
              navigate('/ncert');
            }}
          />
        );
      case 'ncert-chapter':
        return (
          <PublicNCERTPage
            classLevel={currentRoute.params.classLevel}
            subjectId={currentRoute.params.subjectId}
            chapterSlug={currentRoute.params.chapterSlug}
            onNavigate={navigate}
            onOpenReader={(ch) => {
              setActiveTab('ncert');
              navigate('/ncert');
            }}
          />
        );
      case 'topic':
        return (
          <PublicTopicPage
            topicSlug={currentRoute.params.topicSlug || 'newtons-laws-of-motion'}
            onNavigate={navigate}
            onLaunchTopicWorkspace={() => {
              setActiveTab('topic-workspace');
              navigate('/workspace');
            }}
          />
        );
      case '404':
        return <NotFoundPage onNavigate={navigate} />;
      case 'home':
        if (!user) {
          return (
            <PublicHomePage
              onNavigate={navigate}
              onGetStarted={() => {
                signInGuest().catch(() => {});
              }}
            />
          );
        }
        return null;
      default:
        return null;
    }
  };

  const publicPageView = renderPublicPage();
  if (publicPageView) {
    return (
      <div
        className={`min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300 ${
          isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}
      >
        <OfflineBanner />
        <Toaster position="top-center" toastOptions={{ className: 'text-sm font-bold', style: { borderRadius: '16px' } }} />
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ErrorBoundary sectionName="PUBLIC_SEO_VIEW">
            {publicPageView}
          </ErrorBoundary>
        </main>
      </div>
    );
  }

  // If user is not authenticated and is trying to access the app
  if (!user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    return (
      <React.Suspense fallback={<div className="flex h-[80vh] items-center justify-center text-slate-500 font-bold animate-pulse">Loading {activeTab} view...</div>}>
        {(() => {
          switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'topic-workspace':
      case 'workspace':
      case 'topic':
        return <TopicWorkspaceView onBackToDashboard={() => setActiveTab('home')} />;
      case 'tutor':
        return <AITutorPage />;
      case 'learn':
      case 'notes':
        return <LearnPage />;
      case 'ncert':
      case 'books':
        return <NCERTBooksPage />;
      case 'practice':
        return <PracticeQuizPage />;
      case 'radar':
      case 'revision':
        return <WeaknessRadarPage />;
      case 'plan':
        return <StudyPlanPage />;
      case 'timetable':
        return <TimetableStudyPage />;
      case 'progress':
        return <ProgressPage />;
      case 'mistakes':
        return <MistakesPage />;
      case 'coach':
      case 'study-coach':
        return <StudyCoachPage initialTab="overview" />;
      case 'pomo-schedule':
        return <StudyCoachPage initialTab="schedule" />;
      case 'feynman':
        return <StudyCoachPage initialTab="feynman" />;
      case 'flashcards':
        return <StudyCoachPage initialTab="flashcards" />;
      case 'diagnostic':
        return <StudyCoachPage initialTab="exam" />;
      case 'triage':
        return <StudyCoachPage initialTab="triage" />;
      case 'exam':
        return <ExamPage />;
      case 'parent':
        return <ParentDashboardPage />;
      case 'teacher':
        return <TeacherDashboardPage />;
      case 'profile':
        return <ProfilePage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage />;
    }
        })()}
      </React.Suspense>
    );
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}
    >
      <OfflineBanner />
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          className: 'text-sm font-bold',
          style: { borderRadius: '16px' }
        }} 
      />
      <Navbar />
      <div className={`flex-1 flex w-full mx-auto ${['workspace', 'topic-workspace', 'topic'].includes(activeTab) ? 'max-w-full' : 'max-w-7xl'}`}>
        {!['workspace', 'topic-workspace', 'topic'].includes(activeTab) && <Sidebar />}
        <main className={`flex-1 w-full hardware-accelerated ${['workspace', 'topic-workspace', 'topic'].includes(activeTab) ? 'p-0 pb-[calc(env(safe-area-inset-bottom,0px)+72px)] md:pb-6' : 'p-4 sm:p-6 lg:p-8 pb-[calc(env(safe-area-inset-bottom,0px)+80px)] md:pb-8 max-w-7xl mx-auto'}`}>
          <ErrorBoundary sectionName={activeTab.toUpperCase()}>
            {renderContent()}
          </ErrorBoundary>
        </main>
      </div>
      <AndroidFloatingActionButton />
      <BottomNav />
      
      <OnboardingModal />
      <WalkthroughModal />
      <UpgradeModal />
      <ZenFocusModal />
      <FocusAnalyticsModal />
      <FloatingFocusWidget />
      <OfflineIndicator />
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary sectionName="StudyPilot Root">
      <LanguageProvider>
        <AuthProvider>
          <AppProvider>
            <FocusProvider>
              <AppContent />
            </FocusProvider>
          </AppProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
