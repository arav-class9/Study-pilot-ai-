/**
 * Android Bridge & Native System Utilities
 * Provides haptic feedback, safe area queries, and native Android communication.
 */

export const triggerHaptic = (type: 'selection' | 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'selection') => {
  if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) {
    return;
  }

  try {
    switch (type) {
      case 'selection':
        window.navigator.vibrate(8);
        break;
      case 'light':
        window.navigator.vibrate(15);
        break;
      case 'medium':
        window.navigator.vibrate(25);
        break;
      case 'heavy':
        window.navigator.vibrate(40);
        break;
      case 'success':
        window.navigator.vibrate([10, 50, 15]);
        break;
      case 'warning':
        window.navigator.vibrate([20, 70, 20]);
        break;
      case 'error':
        window.navigator.vibrate([30, 80, 30, 80, 30]);
        break;
      default:
        window.navigator.vibrate(10);
    }
  } catch {
    // Gracefully ignore vibration errors on unsupported devices
  }
};

export const isAndroidDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
};

export const isStandaloneAndroidApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes('android-app://');
  return isAndroidDevice() && isStandalone;
};

/**
 * Sends a message to the native Android host activity if running inside
 * the StudyPilot Android application.
 */
export const postToAndroidHost = (action: string, payload: any = {}) => {
  try {
    if ((window as any).StudyPilotNative && typeof (window as any).StudyPilotNative.postMessage === 'function') {
      (window as any).StudyPilotNative.postMessage(JSON.stringify({ action, ...payload }));
    }
  } catch (err) {
    console.warn('[AndroidBridge] Failed to post message to native host:', err);
  }
};
