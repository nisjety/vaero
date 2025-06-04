import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

class RedisClient {
  private client: Redis;

  constructor() {
    this.client = new Redis(env.REDIS_URL, {
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });

    this.client.on('connect', () => {
      logger.info('✅ Connected to Redis');
    });

    this.client.on('error', (error) => {
      logger.error('❌ Redis connection error:', error);
    });
  }

  // Expose the raw client for BullMQ
  get rawClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, mode?: 'EX', ttlSeconds?: number): Promise<void> {
    if (mode === 'EX' && ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  async flushall(): Promise<void> {
    await this.client.flushall();
  }
}

export const redis = new RedisClient();

// Export raw Redis instance for BullMQ
export const redisConnection = redis.rawClient;