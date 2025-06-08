import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from './logger';

// Define the PrismaClient with proper log configuration
type LogLevel = 'info' | 'query' | 'warn' | 'error';
type LogDefinition = {
  level: LogLevel;
  emit: 'stdout' | 'event';
};

const logDefinitions: LogDefinition[] = [
  { emit: 'event', level: 'query' },
  { emit: 'event', level: 'error' },
  { emit: 'event', level: 'warn' },
];

class DatabaseClient {
  private prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    'query' | 'error' | 'warn'
  >;

  constructor() {
    this.prisma = new PrismaClient({
      log: logDefinitions,
    }) as PrismaClient<
      Prisma.PrismaClientOptions,
      'query' | 'error' | 'warn'
    >;

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