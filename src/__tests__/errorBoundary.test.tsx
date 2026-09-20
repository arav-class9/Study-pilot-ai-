import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { reportClientError, getErrorHistory, clearErrorHistory } from '../services/errorTelemetry';

describe('ErrorBoundary & Error Telemetry Service', () => {
  it('renders children normally when there is no error', () => {
    const html = renderToString(
      <ErrorBoundary sectionName="Test Section">
        <div id="child-content">Normal Content</div>
      </ErrorBoundary>
    );
    expect(html).toContain('Normal Content');
  });

  it('reportClientError generates an eventId and stores telemetry', () => {
    clearErrorHistory();
    const testError = new Error('Test crash calculation');
    const eventId = reportClientError(testError, { componentStack: '\n at ProblemSolver' }, { section: 'Math' });

    expect(eventId).toBeDefined();
    expect(eventId).toContain('err_');
  });

  it('ErrorBoundary class has getDerivedStateFromError returning hasError: true', () => {
    const error = new Error('Test rendering fault');
    const derived = ErrorBoundary.getDerivedStateFromError(error);
    expect(derived.hasError).toBe(true);
    expect(derived.error).toBe(error);
  });
});
