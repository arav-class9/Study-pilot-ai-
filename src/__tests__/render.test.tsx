import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AuthProvider } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import { FocusProvider } from '../context/FocusContext';
import { AuthPage } from '../pages/AuthPage';
import { HomePage } from '../pages/HomePage';
import { AITutorPage } from '../pages/AITutorPage';
import { NCERTBooksPage } from '../pages/NCERTBooksPage';
import { PracticeQuizPage } from '../pages/PracticeQuizPage';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { OfflineIndicator } from '../components/common/OfflineIndicator';
import { LatexMath, FormulaSolver } from '../components/FormulaSolver';

describe('App components render test', () => {
  it('renders OfflineBanner without hook errors', () => {
    const html = renderToString(<OfflineBanner />);
    expect(typeof html).toBe('string');
  });

  it('renders OfflineIndicator without hook errors', () => {
    const html = renderToString(<OfflineIndicator />);
    expect(typeof html).toBe('string');
  });

  it('renders LatexMath without hook errors', () => {
    const html = renderToString(<LatexMath text="Calculate $E = mc^2$" />);
    expect(html).toContain('Calculate');
  });

  it('renders FormulaSolver without hook errors', () => {
    const html = renderToString(
      <AuthProvider>
        <AppProvider>
          <FocusProvider>
            <FormulaSolver />
          </FocusProvider>
        </AppProvider>
      </AuthProvider>
    );
    expect(typeof html).toBe('string');
  });

  it('renders AuthProvider and AppProvider', () => {
    const html = renderToString(
      <AuthProvider>
        <AppProvider>
          <FocusProvider>
            <div>Test Children</div>
          </FocusProvider>
        </AppProvider>
      </AuthProvider>
    );
    expect(typeof html).toBe('string');
  });

  it('renders AuthPage without hook errors', () => {
    const html = renderToString(
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    );
    expect(html).toContain('Study Pilot');
  });

  it('renders HomePage without hook errors', () => {
    const html = renderToString(
      <AuthProvider>
        <AppProvider>
          <FocusProvider>
            <HomePage />
          </FocusProvider>
        </AppProvider>
      </AuthProvider>
    );
    expect(typeof html).toBe('string');
  });

  it('renders AITutorPage without hook errors', () => {
    const html = renderToString(
      <AuthProvider>
        <AppProvider>
          <FocusProvider>
            <AITutorPage />
          </FocusProvider>
        </AppProvider>
      </AuthProvider>
    );
    expect(typeof html).toBe('string');
  });

  it('renders NCERTBooksPage without hook errors', () => {
    const html = renderToString(
      <AuthProvider>
        <AppProvider>
          <FocusProvider>
            <NCERTBooksPage />
          </FocusProvider>
        </AppProvider>
      </AuthProvider>
    );
    expect(typeof html).toBe('string');
  });

  it('renders PracticeQuizPage without hook errors', () => {
    const html = renderToString(
      <AuthProvider>
        <AppProvider>
          <FocusProvider>
            <PracticeQuizPage />
          </FocusProvider>
        </AppProvider>
      </AuthProvider>
    );
    expect(typeof html).toBe('string');
  });
});
