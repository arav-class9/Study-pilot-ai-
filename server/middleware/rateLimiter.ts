import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
  lockedUntil: number | null;
}

// In-memory sliding window rate store
const ipAttempts = new Map<string, RateLimitRecord>();

const MAX_LOGIN_ATTEMPTS = 5;
const WINDOW_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipAttempts.entries()) {
    if (record.lockedUntil && now > record.lockedUntil) {
      ipAttempts.delete(key);
    } else if (!record.lockedUntil && now > record.resetTime) {
      ipAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Express middleware to rate-limit authentication and login requests by client IP / identifier.
 */
export const loginRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown_ip';
  const emailIdentifier = (req.body?.email ? String(req.body.email).toLowerCase().trim() : '') || 'guest';
  const key = `${clientIp}_${emailIdentifier}`;

  const now = Date.now();
  let record = ipAttempts.get(key);

  if (!record) {
    record = {
      count: 0,
      resetTime: now + WINDOW_DURATION_MS,
      lockedUntil: null,
    };
    ipAttempts.set(key, record);
  }

  // Check if IP is currently locked out
  if (record.lockedUntil) {
    if (now < record.lockedUntil) {
      const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        code: 'TOO_MANY_REQUESTS',
        error: `Too many login attempts from this IP address. Please wait ${Math.ceil(retryAfterSeconds / 60)} minutes before trying again.`,
        retryAfterSeconds,
      });
    } else {
      // Lockout expired
      record.count = 0;
      record.resetTime = now + WINDOW_DURATION_MS;
      record.lockedUntil = null;
    }
  }

  // Check if window expired
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + WINDOW_DURATION_MS;
  }

  next();
};

/**
 * Endpoint helper to record a failed login attempt on server.
 */
export function recordServerFailedAttempt(ip: string, email: string): { locked: boolean; retryAfterSeconds: number } {
  const key = `${ip}_${email.toLowerCase().trim()}`;
  const now = Date.now();
  let record = ipAttempts.get(key);

  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + WINDOW_DURATION_MS,
      lockedUntil: null,
    };
  }

  record.count += 1;

  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    ipAttempts.set(key, record);
    return {
      locked: true,
      retryAfterSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
    };
  }

  ipAttempts.set(key, record);
  return {
    locked: false,
    retryAfterSeconds: 0,
  };
}

/**
 * Resets failed attempts on successful auth
 */
export function clearServerFailedAttempt(ip: string, email: string): void {
  const key = `${ip}_${email.toLowerCase().trim()}`;
  ipAttempts.delete(key);
}
