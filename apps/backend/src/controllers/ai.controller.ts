import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  generateDailySummary,
  generateActivitySuggestion,
  generatePackingList,
  askAIQuestion,
} from '../services/openai.service';
import { logger } from '../utils/logger';
import { prisma } from '../utils/database';

const coordinatesSchema = z.object({
  lat: z.string().transform((val) => parseFloat(val)),
  lon: z.string().transform((val) => parseFloat(val)),
});

const dateSchema = z.object({
  date: z.string().optional(),
});

const packingListSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  startDate: z.string(),
  endDate: z.string(),
});

const questionSchema = z.object({
  question: z.string().max(500, 'Question too long'),
});

export const getDailySummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lat, lon } = coordinatesSchema.parse(req.query);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Check if we already have a daily summary for today
    const today = new Date().toDateString();
    const existingSummary = await prisma.aIHistory.findFirst({
      where: {
        userId: req.user.id,
        type: 'dailySummary',
        timestamp: {
          gte: new Date(today),
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    if (existingSummary) {
      return res.json({ summary: existingSummary.aiResponse });
    }

    const summary = await generateDailySummary(lat, lon, req.user.id);

    logger.info(`Daily summary generated for user ${req.user.id}`, {
      lat,
      lon,
    });

    res.json({ summary });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    }
    logger.error('Failed to get daily summary:', error);
    res.status(500).json({ error: 'Failed to get daily summary' });
  }
};

export const getActivitySuggestion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coordinates = coordinatesSchema.parse(req.query);
    const dateQuery = dateSchema.parse(req.query);
    
    const { lat, lon } = coordinates;
    const { date } = dateQuery;

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    // Check if we already have an activity suggestion for this date
    const existingSuggestion = await prisma.aIHistory.findFirst({
      where: {
        userId: req.user.id,
        type: 'activitySuggestion',
        metadata: {
          path: ['date'],
          equals: targetDate,
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    if (existingSuggestion) {
      const metadata = existingSuggestion.metadata as any;
      return res.json({
        activity: metadata.activity,
        reason: existingSuggestion.aiResponse,
      });
    }

    const suggestion = await generateActivitySuggestion(lat, lon, targetDate, req.user.id);

    logger.info(`Activity suggestion generated for user ${req.user.id}`, {
      lat,
      lon,
      date: targetDate,
    });

    res.json(suggestion);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    }
    logger.error('Failed to get activity suggestion:', error);
    res.status(500).json({ error: 'Failed to get activity suggestion' });
  }
};

export const getPackingList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = packingListSchema.parse(req.body);
    const { lat, lon, startDate, endDate } = validatedData;

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }

    if (end.getTime() - start.getTime() > 30 * 24 * 60 * 60 * 1000) {
      return res.status(400).json({ error: 'Date range too long (max 30 days)' });
    }

    const packingList = await generatePackingList(lat, lon, startDate, endDate, req.user.id);

    logger.info(`Packing list generated for user ${req.user.id}`, {
      lat,
      lon,
      startDate,
      endDate,
    });

    res.json(packingList);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    logger.error('Failed to generate packing list:', error);
    res.status(500).json({ error: 'Failed to generate packing list' });
  }
};

export const askAI = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { question } = questionSchema.parse(req.body);

    const answer = await askAIQuestion(question, req.user.id);

    logger.info(`AI question answered for user ${req.user.id}`, {
      questionLength: question.length,
    });

    res.json({ answer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    logger.error('Failed to process AI question:', error);
    res.status(500).json({ error: 'Failed to process AI question' });
  }
};

export const getAIHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const type = req.query.type as string;

    const where: any = { userId: req.user.id };
    if (type) {
      where.type = type;
    }

    const history = await prisma.aIHistory.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        type: true,
        timestamp: true,
        aiResponse: true,
        metadata: true,
      },
    });

    const total = await prisma.aIHistory.count({ where });

    res.json({
      history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Failed to get AI history:', error);
    res.status(500).json({ error: 'Failed to get AI history' });
  }
};
