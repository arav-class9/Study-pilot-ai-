import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { triggerHaptic } from '../utils/androidBridge';

interface UseAndroidNavigationOptions {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onExitApp?: () => void;
}

export function useAndroidNavigation({
  activeTab,
  setActiveTab,
  onExitApp,
}: UseAndroidNavigationOptions) {
  const lastBackPressRef = useRef<number>(0);
  const tabHistoryRef = useRef<string[]>(['home']);
  const isInternalNavigationRef = useRef<boolean>(false);

  // Sync tab history stack
  useEffect(() => {
    if (isInternalNavigationRef.current) {
      isInternalNavigationRef.current = false;
      return;
    }

    const currentStack = tabHistoryRef.current;
    if (currentStack[currentStack.length - 1] !== activeTab) {
      currentStack.push(activeTab);
      // Keep max 20 history states
      if (currentStack.length > 20) currentStack.shift();
      try {
        const canonical = ['workspace', 'topic-workspace', 'topic', 'topics'].includes(activeTab) ? 'workspace' : activeTab;
        const targetPath = canonical === 'home' ? '/' : `/${canonical}`;
        if (window.location.pathname !== targetPath) {
          window.history.pushState({ tab: activeTab }, '', targetPath);
        }
      } catch {
        // Safe fallback
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const handleBackEvent = (e?: PopStateEvent) => {
      triggerHaptic('selection');

      // Check if user is on a sub-view / non-home tab
      if (activeTab !== 'home') {
        const stack = tabHistoryRef.current;
        stack.pop(); // Remove current tab
        const previousTab = stack.length > 0 ? stack[stack.length - 1] : 'home';
        isInternalNavigationRef.current = true;
        setActiveTab(previousTab);
        return;
      }

      // If user is on home screen, implement double-press to exit (Standard Android Behavior)
      const now = Date.now();
      if (now - lastBackPressRef.current < 2500) {
        // User confirmed exit
        if (onExitApp) {
          onExitApp();
        } else {
          toast.dismiss('android-exit-toast');
          // Allow default browser/app exit
        }
      } else {
        lastBackPressRef.current = now;
        // Push state again so next back press triggers popstate again
        try {
          window.history.pushState({ tab: 'home' }, '', '');
        } catch {
          // ignore
        }
        toast('Press back again to exit StudyPilot AI', {
          id: 'android-exit-toast',
          icon: '📱',
          duration: 2500,
          style: {
            borderRadius: '24px',
            background: '#1e293b',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 700,
          },
        });
      }
    };

    // Listen for standard browser popstate
    window.addEventListener('popstate', handleBackEvent);
    // Listen for custom native Android back event from Kotlin MainActivity
    window.addEventListener('androidback', handleBackEvent as EventListener);

    return () => {
      window.removeEventListener('popstate', handleBackEvent);
      window.removeEventListener('androidback', handleBackEvent as EventListener);
    };
  }, [activeTab, setActiveTab, onExitApp]);
}
