/**
 * Safe localStorage wrapper that protects against SSR / environments without localStorage
 */
export const safeGetStorage = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch (err) {
    console.warn(`[STORAGE] Failed to get ${key}:`, err);
  }
  return null;
};

export const safeSetStorage = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch (err) {
    console.warn(`[STORAGE] Failed to set ${key}:`, err);
  }
};

export const safeRemoveStorage = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn(`[STORAGE] Failed to remove ${key}:`, err);
  }
};
