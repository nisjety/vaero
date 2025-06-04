import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    statusCode,
    path: req.path,
    method: req.method,
    userId: (req as any).userId,
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    error: message,
    ...(isDevelopment && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found' });
};

export const createAppError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
