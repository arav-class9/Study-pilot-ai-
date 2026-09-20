import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, AlertCircle, CloudOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      id="offline-status-banner"
      role="alert"
      aria-live="assertive"
      className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md border-b border-amber-600 transition-all z-50 sticky top-0"
    >
      <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <CloudOff className="w-4 h-4 text-slate-950 shrink-0 animate-pulse" />
          <span>
            <strong>Offline Mode Active:</strong> You are currently disconnected. Cached textbook pages, saved notes, and offline study plans remain accessible. AI queries will resume once reconnected.
          </span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="hidden sm:inline-flex items-center gap-1.5 bg-slate-950 text-amber-300 hover:bg-slate-900 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
};
