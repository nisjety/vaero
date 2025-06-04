import { Router } from 'express';
import userRoutes from './user.routes';
import weatherRoutes from './weather.routes';
import aiRoutes from './ai.routes';

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
    endpoints: {
      '/health': 'Health check',
      '/users/*': 'User management and preferences',
      '/weather': 'Weather data with AI recommendations',
      '/ai/*': 'AI-powered features'
    }
  });
});

// API routes
router.use('/users', userRoutes);
router.use('/weather', weatherRoutes);
router.use('/ai', aiRoutes);

export default router;
