import { Request, Response, NextFunction } from 'express';
import { adminAuth, adminDb, FieldValue } from './firebaseAdmin.ts';
export { authenticateAndEnforceQuota, PLAN_LIMITS } from './middleware/quotaAuth.ts';
export type { AuthenticatedQuotaRequest } from './middleware/quotaAuth.ts';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = { uid: 'guest-user', email: 'guest@studypilot.ai' };
    next();
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token || token === 'undefined' || token === 'null') {
    req.user = { uid: 'guest-user', email: 'guest@studypilot.ai' };
    next();
    return;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.warn('Auth verification failed, falling back to guest user:', error);
    req.user = { uid: 'guest-user', email: 'guest@studypilot.ai' };
    next();
  }
};

export const checkUsageLimits = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user;
  if (!user || !user.uid) {
    next();
    return;
  }

  const userId = user.uid;

  // Guest users or admin users bypass quota check
  if (userId === 'guest-user' || user.admin === true || user.role === 'admin') {
    next();
    return;
  }

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
      console.warn(`[QUOTA] Could not read subscription for ${userId}, defaulting to free plan:`, subErr);
      plan = 'free';
    }

    const limits: Record<string, number> = {
      free: 10,
      plus: 100,
      pro: 99999,
    };
    const limit = limits[plan] ?? limits.free;

    // 2. Fetch current usage count
    const usageRef = adminDb.collection('usageLimits').doc(userId);
    const usageDoc = await usageRef.get();
    let currentUsage = 0;
    if (usageDoc.exists) {
      const data = usageDoc.data();
      currentUsage = Number(data?.aiQuestions) || 0;
    }

    if (currentUsage >= limit) {
      res.status(403).json({
        code: 'QUOTA_EXCEEDED',
        error: 'Plan limit reached. Please upgrade to continue asking questions.',
        message: 'Plan limit reached. Please upgrade to continue asking questions.',
        currentUsage,
        limit,
        plan,
      });
      return;
    }

    // 3. Atomically increment aiQuestions on the server using FieldValue.increment(1)
    await usageRef.set(
      {
        aiQuestions: FieldValue.increment(1),
        plan,
        userId,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    next();
  } catch (error: any) {
    console.error('[CHECK_USAGE_LIMITS ERROR]:', error);
    // On unexpected database transport fault, allow fail-open
    next();
  }
};



