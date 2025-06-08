// middleware/validation.middleware.ts - Request validation
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validateLocationQuery = (req: Request, res: Response, next: NextFunction) => {
  const locationSchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lon: z.coerce.number().min(-180).max(180),
    altitude: z.coerce.number().optional()
  });
  
  try {
    const validated = locationSchema.parse(req.query);
    req.query = validated as any;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid location parameters',
        details: error.errors,
        valid_range: {
          lat: '[-90, 90]',
          lon: '[-180, 180]',
          altitude: 'optional number'
        }
      });
    }
    next(error);
  }
};

export const validatePaginationQuery = (req: Request, res: Response, next: NextFunction) => {
  const paginationSchema = z.object({
    page: z.coerce.number().min(1).max(1000).default(1),
    limit: z.coerce.number().min(1).max(100).default(20)
  });
  
  try {
    const validated = paginationSchema.parse(req.query);
    req.query = { ...req.query, ...validated } as any;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid pagination parameters',
        details: error.errors,
        valid_range: {
          page: '[1, 1000]',
          limit: '[1, 100]'
        }
      });
    }
    next(error);
  }
};