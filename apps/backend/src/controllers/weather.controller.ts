// controllers/weather.controller.ts - Free YR weather data
import { Request, Response } from 'express';
import { z } from 'zod';
import { yrService } from '../services/yr.service';
import { logger } from '../utils/logger';
import { redis } from '../utils/redis';

// Input validation schemas
const locationSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  altitude: z.coerce.number().optional()
});

const multiLocationSchema = z.object({
  locations: z.array(z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    name: z.string().optional(),
    altitude: z.number().optional()
  })).min(1).max(10)
});

// Popular Norwegian locations for quick access
const POPULAR_LOCATIONS = [
  { name: 'Oslo', lat: 59.9139, lon: 10.7522 },
  { name: 'Bergen', lat: 60.3913, lon: 5.3221 },
  { name: 'Trondheim', lat: 63.4305, lon: 10.3951 },
  { name: 'Stavanger', lat: 58.9700, lon: 5.7331 },
  { name: 'Tromsø', lat: 69.6496, lon: 18.9560 },
  { name: 'Kristiansand', lat: 58.1599, lon: 7.9956 },
  { name: 'Drammen', lat: 59.7439, lon: 10.2045 },
  { name: 'Fredrikstad', lat: 59.2181, lon: 10.9298 }
];

/**
 * Get basic current weather - optimized for widgets
 * Returns minimal data for fast loading
 */
export const getCurrentWeather = async (req: Request, res: Response) => {
  try {
    const { lat, lon } = locationSchema.parse(req.query);
    
    const weatherData = await yrService.getWeather(lat, lon);
    
    // Return only essential current weather data
    res.json({
      location: { lat, lon },
      current: {
        time: weatherData.current.time,
        temperature: weatherData.current.temperature,
        symbol_code: weatherData.current.symbol_code,
        wind_speed: weatherData.current.wind_speed,
        wind_direction: weatherData.current.wind_direction,
        humidity: weatherData.current.humidity,
        pressure: weatherData.current.pressure
      },
      cached: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid parameters',
        details: error.errors
      });
    }
    logger.error('Error fetching current weather:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
};

/**
 * Get detailed current weather - full data for main weather view
 */
export const getDetailedWeather = async (req: Request, res: Response) => {
  try {
    const { lat, lon, altitude } = locationSchema.parse(req.query);
    
    const weatherData = await yrService.getWeather(lat, lon, altitude);
    
    // Return full current weather data
    res.json({
      location: { lat, lon, altitude },
      current: weatherData.current,
      sun: weatherData.sun,
      moon: weatherData.moon,
      airQuality: weatherData.airQuality,
      pollen: weatherData.pollen,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid parameters',
        details: error.errors
      });
    }
    logger.error('Error fetching detailed weather:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
};

/**
 * Get forecast data - hourly and daily
 */
export const getForecast = async (req: Request, res: Response) => {
  try {
    const { lat, lon, altitude } = locationSchema.parse(req.query);
    const hours = Math.min(parseInt(req.query.hours as string) || 24, 48);
    const days = Math.min(parseInt(req.query.days as string) || 7, 10);
    
    const weatherData = await yrService.getWeather(lat, lon, altitude);
    
    res.json({
      location: { lat, lon, altitude },
      hourly: weatherData.hourly.slice(0, hours),
      daily: weatherData.daily.slice(0, days),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid parameters',
        details: error.errors
      });
    }
    logger.error('Error fetching forecast:', error);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
};

/**
 * Get UV index data
 */
export const getUVIndex = async (req: Request, res: Response) => {
  try {
    const { lat, lon } = locationSchema.parse(req.query);
    
    const weatherData = await yrService.getWeather(lat, lon);
    
    res.json({
      location: { lat, lon },
      uv_index: weatherData.current.uv_index || null,
      uv_warning: weatherData.current.uv_index > 6 ? 'High UV - protection recommended' : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid parameters',
        details: error.errors
      });
    }
    logger.error('Error fetching UV data:', error);
    res.status(500).json({ error: 'Failed to fetch UV data' });
  }
};

/**
 * Get pollen data
 */
export const getPollenData = async (req: Request, res: Response) => {
  try {
    const { lat, lon } = locationSchema.parse(req.query);
    
    const weatherData = await yrService.getWeather(lat, lon);
    
    if (!weatherData.pollen) {
      return res.json({
        location: { lat, lon },
        message: 'No pollen data available for this location',
        data: null
      });
    }
    
    res.json({
      location: { lat, lon },
      pollen: weatherData.pollen,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid parameters',
        details: error.errors
      });
    }
    logger.error('Error fetching pollen data:', error);
    res.status(500).json({ error: 'Failed to fetch pollen data' });
  }
};

