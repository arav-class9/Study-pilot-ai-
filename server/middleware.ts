import { Request, Response, NextFunction } from 'express';
import { adminAuth } from './firebaseAdmin.js';

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


