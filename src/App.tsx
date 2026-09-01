import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FocusProvider } from './context/FocusContext';
import { Navbar } from './components/layout/Navbar';
import { SidebarMenu as Sidebar } from './components/layout/SidebarMenu';
import { BottomNav } from './components/layout/BottomNav';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { WalkthroughModal } from './components/onboarding/WalkthroughModal';
import { UpgradeModal } from './components/common/UpgradeModal';
import { ZenFocusModal } from './components/pomodoro/ZenFocusModal';
import { FocusAnalyticsModal } from './components/pomodoro/FocusAnalyticsModal';
import { FloatingFocusWidget } from './components/pomodoro/FloatingFocusWidget';

// Pages
const HomePage = React.lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const AITutorPage = React.lazy(() => import('./pages/AITutorPage').then(module => ({ default: module.AITutorPage })));
const LearnPage = React.lazy(() => import('./pages/LearnPage').then(module => ({ default: module.LearnPage })));
const PracticeQuizPage = React.lazy(() => import('./pages/PracticeQuizPage').then(module => ({ default: module.PracticeQuizPage })));
const WeaknessRadarPage = React.lazy(() => import('./pages/WeaknessRadarPage').then(module => ({ default: module.WeaknessRadarPage })));
const StudyPlanPage = React.lazy(() => import('./pages/StudyPlanPage').then(module => ({ default: module.StudyPlanPage })));
const ProgressPage = React.lazy(() => import('./pages/ProgressPage').then(module => ({ default: module.ProgressPage })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage').then(module => ({ default: module.AdminPage })));
const MistakesPage = React.lazy(() => import('./pages/MistakesPage').then(module => ({ default: module.MistakesPage })));
const ExamPage = React.lazy(() => import('./pages/ExamPage').then(module => ({ default: module.ExamPage })));
const ParentDashboardPage = React.lazy(() => import('./pages/ParentDashboardPage').then(module => ({ default: module.ParentDashboardPage })));
const TeacherDashboardPage = React.lazy(() => import('./pages/TeacherDashboardPage').then(module => ({ default: module.TeacherDashboardPage })));
import { AuthPage } from './pages/AuthPage';

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
      <React.Suspense fallback={<div className="flex h-[80vh] items-center justify-center text-slate-500 font-bold animate-pulse">Loading ${activeTab} view...</div>}>
        {(() => {
          switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'tutor':
        return <AITutorPage />;
      case 'learn':
      case 'notes':
        return <LearnPage />;
      case 'practice':
        return <PracticeQuizPage />;
      case 'radar':
      case 'revision':
        return <WeaknessRadarPage />;
      case 'plan':
        return <StudyPlanPage />;
      case 'progress':
        return <ProgressPage />;
      case 'mistakes':
        return <MistakesPage />;
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
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>
      <BottomNav />
      <OnboardingModal />
      <WalkthroughModal />
      <UpgradeModal />
      <ZenFocusModal />
      <FocusAnalyticsModal />
      <FloatingFocusWidget />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <FocusProvider>
          <AppContent />
        </FocusProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
