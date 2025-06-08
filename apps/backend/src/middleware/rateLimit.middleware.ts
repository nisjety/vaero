// middleware/rateLimit.middleware.ts - Rate limiting only for authenticated AI endpoints
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

// No rate limit for free tier / unauthenticated users
// This allows frontend to freely access weather data without restrictions

// Premium tier rate limit (per user, more generous)
export const premiumRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 5000 : 100, // Much higher limit in development
  keyGenerator: (req) => {
    // Rate limit by user ID for authenticated routes
    return (req as any).user?.id || req.ip;
  },
  message: {
    error: 'Too many premium requests',
    message: 'Premium tier limit: 100 requests per 15 minutes',
    tier: 'premium'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Premium tier rate limit exceeded for user: ${(req as any).user?.id}`, {
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Premium tier limit: 100 requests per 15 minutes',
      tier: 'premium',
      retryAfter: Math.round(15 * 60)
    });
  },
});

// AI-specific rate limit (stricter for expensive operations)
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 1000 : 10, // Much higher limit in development
  keyGenerator: (req) => {
    return (req as any).user?.id || req.ip;
  },
  message: {
    error: 'Too many AI requests',
    message: 'AI limit: 10 requests per minute',
    tier: 'premium'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`AI rate limit exceeded for user: ${(req as any).user?.id}`, {
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: 'AI rate limit exceeded',
      message: 'AI limit: 10 requests per minute',
      tier: 'premium',
      retryAfter: 60,
      cost: 'AI requests consume OpenAI tokens'
    });
  },
});

// General API rate limit (fallback)
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 50000 : 1000, // Very generous general limit, even higher in development
  message: {
    error: 'Too many requests from this IP',
    message: 'General limit: 1000 requests per 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`General rate limit exceeded for IP: ${req.ip}`, {
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'General limit: 1000 requests per 15 minutes',
      retryAfter: Math.round(15 * 60)
    });
  },
});

// Auth rate limit for Clerk authentication
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 auth attempts per IP
  message: {
    error: 'Too many authentication attempts',
    message: 'Auth limit: 20 attempts per 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`, {
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: 'Authentication rate limit exceeded',
      message: 'Too many authentication attempts',
      retryAfter: Math.round(15 * 60)
    });
  },
});






