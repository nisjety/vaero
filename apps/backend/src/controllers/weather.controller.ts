import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { yrService, WeatherData } from '../services/yr.service';
import { generateClothingSuggestion } from '../services/openai.service';
import { logger } from '../utils/logger';
import { prisma } from '../utils/database';

interface WeatherWithAI extends WeatherData {
  clothingSuggestion: {
    items: string[];
    explanation: string;
  };
}

async function getWeatherWithAI(
  lat: number, 
  lon: number, 
  userId: number, 
  userPrefs: any
): Promise<WeatherWithAI> {
  // Get weather data from Yr
  const weatherData = await yrService.getWeather(lat, lon);

  // Get AI clothing suggestion
  let clothingSuggestion = { items: [] as string[], explanation: '' };
  
  try {
    const aiResponse = await generateClothingSuggestion(userId, weatherData, userPrefs);
    clothingSuggestion = aiResponse;
  } catch (error) {
    logger.error('Error generating clothing suggestion:', error);
    clothingSuggestion = {
      items: ['Weather appropriate clothing'],
      explanation: 'Unable to generate specific clothing recommendations at this time.',
    };
  }

  return {
    ...weatherData,
    clothingSuggestion,
  };
}

const weatherQuerySchema = z.object({
  lat: z.string().transform((val) => parseFloat(val)),
  lon: z.string().transform((val) => parseFloat(val)),
});

export const getWeatherWithAIEndpoint = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lat, lon } = weatherQuerySchema.parse(req.query);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ error: 'Coordinates out of range' });
    }

    // Get user preferences for styling and units
    const userPrefs = await prisma.userPrefs.findUnique({
      where: { userId: req.user.id },
    });

    const weatherData = await getWeatherWithAI(lat, lon, req.user.id, userPrefs);

    // Update weather snapshot for notifications
    await prisma.weatherSnapshot.upsert({
      where: { userId: req.user.id },
      update: {
        timestamp: new Date(),
        lat,
        lon,
        currentTemp: weatherData.current.temperature,
        symbolCode: weatherData.current.symbol_code,
        rawData: weatherData.current as any,
      },
      create: {
        userId: req.user.id,
        lat,
        lon,
        currentTemp: weatherData.current.temperature,
        symbolCode: weatherData.current.symbol_code,
        rawData: weatherData.current as any,
      },
    });

    logger.info(`Weather data fetched for user ${req.user.id}`, {
      lat,
      lon,
      temperature: weatherData.current.temperature,
    });

    res.json(weatherData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    }
    logger.error('Failed to get weather data:', error);
    res.status(500).json({ error: 'Failed to get weather data' });
  }
};

export const getCurrentWeather = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lat, lon } = weatherQuerySchema.parse(req.query);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const weatherSnapshot = await prisma.weatherSnapshot.findUnique({
      where: { userId: req.user.id },
    });

    if (!weatherSnapshot) {
      return res.status(404).json({ error: 'No weather data found' });
    }

    res.json(weatherSnapshot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    }
    logger.error('Failed to get current weather:', error);
    res.status(500).json({ error: 'Failed to get current weather' });
  }
};
