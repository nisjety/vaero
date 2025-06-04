import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import { aiRateLimit } from '../middleware/rateLimit.middleware';
import {
  getDailySummary,
  getActivitySuggestion,
  getPackingList,
  askAI,
  getAIHistory,
} from '../controllers/ai.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// AI routes with rate limiting
router.get('/daily-summary', getDailySummary);
router.get('/activity', getActivitySuggestion);
router.post('/packing-list', aiRateLimit, getPackingList);
router.post('/ask', aiRateLimit, askAI);
router.get('/history', getAIHistory);

export default router;
