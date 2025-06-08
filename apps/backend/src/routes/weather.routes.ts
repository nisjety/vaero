import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import {
  getCurrentWeather,
  getDetailedWeather,
  getForecast,
  getUVIndex,
  getPollenData,
  getAirQuality,
  getAstronomicalData
} from '../controllers/weather.controller';
import { getEnhancedWeather } from '../controllers/weather-ai.controller';

const router = Router();

// Public weather endpoints - no authentication required
router.get('/current', getCurrentWeather);    // Basic current conditions
router.get('/detailed', getDetailedWeather);  // Full weather data with enhanced features
router.get('/forecast', getForecast);         // Hourly and daily forecast data
router.get('/uv', getUVIndex);               // UV index information
router.get('/pollen', getPollenData);        // Pollen levels
router.get('/air-quality', getAirQuality);   // Air quality data
router.get('/astro', getAstronomicalData);   // Sun/moon data

// Protected weather endpoint - requires authentication
// This endpoint includes AI-enhanced data like clothing suggestions
router.get('/', authenticateUser, getEnhancedWeather);

// Development-only test endpoint
if (process.env.NODE_ENV === 'development') {
  router.get('/test', authenticateUser, getEnhancedWeather);
}

export default router;
