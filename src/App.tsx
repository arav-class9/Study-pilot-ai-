import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FocusProvider } from './context/FocusContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';


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
  const { user, loading } = useAuth();

  const touchStartX = React.useRef<number>(0);
  const touchStartY = React.useRef<number>(0);

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

  const primaryTabs = ['home', 'learn', 'practice', 'exam'];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > 80 && Math.abs(diffX) > Math.abs(diffY)) {
      const currentIndex = primaryTabs.indexOf(activeTab);
      if (currentIndex !== -1) {
        if (diffX > 0 && currentIndex < primaryTabs.length - 1) {
          setActiveTab(primaryTabs[currentIndex + 1]);
        } else if (diffX < 0 && currentIndex > 0) {
          setActiveTab(primaryTabs[currentIndex - 1]);
        }
      }
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
        <main className={`flex-1 overflow-y-auto w-full ${['workspace', 'topic-workspace', 'topic'].includes(activeTab) ? 'p-0 pb-20 md:pb-6' : 'p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl mx-auto'}`}>
          <ErrorBoundary sectionName={activeTab.toUpperCase()}>
            {renderContent()}
          </ErrorBoundary>
        </main>
      </div>
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
