import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { env } from './utils/env';
import { logger } from './utils/logger';
import { prisma } from './utils/database';
import { redis } from './utils/redis';
import { errorHandler } from './middleware/error.middleware';
import { generalRateLimit } from './middleware/rateLimit.middleware';
import routes from './routes';
import { scheduleNotificationJobs, notificationWorker } from './jobs/notification.job';

const app = express();
const PORT = env.PORT || 4000;

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS configuration
const allowedOrigins = env.ALLOWED_ORIGINS.split(',');
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim(), 'HTTP Request'),
  },
}));

// Apply general rate limiting
app.use(generalRateLimit);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// API routes
app.use('/api', routes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    path: req.originalUrl,
    method: req.method,
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
        // Close database connections
        await prisma.$disconnect();
        logger.info('Database disconnected');
        
        // Close Redis connection
        await redis.disconnect();
        logger.info('Redis disconnected');
        
        // Shutdown background jobs
        await notificationWorker.close();
        
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error({ error }, 'Error during graceful shutdown');
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error({ error }, 'Error during server shutdown');
    process.exit(1);
  }
};

// Start server
const server = app.listen(PORT, async () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV }, 'Server started');
  
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');
    
    // Test Redis connection
    await redis.ping();
    logger.info('Redis connected successfully');
    
    // Initialize background jobs
    scheduleNotificationJobs();
    logger.info('Background jobs initialized');
    
    logger.info('🌦️ Væro API server is ready!');
  } catch (error) {
    logger.error({ error }, 'Failed to initialize server dependencies');
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught exception');
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled promise rejection');
  process.exit(1);
});

// Handle graceful shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
