// controllers/ai.controller.ts - Premium OpenAI features (auth required)
import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { prisma } from '../utils/database';
import { redis } from '../utils/redis';
import {
  generateClothingSuggestion,
  generateDailySummary,
  generateActivitySuggestion,
  generatePackingList,
  askAIQuestion,
} from '../services/openai.service';
import weatherAIFactory from '../utils/weatherAIFactory';

// Input validation schemas
const locationSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180)
});

const packingListSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  startDate: z.string(),
  endDate: z.string(),
  tripType: z.enum(['business', 'leisure', 'outdoor', 'city']).optional()
});

const questionSchema = z.object({
  question: z.string().min(1).max(500),
  context: z.enum(['weather', 'clothing', 'activity', 'general']).optional()
});

/**
 * Get personalized clothing suggestions using OpenAI + user preferences
 */
export const getPersonalizedClothing = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lat, lon } = locationSchema.parse(req.query);
    
    // Check daily limit for this user
    const dailyUsage = await checkDailyUsage(req.user.id, 'clothing');
    if (dailyUsage >= 10) { // 10 clothing suggestions per day
      return res.status(429).json({ 
        error: 'Daily limit exceeded',
        message: 'You have reached your daily limit for personalized clothing suggestions',
        limit: 10,
        resetTime: getNextMidnight()
      });
    }
    
    // Get user preferences
    const userPrefs = await prisma.userPrefs.findUnique({
      where: { userId: req.user.id },
    });
    
    // Get enhanced weather data
    const enhancedYrService = weatherAIFactory.getEnhancedYrService();
    const weatherData = await enhancedYrService.getEnhancedWeather(lat, lon);
    
    // Generate personalized clothing suggestion using OpenAI
    const suggestion = await generateClothingSuggestion(
      req.user.id,
      weatherData,
      userPrefs
    );
    
    // Track usage
    await trackUsage(req.user.id, 'clothing');
    
    res.json({
      location: { lat, lon },
      weather: {
        temperature: weatherData.current.temperature,
        condition: weatherData.current.symbol_code,
        wind: weatherData.current.wind_speed,
        humidity: weatherData.current.humidity
      },
      clothing: {
        items: suggestion.items,
        explanation: suggestion.explanation,
        personalized: true,
        style_preferences: userPrefs?.stylePreferences || null
      },
      usage: {
        daily_count: dailyUsage + 1,
        daily_limit: 10
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid parameters',
        details: error.errors
      });
    }
    logger.error('Error generating personalized clothing advice:', error);
    res.status(500).json({ error: 'Failed to generate clothing suggestions' });
  }
};

/**
 * Get personalized activity suggestions
 */
export const getPersonalizedActivity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lat, lon } = locationSchema.parse(req.query);
    const date = req.query.date as string || new Date().toISOString().split('T')[0];
    
    // Check daily limit
    const dailyUsage = await checkDailyUsage(req.user.id, 'activity');
    if (dailyUsage >= 8) {
      return res.status(429).json({ 
        error: 'Daily limit exceeded',
        message: 'You have reached your daily limit for personalized activity suggestions',
        limit: 8,
        resetTime: getNextMidnight()
      });
    }
    
    const suggestion = await generateActivitySuggestion(lat, lon, date, req.user.id);
    
    await trackUsage(req.user.id, 'activity');
    
    res.json({
      location: { lat, lon },
      date,
      activity: {
        recommended: suggestion.activity,
        reason: suggestion.reason,
        personalized: true
      },
      usage: {
        daily_count: dailyUsage + 1,
        daily_limit: 8
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid parameters',
        details: error.errors
      });
    }
    logger.error('Error generating personalized activity advice:', error);
    res.status(500).json({ error: 'Failed to generate activity suggestions' });
  }
};

/**
 * Get daily weather summary
 */
