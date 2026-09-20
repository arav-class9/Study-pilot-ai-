/**
 * Client-Side Login Rate Limiting Engine
 *
 * Configurable parameters:
 * - MAX_FAILED_ATTEMPTS: 5 attempts
 * - LOCKOUT_DURATION_MS: 15 minutes (900,000 ms)
 */

export interface RateLimitState {
  isLockedOut: boolean;
  attemptsCount: number;
  remainingAttempts: number;
  lockoutEndTime: number | null;
  cooldownSeconds: number;
}

const STORAGE_KEY = 'studypilot_login_attempts';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface AttemptRecord {
  count: number;
  firstAttemptTime: number;
  lockoutEndTime: number | null;
}

function getStoredRecord(identifier: string): AttemptRecord {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${identifier.toLowerCase().trim()}`);
    if (!raw) {
      return { count: 0, firstAttemptTime: Date.now(), lockoutEndTime: null };
    }
    return JSON.parse(raw);
  } catch {
    return { count: 0, firstAttemptTime: Date.now(), lockoutEndTime: null };
  }
}

function setStoredRecord(identifier: string, record: AttemptRecord): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${identifier.toLowerCase().trim()}`, JSON.stringify(record));
  } catch (err) {
    console.warn('Failed to save rate limit state:', err);
  }
}

/**
 * Checks current rate limit status for an email or account identifier.
 */
export function checkLoginRateLimit(identifier: string = 'global'): RateLimitState {
  const record = getStoredRecord(identifier);
  const now = Date.now();

  // If locked out, check if lockout period has expired
  if (record.lockoutEndTime) {
    if (now < record.lockoutEndTime) {
      const remainingMs = record.lockoutEndTime - now;
      const cooldownSeconds = Math.ceil(remainingMs / 1000);
      return {
        isLockedOut: true,
        attemptsCount: record.count,
        remainingAttempts: 0,
        lockoutEndTime: record.lockoutEndTime,
        cooldownSeconds,
      };
    } else {
      // Lockout expired, reset record
      clearFailedAttempts(identifier);
      return {
        isLockedOut: false,
        attemptsCount: 0,
        remainingAttempts: MAX_FAILED_ATTEMPTS,
        lockoutEndTime: null,
        cooldownSeconds: 0,
      };
    }
  }

  // Reset window if 15 minutes have passed since first attempt
  if (now - record.firstAttemptTime > LOCKOUT_DURATION_MS) {
    clearFailedAttempts(identifier);
    return {
      isLockedOut: false,
      attemptsCount: 0,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
      lockoutEndTime: null,
      cooldownSeconds: 0,
    };
  }

  const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - record.count);
  return {
    isLockedOut: record.count >= MAX_FAILED_ATTEMPTS,
    attemptsCount: record.count,
    remainingAttempts,
    lockoutEndTime: null,
    cooldownSeconds: 0,
  };
}

/**
 * Records a failed login attempt and updates rate limiting state.
 */
export function recordFailedLoginAttempt(identifier: string = 'global'): RateLimitState {
  const record = getStoredRecord(identifier);
  const now = Date.now();

  // If window expired, start fresh
  if (now - record.firstAttemptTime > LOCKOUT_DURATION_MS && !record.lockoutEndTime) {
    record.count = 0;
    record.firstAttemptTime = now;
  }

  record.count += 1;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockoutEndTime = now + LOCKOUT_DURATION_MS;
  }

  setStoredRecord(identifier, record);
  return checkLoginRateLimit(identifier);
}

/**
 * Resets/clears failed login attempts after a successful login.
 */
export function clearFailedAttempts(identifier: string = 'global'): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY}_${identifier.toLowerCase().trim()}`);
  } catch (err) {
    console.warn('Failed to clear rate limit state:', err);
  }
}

/**
 * Formats cooldown seconds into MM:SS string display.
 */
export function formatCooldownTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00';
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');
  return `${paddedMins}:${paddedSecs}`;
}
