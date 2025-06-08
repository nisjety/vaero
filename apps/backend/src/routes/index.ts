// routes/index.ts
import { Router } from 'express';
import weatherRoutes from './weather.routes';
import weatherAIRoutes from './weather-ai.routes';
import aiRoutes from './ai.routes';
import userRoutes from './user.routes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// API info route
router.get('/', (req, res) => {
  res.json({
    name: 'Væro API',
    version: '1.0.0',
    description: 'Weather app backend with AI-powered recommendations',
    tiers: {
      free: {
        description: 'Free unlimited weather data and AI analysis',
        endpoints: ['/weather/*', '/weather-ai/*'],
        'rate-limit': 'No rate limiting'
      },
      premium: {
        description: 'OpenAI-powered personalized features',
        endpoints: ['/ai/*', '/users/*'],
        'rate-limit': '50 requests/15min per user',
        'authentication': 'Clerk JWT required'
      }
    },
    endpoints: {
      '/health': 'Health check',
      '/weather': 'Free YR weather data',
      '/weather-ai': 'Free AI-enhanced weather analysis',
      '/ai': 'Premium OpenAI-powered features (auth required)',
      '/users': 'User management and preferences (auth required)'
    }
  });
});

// Free tier routes (no authentication)
router.use('/weather', weatherRoutes);
router.use('/weather-ai', weatherAIRoutes);

// Premium tier routes (authentication required)
router.use('/ai', aiRoutes);
router.use('/users', userRoutes);

export default router;