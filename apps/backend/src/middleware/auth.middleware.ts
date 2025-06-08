// middleware/auth.middleware.ts - Optimized Clerk authentication
import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, getAuth } from '@clerk/express';
import { env } from '../utils/env';
import { logger } from '../utils/logger';
import { prisma } from '../utils/database';

// Extend Express Request with authentication data
export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
  auth?: any;
}

// Create Clerk middleware
const clerkAuth = clerkMiddleware({
  publishableKey: env.CLERK_PUBLISHABLE_KEY,
  secretKey: env.CLERK_SECRET_KEY,
});

/**
 * Authentication middleware for premium features
 * Only applies to routes that require user authentication
 */
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Apply Clerk middleware first
    return clerkAuth(req, res, async () => {
      try {
        // Get auth data from Clerk
        const auth = getAuth(req);
        
        if (!auth || !auth.userId) {
          return res.status(401).json({ 
            error: 'Authentication required',
            message: 'This endpoint requires premium access',
            tier: 'premium',
            login: 'Please sign in with Clerk'
          });
        }

        req.userId = auth.userId;
        req.auth = auth;

        // Find or create user in our database
        const user = await findOrCreateUser(auth.userId);
        req.user = user;
        
        // Log successful authentication
        logger.debug(`User authenticated: ${auth.userId}`, {
          path: req.path,
          method: req.method
        });
        
        next();
      } catch (error) {
        logger.error('Authentication processing error:', error);
        res.status(401).json({ 
          error: 'Authentication failed',
          message: 'Unable to verify authentication',
          tier: 'premium'
        });
      }
    });
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Authentication service unavailable'
    });
  }
};

/**
 * Optional authentication middleware
 * Adds user data if authenticated, but doesn't block if not
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    return clerkAuth(req, res, async () => {
      try {
        const auth = getAuth(req);
        
        if (auth && auth.userId) {
          req.userId = auth.userId;
          req.auth = auth;
          
          // Try to get user data, but don't fail if it doesn't exist
          try {
            const user = await findOrCreateUser(auth.userId);
            req.user = user;
          } catch (userError) {
            logger.warn('Failed to load user data for optional auth:', userError);
          }
        }
        
        next();
      } catch (error) {
        // Don't fail for optional auth errors
        logger.debug('Optional auth failed, continuing without auth:', error);
        next();
      }
    });
  } catch (error) {
    // Don't fail for optional auth errors
    logger.debug('Optional auth middleware error, continuing:', error);
    next();
  }
};

/**
 * Find or create user in database
 */
export const findOrCreateUser = async (clerkUserId: string) => {
  return prisma.user.upsert({
    where: { clerkUserId },
    update: { 
      updatedAt: new Date(),
      lastActive: new Date()
    },
    create: { 
      clerkUserId,
      lastActive: new Date()
    },
    include: {
      prefs: true,
      devices: true,
    },
  });
};

/**
 * Development test authentication (only in development)
 */
export const testAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (env.NODE_ENV !== 'development') {
    return res.status(403).json({ 
      error: 'Test auth only available in development' 
    });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (token === 'test-token') {
    req.userId = 'test-user-id';
    req.user = { 
      id: 1, 
      clerkUserId: 'test-user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: new Date()
    };
    return next();
  }

  // Fall back to regular auth
  return authenticateUser(req, res, next);
};
