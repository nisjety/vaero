import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from './logger';

class DatabaseClient {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      this.prisma.$on('query', (e: Prisma.QueryEvent) => {
        logger.debug(`Query: ${e.query} Params: ${e.params} Duration: ${e.duration}ms`);
      });
    }

    this.prisma.$on('error', (e: Prisma.LogEvent) => {
      logger.error('Database error:', e);
    });

    this.prisma.$on('warn', (e: Prisma.LogEvent) => {
      logger.warn('Database warning:', e);
    });
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info('✅ Connected to database');
    } catch (error) {
      logger.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    logger.info('📴 Disconnected from database');
  }

  get client(): PrismaClient {
    return this.prisma;
  }
}

export const db = new DatabaseClient();
export const prisma = db.client;