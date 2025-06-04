import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

// General API rate limit
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later',
    });
  },
});

// Strict rate limit for AI endpoints
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each user to 5 AI requests per minute
  keyGenerator: (req) => {
    // Rate limit by user ID instead of IP for authenticated routes
    return (req as any).userId || req.ip;
  },
  message: {
    error: 'Too many AI requests, please wait a moment before trying again',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`AI rate limit exceeded for user: ${(req as any).userId}`, {
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: 'Too many AI requests, please wait a moment before trying again',
    });
  },
});

// Auth rate limit for login attempts
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`, {
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later',
    });
  },
});