export const getDailySummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lat, lon } = locationSchema.parse(req.query);
    
    // Check if we have a cached summary for today
    const today = new Date().toDateString();
    const cacheKey = `daily_summary:${req.user.id}:${lat}:${lon}:${today}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        location: { lat, lon },
        summary: JSON.parse(cached),
        cached: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check daily limit
    const dailyUsage = await checkDailyUsage(req.user.id, 'summary');
    if (dailyUsage >= 3) {
      return res.status(429).json({ 
        error: 'Daily limit exceeded',
        message: 'You have reached your daily limit for weather summaries',
        limit: 3,
        resetTime: getNextMidnight()
      });
    }
    
    const summary = await generateDailySummary(lat, lon, req.user.id);
    
    // Cache for 6 hours
    await redis.set(cacheKey, JSON.stringify({ text: summary }), 'EX', 21600);
    
    await trackUsage(req.user.id, 'summary');
    
    res.json({
      location: { lat, lon },
      summary: { text: summary },
      cached: false,
      usage: {
        daily_count: dailyUsage + 1,
        daily_limit: 3
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid parameters',
        details: error.errors
      });
    }
    logger.error('Error generating daily summary:', error);
    res.status(500).json({ error: 'Failed to generate daily summary' });
  }
};

/**
 * Generate travel packing lists
 */
export const getPackingList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lat, lon, startDate, endDate, tripType } = packingListSchema.parse(req.body);
    
    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }
    
    if (end.getTime() - start.getTime() > 30 * 24 * 60 * 60 * 1000) {
      return res.status(400).json({ error: 'Date range too long (max 30 days)' });
    }
    
    // Check weekly limit for packing lists
    const weeklyUsage = await checkWeeklyUsage(req.user.id, 'packing');
    if (weeklyUsage >= 5) {
      return res.status(429).json({ 
        error: 'Weekly limit exceeded',
        message: 'You have reached your weekly limit for packing lists',
        limit: 5,
        resetTime: getNextSunday()
      });
    }
    
    const packingList = await generatePackingList(lat, lon, startDate, endDate, req.user.id);
    
    await trackUsage(req.user.id, 'packing');
    
    res.json({
      location: { lat, lon },
      trip: {
        startDate,
        endDate,
        duration: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
        type: tripType
      },
      packing: {
        items: packingList.items,
        notes: packingList.notes,
        personalized: true
      },
      usage: {
        weekly_count: weeklyUsage + 1,
        weekly_limit: 5
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    }
    logger.error('Error generating packing list:', error);
    res.status(500).json({ error: 'Failed to generate packing list' });
  }
};

/**
 * Ask custom AI questions
 */
export const askAI = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { question, context } = questionSchema.parse(req.body);
    
    // Check daily limit for AI questions
    const dailyUsage = await checkDailyUsage(req.user.id, 'question');
    if (dailyUsage >= 15) {
      return res.status(429).json({ 
        error: 'Daily limit exceeded',
        message: 'You have reached your daily limit for AI questions',
        limit: 15,
        resetTime: getNextMidnight()
      });
    }
    
    const answer = await askAIQuestion(question, req.user.id);
    
    await trackUsage(req.user.id, 'question');
    
    res.json({
      question,
      answer,
      context: context || 'general',
      usage: {
        daily_count: dailyUsage + 1,
        daily_limit: 15
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    }
    logger.error('Error processing AI question:', error);
    res.status(500).json({ error: 'Failed to process AI question' });
  }
};

/**
 * Get smart notifications based on user preferences and weather
 */
export const getSmartNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userPrefs = await prisma.userPrefs.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          include: {
            weatherSnapshot: true
          }
        }
      }
    });
    
    if (!userPrefs?.defaultLat || !userPrefs?.defaultLon) {
      return res.json({
        notifications: [],
        message: 'Set your default location in preferences to receive smart notifications'
      });
    }
    
    // Get current weather for user's location
    const enhancedYrService = weatherAIFactory.getEnhancedYrService();
    const weatherData = await enhancedYrService.getEnhancedWeather(
      userPrefs.defaultLat, 
      userPrefs.defaultLon
    );
    
    const notifications = await generateSmartNotifications(
      req.user.id,
      weatherData,
      userPrefs
    );
    
    res.json({
      location: {
        lat: userPrefs.defaultLat,
        lon: userPrefs.defaultLon
      },
      notifications,
      count: notifications.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error generating smart notifications:', error);
    res.status(500).json({ error: 'Failed to generate smart notifications' });
  }
};

/**
 * Get AI interaction history
 */
export const getAIHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const type = req.query.type as string;
    
    const where: any = { userId: req.user.id };
    if (type) {
      where.type = type;
    }
    
    const [history, total] = await Promise.all([
      prisma.aIHistory.findMany({
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
      }),
      prisma.aIHistory.count({ where })
    ]);
    
    // Calculate usage stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const usageStats = await prisma.aIHistory.groupBy({
      by: ['type'],
      where: {
        userId: req.user.id,
        timestamp: { gte: today }
      },
      _count: true
    });
    
    res.json({
      history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      usage: {
        today: usageStats.reduce((acc, stat) => {
          acc[stat.type] = stat._count;
          return acc;
        }, {} as Record<string, number>)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting AI history:', error);
    res.status(500).json({ error: 'Failed to get AI history' });
  }
};

// Helper functions for usage tracking and limits
async function checkDailyUsage(userId: number, type: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return await prisma.aIHistory.count({
    where: {
      userId,
      type,
      timestamp: { gte: today }
    }
  });
}

async function checkWeeklyUsage(userId: number, type: string): Promise<number> {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  return await prisma.aIHistory.count({
    where: {
      userId,
      type,
      timestamp: { gte: startOfWeek }
    }
  });
}

async function trackUsage(userId: number, type: string): Promise<void> {
  // This is automatically tracked when creating AIHistory records in the OpenAI service
  // But we could add additional tracking here if needed
}

function getNextMidnight(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

function getNextSunday(): string {
  const nextSunday = new Date();
  nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
  nextSunday.setHours(0, 0, 0, 0);
  return nextSunday.toISOString();
}

async function generateSmartNotifications(userId: number, weatherData: any, userPrefs: any): Promise<any[]> {
  const notifications: any[] = [];
  const current = weatherData.current;
  
  // Temperature alerts
  if (userPrefs.notifTempBelow && current.temperature < userPrefs.notifTempBelow) {
    notifications.push({
      type: 'temperature_alert',
      priority: 'high',
      title: 'Cold Weather Alert',
      message: `Temperature is ${current.temperature}°C, below your ${userPrefs.notifTempBelow}°C threshold`,
      action: 'Check clothing suggestions'
    });
  }
  
  if (userPrefs.notifTempAbove && current.temperature > userPrefs.notifTempAbove) {
    notifications.push({
      type: 'temperature_alert',
      priority: 'medium',
      title: 'Hot Weather Alert',
      message: `Temperature is ${current.temperature}°C, above your ${userPrefs.notifTempAbove}°C threshold`,
      action: 'Stay hydrated and cool'
    });
  }
  
  // Rain alerts
  if (userPrefs.notifRainProb && current.precip_prob > userPrefs.notifRainProb) {
    notifications.push({
      type: 'rain_alert',
      priority: 'medium',
      title: 'Rain Expected',
      message: `${current.precip_prob}% chance of rain, above your ${userPrefs.notifRainProb}% threshold`,
      action: 'Take an umbrella'
    });
  }
  
  // Comfort suggestions
  const comfort = assessWeatherComfort(current);
  if (comfort.level === 'low') {
    notifications.push({
      type: 'comfort_suggestion',
      priority: 'low',
      title: 'Weather Advisory',
      message: comfort.reason,
      action: 'Plan accordingly'
    });
  }
  
  return notifications;
}

function assessWeatherComfort(current: any): { level: string; reason: string } {
  const temp = current.temperature;
  const wind = current.wind_speed;
  const precip = current.precip_amount || 0;
  
  if (precip > 5) {
    return { level: 'low', reason: 'Heavy rain conditions - indoor activities recommended' };
  } else if (wind > 15) {
    return { level: 'low', reason: 'Strong winds - be cautious outdoors' };
  } else if (temp < -5) {
    return { level: 'low', reason: 'Very cold - dress warmly and limit exposure' };
  } else if (temp > 30) {
    return { level: 'low', reason: 'Very hot - stay hydrated and seek shade' };
  } else {
    return { level: 'good', reason: 'Comfortable weather conditions' };
  }
}