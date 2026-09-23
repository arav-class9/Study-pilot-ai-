import { Request, Response, NextFunction } from 'express';
import { adminAuth, adminDb, FieldValue } from '../firebaseAdmin.ts';

export interface AuthenticatedQuotaRequest extends Request {
  user?: any;
  userTier?: 'free' | 'plus' | 'pro';
  remainingQuota?: number;
}

export const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  plus: 100,
  pro: 99999,
};

/**
 * Express middleware to authenticate Firebase tokens and enforce atomic server-side quota limits.
 */
export const authenticateAndEnforceQuota = async (
  req: AuthenticatedQuotaRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Authentication token required.',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token || token === 'undefined' || token === 'null') {
    res.status(401).json({
      error: 'Valid authentication token required.',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  let decodedUser: any;
  try {
    decodedUser = await adminAuth.verifyIdToken(token);
    req.user = decodedUser;
  } catch (authError: any) {
    console.warn('[AUTH] Token verification failed:', authError.message);
    res.status(401).json({
      error: 'Invalid or expired authentication token. Please sign in again.',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  const userId = decodedUser.uid;

  try {
    // 1. Fetch user subscription tier
    let plan = 'free';
    try {
      const subDoc = await adminDb.collection('subscriptions').doc(userId).get();
      if (subDoc.exists) {
        const subData = subDoc.data();
        plan = subData?.plan || subData?.subscriptionPlan || 'free';
      }
    } catch (subErr) {
      console.warn(`[QUOTA] Could not read subscription for ${userId}, defaulting to free plan`, subErr);
      plan = 'free';
    }

    const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
    req.userTier = plan as 'free' | 'plus' | 'pro';

    // 2. Atomic Firestore transaction on usageLimits/{userId}
    const usageRef = adminDb.collection('usageLimits').doc(userId);

    let quotaResult: { allowed: boolean; currentUsage: number } = { allowed: false, currentUsage: 0 };

    await adminDb.runTransaction(async (transaction: any) => {
      const usageDoc = await transaction.get(usageRef);
      let currentUsage = 0;

      if (usageDoc.exists) {
        const data = usageDoc.data();
        currentUsage = Number(data?.aiQuestions) || 0;
      }

      if (currentUsage >= limit) {
        quotaResult = { allowed: false, currentUsage };
        return;
      }

      // Increment atomically in transaction
      transaction.set(
        usageRef,
        {
          aiQuestions: FieldValue.increment(1),
          plan,
          userId,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      quotaResult = { allowed: true, currentUsage: currentUsage + 1 };
    });

    if (!quotaResult.allowed) {
      res.status(403).json({
        code: 'QUOTA_EXCEEDED',
        message: 'Plan limit reached. Please upgrade to continue asking questions.',
        currentUsage: quotaResult.currentUsage,
        limit,
        plan,
      });
      return;
    }

    req.remainingQuota = Math.max(0, limit - quotaResult.currentUsage);
    next();
  } catch (error: any) {
    console.error('[QUOTA ERROR] Error verifying quota transaction:', error);
    // On unexpected database transport fault, allow fail-open or log gracefully
    next();
  }
};