/**
 * Get air quality data
 */
export const getAirQuality = async (req: Request, res: Response) => {
  try {
    const { lat, lon } = locationSchema.parse(req.query);
    
    const weatherData = await yrService.getWeather(lat, lon);
    
    if (!weatherData.airQuality) {
      return res.json({
        location: { lat, lon },
        message: 'No air quality data available for this location',
        data: null
      });
    }
    
    res.json({
      location: { lat, lon },
      airQuality: weatherData.airQuality,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid parameters',
        details: error.errors
      });
    }
    logger.error('Error fetching air quality data:', error);
    res.status(500).json({ error: 'Failed to fetch air quality data' });
  }
};

/**
 * Get astronomical data (sun/moon)
 */
export const getAstronomicalData = async (req: Request, res: Response) => {
  try {
    const { lat, lon } = locationSchema.parse(req.query);
    
    const weatherData = await yrService.getWeather(lat, lon);
    
    res.json({
      location: { lat, lon },
      sun: weatherData.sun || null,
      moon: weatherData.moon || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid parameters',
        details: error.errors
      });
    }
    logger.error('Error fetching astronomical data:', error);
    res.status(500).json({ error: 'Failed to fetch astronomical data' });
  }
};

/**
 * Get popular locations weather - pre-cached for performance
 */
export const getPopularLocations = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'popular_locations_weather';
    
    // Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        locations: JSON.parse(cached),
        cached: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Fetch fresh data for all popular locations
    const locationPromises = POPULAR_LOCATIONS.map(async (location) => {
      try {
        const weatherData = await yrService.getWeather(location.lat, location.lon);
        return {
          name: location.name,
          lat: location.lat,
          lon: location.lon,
          current: {
            temperature: weatherData.current.temperature,
            symbol_code: weatherData.current.symbol_code,
            wind_speed: weatherData.current.wind_speed,
            humidity: weatherData.current.humidity
          },
          forecast: {
            today: weatherData.daily[0],
            tomorrow: weatherData.daily[1]
          }
        };
      } catch (error) {
        logger.error(`Error fetching weather for ${location.name}:`, error);
        return {
          name: location.name,
          lat: location.lat,
          lon: location.lon,
          error: 'Weather data unavailable'
        };
      }
    });
    
    const results = await Promise.allSettled(locationPromises);
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);
    
    // Cache for 15 minutes
    await redis.set(cacheKey, JSON.stringify(successfulResults), 'EX', 900);
    
    res.json({
      locations: successfulResults,
      cached: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching popular locations weather:', error);
    res.status(500).json({ error: 'Failed to fetch popular locations weather' });
  }
};

/**
 * Get multiple locations weather in one request
 */
export const getMultiLocation = async (req: Request, res: Response) => {
  try {
    const { locations } = multiLocationSchema.parse(req.body);
    
    // Process all locations in parallel
    const locationPromises = locations.map(async (location) => {
      try {
        const weatherData = await yrService.getWeather(location.lat, location.lon, location.altitude);
        return {
          name: location.name || `${location.lat}, ${location.lon}`,
          lat: location.lat,
          lon: location.lon,
          altitude: location.altitude,
          current: {
            temperature: weatherData.current.temperature,
            symbol_code: weatherData.current.symbol_code,
            wind_speed: weatherData.current.wind_speed,
            humidity: weatherData.current.humidity,
            pressure: weatherData.current.pressure
          },
          forecast: weatherData.daily.slice(0, 3), // Next 3 days
          success: true
        };
      } catch (error) {
        logger.error(`Error fetching weather for ${location.lat}, ${location.lon}:`, error);
        return {
          name: location.name || `${location.lat}, ${location.lon}`,
          lat: location.lat,
          lon: location.lon,
          error: 'Weather data unavailable',
          success: false
        };
      }
    });
    
    const results = await Promise.allSettled(locationPromises);
    const allResults = results.map(result => 
      result.status === 'fulfilled' ? result.value : { 
        error: 'Processing failed', 
        success: false 
      }
    );
    
    const successful = allResults.filter(result => result.success);
    const failed = allResults.filter(result => !result.success);
    
    res.json({
      total: locations.length,
      successful: successful.length,
      failed: failed.length,
      results: successful,
      errors: failed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: error.errors
      });
    }
    logger.error('Error processing multi-location request:', error);
    res.status(500).json({ error: 'Failed to process multi-location request' });
  }
};