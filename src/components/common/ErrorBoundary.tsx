import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Home,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Bug,
  ShieldAlert,
} from 'lucide-react';
import { reportClientError } from '../../services/errorTelemetry';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  sectionName?: string;
  className?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
  showDetails: boolean;
  copied: boolean;
  isRecovering: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      showDetails: false,
      copied: false,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const eventId = reportClientError(error, errorInfo, {
      section: this.props.sectionName || 'Application',
    });

    this.setState({
      errorInfo,
      eventId,
    });

    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (cbErr) {
        console.warn('[ErrorBoundary] onError callback failed:', cbErr);
      }
    }
  }

  handleReset = (): void => {
    this.setState({ isRecovering: true });
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        eventId: null,
        showDetails: false,
        copied: false,
        isRecovering: false,
      });
    }, 150);
  };

  handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleClearCacheAndHome = (): void => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  handleCopyDetails = async (): Promise<void> => {
    const { error, errorInfo, eventId } = this.state;
    const details = [
      `StudyPilot AI Error Diagnostics`,
      `Event ID: ${eventId || 'N/A'}`,
      `Section: ${this.props.sectionName || 'Root'}`,
      `Timestamp: ${new Date().toISOString()}`,
      `Error Name: ${error?.name || 'Error'}`,
      `Message: ${error?.message || 'No message provided'}`,
      `\n--- Stack Trace ---`,
      error?.stack || 'No stack trace available',
      `\n--- Component Hierarchy ---`,
      errorInfo?.componentStack || 'No component stack available',
    ].join('\n');

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(details);
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 3000);
      }
    } catch (err) {
      console.warn('[ErrorBoundary] Failed to copy to clipboard:', err);
    }
  };

  toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, eventId, showDetails, copied, isRecovering } = this.state;
    const { children, fallback, sectionName, className } = this.props;

    if (hasError && error) {
      // Custom render prop fallback
      if (typeof fallback === 'function') {
        return fallback(error, this.handleReset);
      }

      // Custom ReactNode fallback
      if (fallback) {
        return fallback;
      }

      const isSubSection = Boolean(sectionName && sectionName !== 'Root' && sectionName !== 'Application');

      return (
        <div
          id={`error-boundary-${sectionName?.toLowerCase().replace(/\s+/g, '-') || 'root'}`}
          className={`flex flex-col items-center justify-center p-4 sm:p-8 ${
            isSubSection
              ? 'my-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 shadow-sm'
              : 'min-h-[70vh] w-full max-w-3xl mx-auto my-auto text-center'
          } ${className || ''}`}
        >
          <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-4">
            {/* Error Shield Icon */}
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 shadow-inner">
              <ShieldAlert className="w-8 h-8" />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
              </span>
            </div>

            {/* Heading & Context */}
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                {isSubSection ? `${sectionName} encountered an issue` : 'Something went wrong'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                An unexpected error occurred while rendering this section. Your study progress and saved data are intact.
              </p>
            </div>

            {/* Error Code / Event ID Badge */}
            {eventId && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                <Bug className="w-3 h-3 text-rose-500" />
                <span>Error Ref: {eventId}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 w-full">
              <button
                id="error-boundary-btn-retry"
                type="button"
                onClick={this.handleReset}
                disabled={isRecovering}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 min-h-[44px]"
              >
                <RotateCcw className={`w-4 h-4 ${isRecovering ? 'animate-spin' : ''}`} />
                <span>Try Again</span>
              </button>

              <button
                id="error-boundary-btn-reload"
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-300 dark:border-slate-700 transition-all min-h-[44px]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload</span>
              </button>

              <button
                id="error-boundary-btn-home"
                type="button"
                onClick={this.handleClearCacheAndHome}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-300 dark:border-slate-700 transition-all min-h-[44px]"
              >
                <Home className="w-4 h-4" />
                <span>Return Home</span>
              </button>
            </div>

            {/* Diagnostic Details Accordion */}
            <div className="w-full pt-3 text-left">
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
                <button
                  id="error-boundary-btn-toggle-diagnostics"
                  type="button"
                  onClick={this.toggleDetails}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors py-1 focus:outline-none"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>{showDetails ? 'Hide technical diagnostics' : 'Show technical diagnostics'}</span>
                  {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  id="error-boundary-btn-copy-diagnostics"
                  type="button"
                  onClick={this.handleCopyDetails}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all"
                  title="Copy error details for reporting"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Report</span>
                    </>
                  )}
                </button>
              </div>

              {showDetails && (
                <div
                  id="error-boundary-details-panel"
                  className="mt-3 p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner space-y-2 max-h-64 overflow-y-auto"
                >
                  <div className="text-rose-400 font-bold">
                    {error.name}: {error.message}
                  </div>
                  {error.stack && (
                    <div className="text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed">
                      {error.stack}
                    </div>
                  )}
                  {errorInfo?.componentStack && (
                    <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 whitespace-pre-wrap leading-relaxed">
                      <span className="text-slate-400 font-semibold block mb-1">Component Hierarchy:</span>
                      {errorInfo.componentStack}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}
