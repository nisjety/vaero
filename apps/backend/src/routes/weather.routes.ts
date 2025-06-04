import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import {
  getWeatherWithAIEndpoint,
  getCurrentWeather,
} from '../controllers/weather.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Weather routes
router.get('/', getWeatherWithAIEndpoint);
router.get('/current', getCurrentWeather);

export default router;
