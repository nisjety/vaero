// middleware/performance.middleware.ts - Performance monitoring
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface PerformanceRequest extends Request {
  startTime?: number;
}

export const performanceMiddleware = (
  req: PerformanceRequest,
  res: Response,
  next: NextFunction
) => {
  req.startTime = Date.now();
  
  // Log request start
  logger.debug('Request started', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Override res.end to capture response time
  const originalEnd = res.end.bind(res);
  res.end = function(...args: any[]): Response {
    const responseTime = Date.now() - (req.startTime || 0);
    
    // Log performance metrics
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
      tier: req.path.includes('/ai/') ? 'premium' : 'free'
    });
    
    // Add performance headers
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('X-Tier', req.path.includes('/ai/') ? 'premium' : 'free');
    
    // Call original end
    return originalEnd(...args);
  };
  
  next();
};