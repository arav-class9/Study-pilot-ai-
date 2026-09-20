/**
 * Centralized Error Telemetry & Crash Reporting Service for StudyPilot AI
 */

export interface ClientErrorReport {
  eventId: string;
  timestamp: string;
  name: string;
  message: string;
  stack?: string;
  componentStack?: string;
  section?: string;
  url?: string;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
  online?: boolean;
  metadata?: Record<string, any>;
}

const STORAGE_KEY_ERRORS = 'studypilot_error_telemetry_v1';
const MAX_STORED_ERRORS = 20;

/**
 * Capture and record a frontend JavaScript error
 */
export function reportClientError(
  error: Error,
  errorInfo?: { componentStack?: string | null },
  metadata?: Record<string, any>
): string {
  const eventId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();

  const report: ClientErrorReport = {
    eventId,
    timestamp,
    name: error?.name || 'Error',
    message: error?.message || String(error),
    stack: error?.stack,
    componentStack: errorInfo?.componentStack || undefined,
    section: metadata?.section || 'Unknown',
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    viewport: typeof window !== 'undefined' ? { width: window.innerWidth, height: window.innerHeight } : undefined,
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    metadata,
  };

  // 1. Console Log with clear structured formatting
  console.group(`🚨 [StudyPilot Error Telemetry] Event ID: ${eventId}`);
  console.error('Error Object:', error);
  if (errorInfo?.componentStack) {
    console.error('Component Stack:', errorInfo.componentStack);
  }
  console.info('Diagnostics:', report);
  console.groupEnd();

  // 2. Persist in session storage / ring buffer for diagnostic export
  try {
    if (typeof sessionStorage !== 'undefined') {
      const existingRaw = sessionStorage.getItem(STORAGE_KEY_ERRORS);
      const list: ClientErrorReport[] = existingRaw ? JSON.parse(existingRaw) : [];
      list.unshift(report);
      if (list.length > MAX_STORED_ERRORS) {
        list.length = MAX_STORED_ERRORS;
      }
      sessionStorage.setItem(STORAGE_KEY_ERRORS, JSON.stringify(list));
    }
  } catch {
    // ignore storage quota / sandbox restrictions
  }

  // 3. Dispatch global event for in-app alert or notification subscribers
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('studypilot:error-captured', {
          detail: report,
        })
      );
    } catch {
      // ignore
    }
  }

  // 4. Asynchronously send telemetry to server (silent failover)
  if (typeof fetch !== 'undefined') {
    try {
      fetch('/api/telemetry/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
        keepalive: true,
      }).catch((err) => {
        console.warn('[TELEMETRY] Server beacon skipped:', err?.message);
      });
    } catch {
      // ignore
    }
  }

  return eventId;
}

/**
 * Retrieve recent client errors
 */
export function getErrorHistory(): ClientErrorReport[] {
  try {
    if (typeof sessionStorage !== 'undefined') {
      const existing = sessionStorage.getItem(STORAGE_KEY_ERRORS);
      return existing ? JSON.parse(existing) : [];
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Clear stored error history
 */
export function clearErrorHistory(): void {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY_ERRORS);
    }
  } catch {
    // ignore
  }
}
