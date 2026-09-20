export interface CitationNavigationTarget {
  citationId?: string;
  bookTitle?: string;
  chapterId?: string;
  chapterName?: string;
  subjectId?: string;
  classLevel?: string;
  pageNumber: number;
  exactQuote?: string;
  highlightKeyword?: string;
  viewMode?: 'text' | 'pdf';
  source?: string;
}

const CITATION_EVENT_KEY = 'studypilot:open-pdf-citation';
const CITATION_STORAGE_KEY = 'studypilot_active_citation_target';

/**
 * Centrally triggers navigation to a specific NCERT textbook page and highlights content.
 */
export function navigateToCitation(target: CitationNavigationTarget): void {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CITATION_STORAGE_KEY, JSON.stringify(target));
      const event = new CustomEvent<CitationNavigationTarget>(CITATION_EVENT_KEY, {
        detail: target,
      });
      window.dispatchEvent(event);
    }
  } catch (e) {
    console.warn('[CitationNav] Failed to trigger citation navigation:', e);
  }
}

/**
 * Retrieves pending citation target if available.
 */
export function getActiveCitationTarget(): CitationNavigationTarget | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(CITATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clears pending citation target.
 */
export function clearActiveCitationTarget(): void {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CITATION_STORAGE_KEY);
    }
  } catch {
    // Ignore error
  }
}

/**
 * Subscribes a component (e.g., NCERTBooksPage or NCERTReader) to citation navigation events.
 */
export function onCitationNavigation(
  callback: (target: CitationNavigationTarget) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<CitationNavigationTarget>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };

  window.addEventListener(CITATION_EVENT_KEY, listener);
  return () => {
    window.removeEventListener(CITATION_EVENT_KEY, listener);
  };
}
