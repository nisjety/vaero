// server.ts - Optimized server configuration
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './utils/env';
import { logger } from './utils/logger';
import { prisma } from './utils/database';
import { redis } from './utils/redis';
import { errorHandler } from './middleware/error.middleware';
import { generalRateLimit } from './middleware/rateLimit.middleware';
import { performanceMiddleware } from './middleware/performance.middleware';
import corsMiddleware from './middleware/cors.middleware';
import routes from './routes';
import { scheduleNotificationJobs, notificationWorker } from './jobs/notification.job';
import weatherAIFactory from './utils/weatherAIFactory';

const app = express();
const PORT = env.PORT || 4000;

// Trust proxy for accurate IP addresses behind load balancers
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.met.no", "https://clerk.dev"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for mobile apps
}));

// Compression for better performance
app.use(compression({
  threshold: 1024, // Only compress responses > 1KB
  level: 6, // Balanced compression level
}));

// CORS configuration
app.use(corsMiddleware);

// Request parsing middleware
app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'text/plain']
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb'
}));

// Performance monitoring
app.use(performanceMiddleware);

// Rate limiting - only apply to AI endpoints for authenticated users
// Weather endpoints are completely free of rate limiting for better user experience
// Only apply rate limiting to specific non-weather endpoints that require authentication
app.use('/api/ai', generalRateLimit); // Only AI endpoints get rate limited
app.use('/api/user', generalRateLimit); // User management endpoints get rate limited

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Detailed health check for monitoring
app.get('/health/detailed', async (req, res) => {
  try {
    // Check AI status safely - only if factory is initialized
    let aiStatusPromise: Promise<any>;
    try {
      const aiService = weatherAIFactory.getWeatherAIService();
      aiStatusPromise = aiService.getModelStatus();
    } catch (error) {
      // Factory not initialized, return a rejected promise
      aiStatusPromise = Promise.reject(new Error('AI services not initialized'));
    }

    const [dbStatus, redisStatus, aiStatus] = await Promise.allSettled([
      prisma.$queryRaw`SELECT 1`,
      redis.ping(),
      aiStatusPromise
    ]);
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus.status === 'fulfilled' ? 'connected' : 'error',
        redis: redisStatus.status === 'fulfilled' ? 'connected' : 'error',
        ai_models: aiStatus.status === 'fulfilled' ? 'loaded' : 'error'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service dependencies unavailable'
    });
  }
});

// API routes with tiered access
app.use('/api', routes);

// Catch-all 404 handler
app.use('*', (req, res) => {
  const tier = req.path.includes('/api/ai/') ? 'premium' : 'free';
  
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    tier,
    available_tiers: {
      free: '/api/weather/*, /api/weather-ai/*',
      premium: '/api/ai/*, /api/users/*'
    },
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);
  
  try {
    // Stop accepting new requests
    server.close(async () => {
      logger.info('HTTP server closed');
      
      try {
        // Shutdown services in order
        await notificationWorker.close();
        logger.info('Background jobs stopped');
        
        await prisma.$disconnect();
        logger.info('Database disconnected');
        
        await redis.disconnect();
        logger.info('Redis disconnected');
        
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Graceful shutdown timed out, forcing exit');
      process.exit(1);
    }, 30000);
    
  } catch (error) {
    logger.error('Error during server shutdown:', error);
    process.exit(1);
  }
};

// Start server with proper initialization
const server = app.listen(PORT, async () => {
  logger.info(`🌦️ Væro API Server starting on port ${PORT}`, {
    environment: process.env.NODE_ENV,
    port: PORT,
    timestamp: new Date().toISOString()
  });
  
  try {
    // Initialize core services
    logger.info('🔌 Connecting to services...');
    
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected');
    
    // Test Redis connection
    await redis.ping();
    logger.info('✅ Redis connected');
    
    // Initialize WeatherAI services
    logger.info('🤖 Initializing AI services...');
    await weatherAIFactory.initialize();
    logger.info('✅ AI services initialized');
    
    // Initialize background jobs
    logger.info('⏰ Starting background jobs...');
    scheduleNotificationJobs();
    logger.info('✅ Background jobs started');
    
    // Cache popular locations for better performance
    logger.info('🚀 Pre-warming caches...');
    setTimeout(async () => {
      try {
        // Pre-cache Oslo weather
        const enhancedYrService = weatherAIFactory.getEnhancedYrService();
        await enhancedYrService.getOsloInstant({ forceRefresh: false });
        logger.info('✅ Oslo weather pre-cached');
      } catch (error) {
        logger.warn('Pre-caching failed:', error);
      }
    }, 5000);
    
     logger.info(`
🎉 Væro API Server is ready!
    
📊 Service Status:
├── HTTP Server: ✅ Running on port ${PORT}
├── Database: ✅ Connected
├── Redis: ✅ Connected  
├── AI Models: ✅ Initialized
└── Background Jobs: ✅ Running

🌐 API Endpoints:
├── Free Tier: /api/weather/*, /api/weather-ai/*
└── Premium Tier: /api/ai/*, /api/users/*

🔗 URLs:
├── Health: http://localhost:${PORT}/health
├── API Info: http://localhost:${PORT}/api
└── Docs: Available via API info endpoint
    `);
    
  } catch (error) {
    logger.error('❌ Failed to initialize server dependencies:', error);
    process.exit(1);
  }
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection:', { reason, promise });
  process.exit(1);
});

// Graceful shutdown signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
