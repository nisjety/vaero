import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { env } from '../utils/env';
import { logger } from '../utils/logger';
import { prisma } from '../utils/database';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
  body: any;
  params: any;
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Clerk
    const sessionClaims = await clerkClient.verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    if (!sessionClaims || !sessionClaims.sub) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.userId = sessionClaims.sub;
    
    // Find or create user in our database
    const user = await findOrCreateUser(sessionClaims.sub);
    req.user = user;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};export const findOrCreateUser = async (clerkUserId: string) => {
  return prisma.user.upsert({
    where: { clerkUserId },
    update: { updatedAt: new Date() },
    create: { clerkUserId },
    include: {
      prefs: true,
      devices: true,
    },
  });
};

export { AuthenticatedRequest };