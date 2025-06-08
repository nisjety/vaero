import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, authenticateUser } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { prisma } from '../utils/database';

const router = Router();

// Helper function to get services (lazily initialized)
const getServices = async () => {
  try {
    // Dynamically import the factory to avoid module-level initialization issues
    const { default: weatherAIFactory } = await import('../utils/weatherAIFactory');
    
    // Try to get services - if not initialized, the factory will throw an error
    return {
      weatherAIService: weatherAIFactory.getWeatherAIService(),
      enhancedYrService: weatherAIFactory.getEnhancedYrService()
    };
  } catch (error) {
    // If services not initialized, try to initialize them
    logger.warn('WeatherAI services not initialized, attempting to initialize:', error);
    
    // Re-import and initialize
    const { default: weatherAIFactory } = await import('../utils/weatherAIFactory');
    await weatherAIFactory.initialize();
    
    // Now return the services
    return {
      weatherAIService: weatherAIFactory.getWeatherAIService(),
      enhancedYrService: weatherAIFactory.getEnhancedYrService()
    };
  }
};

// Input validation schemas
const locationSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180)
});

const adviceRequestSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  type: z.enum(['clothing', 'activity', 'packing']).optional().default('clothing'),
  duration: z.enum(['current', 'day', 'week']).optional().default('current')
});

const multiLocationSchema = z.object({
  locations: z.array(z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    name: z.string().optional()
  })).min(1).max(10) // Limit to 10 locations max
});

// GET /weather-ai/advice - Get AI weather advice
// Requires authentication for personalized recommendations
router.get('/advice', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lat, lon, type, duration } = adviceRequestSchema.parse(req.query);
    const { weatherAIService, enhancedYrService } = await getServices();

    // Get user preferences for personalized advice
    const userPrefs = await prisma.userPrefs.findUnique({
      where: { userId: req.user.id },
    });

    // Get weather data with AI analysis
    const weatherData = await enhancedYrService.getEnhancedWeather(lat, lon);
    
    // Generate AI advice based on type
    let advice;
    switch (type) {
      case 'clothing':
        advice = await weatherAIService.generateClothingAdvice(weatherData, userPrefs);
        break;
      case 'activity':
        advice = await weatherAIService.generateActivityAdvice(weatherData, duration);
        break;
      case 'packing':
        advice = await weatherAIService.generatePackingAdvice(weatherData, duration);
        break;
      default:
        advice = await weatherAIService.generateClothingAdvice(weatherData, userPrefs);
    }

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

    res.json({
      location: { lat, lon },
      weather: {
        current: weatherData.current,
        forecast: weatherData.daily?.slice(0, 3) || []
      },
      advice,
      type,
      duration,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: error.errors
      });
    }
    logger.error('Error generating weather advice:', error);
    res.status(500).json({ error: 'Failed to generate weather advice' });
  }
});

// GET /weather-ai/enhanced - Get enhanced weather data with AI insights
// Public endpoint for basic AI insights, enhanced for authenticated users
router.get('/enhanced', async (req: Request, res: Response) => {
  try {
    const { lat, lon } = locationSchema.parse(req.query);
    const { weatherAIService, enhancedYrService } = await getServices();

    // Check if user is authenticated for personalized data
    const isAuthenticated = req.headers.authorization;
    let userId: number | undefined;
    let userPrefs = null;

    if (isAuthenticated) {
      try {
        // Simple auth check - in production, use proper middleware
        const authReq = req as AuthenticatedRequest;
        if (authReq.user) {
          userId = authReq.user.id;
          userPrefs = await prisma.userPrefs.findUnique({
            where: { userId }
          });
        }
      } catch (authError) {
        // Continue without authentication
        logger.debug('Auth failed, continuing with public data:', authError);
      }
    }

    // Get enhanced weather data
    const weatherData = await enhancedYrService.getEnhancedWeather(lat, lon);

    // Generate basic AI insights
    const insights = await weatherAIService.generateBasicInsights(weatherData);

    const response: any = {
      location: { lat, lon },
      weather: weatherData,
      insights,
      timestamp: new Date().toISOString()
    };

    // Add personalized data if authenticated
    if (userId && userPrefs) {
      response.personalizedAdvice = await weatherAIService.generateClothingAdvice(weatherData, userPrefs);
      response.isPersonalized = true;
    } else {
      response.isPersonalized = false;
    }

    res.json(response);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid location parameters',
        details: error.errors
      });
    }
    logger.error('Error getting enhanced weather data:', error);
    res.status(500).json({ error: 'Failed to get enhanced weather data' });
  }
});

// POST /weather-ai/batch - Get AI advice for multiple locations
// Requires authentication for batch processing
router.post('/batch', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { locations } = multiLocationSchema.parse(req.body);
    const { weatherAIService, enhancedYrService } = await getServices();

    // Get user preferences
    const userPrefs = await prisma.userPrefs.findUnique({
      where: { userId: req.user.id },
    });

    // Process all locations
    const results = await Promise.allSettled(
      locations.map(async (location) => {
        const weatherData = await enhancedYrService.getEnhancedWeather(location.lat, location.lon);
        const advice = await weatherAIService.generateClothingAdvice(weatherData, userPrefs);
        
        return {
          location: {
            ...location,
            name: location.name || `${location.lat}, ${location.lon}`
          },
          weather: {
            current: weatherData.current,
            forecast: weatherData.daily?.slice(0, 2) || []
          },
          advice
        };
      })
    );

    // Separate successful and failed results
    const successful = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    const failed = results
      .map((result, index) => result.status === 'rejected' ? { 
        location: locations[index], 
        error: 'Failed to process location' 
      } : null)
      .filter(Boolean);

    res.json({
      results: successful,
      failed,
      total: locations.length,
      successful: successful.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid batch request',
        details: error.errors
      });
    }
    logger.error('Error processing batch weather request:', error);
    res.status(500).json({ error: 'Failed to process batch request' });
  }
});

// GET /weather-ai/oslo - Get instant Oslo weather (pre-cached)
// Public endpoint for ultra-fast Oslo weather data
router.get('/oslo', async (req: Request, res: Response) => {
  try {
    // Oslo coordinates
    const osloLat = 59.9139;
    const osloLon = 10.7522;
    const { weatherAIService, enhancedYrService } = await getServices();

    // Get instant Oslo weather (should be pre-cached)
    const weatherData = await enhancedYrService.getOsloInstant();
    
    // Generate basic insights
    const insights = await weatherAIService.generateBasicInsights(weatherData);

    res.json({
      location: { 
        lat: osloLat, 
        lon: osloLon, 
        name: 'Oslo, Norway' 
      },
      weather: weatherData,
      insights,
      cached: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error getting Oslo weather:', error);
    res.status(500).json({ error: 'Failed to get Oslo weather data' });
  }
});

// GET /weather-ai/models - Get AI model status and information
// Public endpoint for model status
router.get('/models', async (req: Request, res: Response) => {
  try {
    const { weatherAIService } = await getServices();
    const modelStatus = await weatherAIService.getModelStatus();
    
    res.json({
      models: modelStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error getting model status:', error);
    res.status(500).json({ error: 'Failed to get model status' });
  }
});

// Health check for WeatherAI module
router.get('/health', async (req: Request, res: Response) => {
  try {
    const { weatherAIService } = await getServices();
    const modelStatus = await weatherAIService.getModelStatus();
    const isHealthy = modelStatus.fallback.loaded || modelStatus.onnx.loaded || modelStatus.transformers.loaded;
    
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'degraded',
      models: modelStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('WeatherAI health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'WeatherAI module not responding',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
