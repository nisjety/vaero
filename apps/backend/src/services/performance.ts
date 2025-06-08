// utils/performance.ts - Performance monitoring utilities
import { logger } from '../utils/logger';
import { redis } from '../utils/redis';
import { prisma } from '../utils/database';

interface PerformanceMetrics {
  timestamp: string;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  tier: 'free' | 'premium';
  cacheHit: boolean;
  userId?: string;
  errorType?: string;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: 'connected' | 'error';
    redis: 'connected' | 'error';
    ai_models: 'loaded' | 'loading' | 'error';
    external_apis: 'available' | 'limited' | 'error';
  };
  performance: {
    avg_response_time: number;
    cache_hit_rate: number;
    error_rate: number;
    requests_per_minute: number;
  };
  resources: {
    memory_usage: number;
    cpu_usage: number;
    disk_usage: number;
  };
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics in memory
  private readonly alertThresholds = {
    responseTime: 5000, // 5 seconds
    errorRate: 0.05, // 5%
    cacheHitRate: 0.8, // 80%
  };

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics in memory
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Store in Redis for persistence (with TTL)
    this.storeMetricInRedis(metric).catch(error => {
      logger.warn('Failed to store metric in Redis:', error);
    });

    // Check for performance alerts
    this.checkAlerts(metric);
  }

  /**
   * Get performance analytics for the last period
   */
  getAnalytics(periodMinutes: number = 60): any {
    const cutoff = new Date(Date.now() - periodMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => 
      new Date(m.timestamp) > cutoff
    );

    if (recentMetrics.length === 0) {
      return {
        period: `${periodMinutes} minutes`,
        total_requests: 0,
        avg_response_time: 0,
        error_rate: 0,
        cache_hit_rate: 0,
        by_tier: {},
        by_endpoint: {}
      };
    }

    const totalRequests = recentMetrics.length;
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length;
    const errorRate = errorCount / totalRequests;
    const cacheHits = recentMetrics.filter(m => m.cacheHit).length;
    const cacheHitRate = cacheHits / totalRequests;

    // Analytics by tier
    const byTier = this.groupByTier(recentMetrics);
    
    // Analytics by endpoint
    const byEndpoint = this.groupByEndpoint(recentMetrics);

    return {
      period: `${periodMinutes} minutes`,
      total_requests: totalRequests,
      avg_response_time: Math.round(avgResponseTime),
      error_rate: Math.round(errorRate * 100) / 100,
      cache_hit_rate: Math.round(cacheHitRate * 100) / 100,
      errors: errorCount,
      by_tier: byTier,
      by_endpoint: byEndpoint,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      // Check services
      const [dbCheck, redisCheck, aiCheck] = await Promise.allSettled([
        this.checkDatabase(),
        this.checkRedis(),
        this.checkAIModels()
      ]);

      const services = {
        database: dbCheck.status === 'fulfilled' ? 'connected' as const : 'error' as const,
        redis: redisCheck.status === 'fulfilled' ? 'connected' as const : 'error' as const,
        ai_models: aiCheck.status === 'fulfilled' ? 'loaded' as const : 'error' as const,
        external_apis: await this.checkExternalAPIs()
      };

      // Get performance metrics
      const analytics = this.getAnalytics(15); // Last 15 minutes
      const performance = {
        avg_response_time: analytics.avg_response_time,
        cache_hit_rate: analytics.cache_hit_rate,
        error_rate: analytics.error_rate,
        requests_per_minute: Math.round(analytics.total_requests / 15)
      };

      // Get resource usage
      const resources = this.getResourceUsage();

      // Determine overall status
      const hasServiceErrors = Object.values(services).some(status => status === 'error');
      const hasPerformanceIssues = 
        performance.avg_response_time > this.alertThresholds.responseTime ||
        performance.error_rate > this.alertThresholds.errorRate ||
        performance.cache_hit_rate < this.alertThresholds.cacheHitRate;

      let status: SystemHealth['status'] = 'healthy';
      if (hasServiceErrors) {
        status = 'unhealthy';
      } else if (hasPerformanceIssues) {
        status = 'degraded';
      }

      return {
        status,
        services,
        performance,
        resources
      };

    } catch (error) {
      logger.error('Failed to get system health:', error);
      return {
        status: 'unhealthy',
        services: {
          database: 'error',
          redis: 'error',
          ai_models: 'error',
          external_apis: 'error'
        },
        performance: {
          avg_response_time: 0,
          cache_hit_rate: 0,
          error_rate: 1,
          requests_per_minute: 0
        },
        resources: {
          memory_usage: 0,
          cpu_usage: 0,
          disk_usage: 0
        }
      };
    }
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const analytics = this.getAnalytics(60);
    const recommendations: string[] = [];

    if (analytics.avg_response_time > 2000) {
      recommendations.push('Consider optimizing slow endpoints or scaling infrastructure');
    }

    if (analytics.cache_hit_rate < 0.7) {
      recommendations.push('Improve caching strategy - hit rate below 70%');
    }

    if (analytics.error_rate > 0.02) {
      recommendations.push('Investigate error causes - error rate above 2%');
    }

    const freeRequests = analytics.by_tier?.free?.requests || 0;
    const premiumRequests = analytics.by_tier?.premium?.requests || 0;
    const ratio = premiumRequests / (freeRequests + premiumRequests);

    if (ratio < 0.1) {
      recommendations.push('Low premium adoption - consider improving premium features or marketing');
    }

    if (recommendations.length === 0) {
      recommendations.push('System performance is optimal');
    }

    return recommendations;
  }

  // Private helper methods

  private async storeMetricInRedis(metric: PerformanceMetrics): Promise<void> {
    const key = `metrics:${new Date().toISOString().split('T')[0]}`;
    const value = JSON.stringify(metric);
    
    // Store in Redis list with daily rotation
    await redis.rawClient.lpush(key, value);
    await redis.rawClient.expire(key, 86400 * 7); // Keep for 7 days
    await redis.rawClient.ltrim(key, 0, 9999); // Keep max 10k entries per day
  }

  private checkAlerts(metric: PerformanceMetrics): void {
    // Response time alert
    if (metric.responseTime > this.alertThresholds.responseTime) {
      logger.warn('Slow response time detected', {
        endpoint: metric.endpoint,
        responseTime: metric.responseTime,
        threshold: this.alertThresholds.responseTime
      });
    }

    // Error alert
    if (metric.statusCode >= 500) {
      logger.error('Server error detected', {
        endpoint: metric.endpoint,
        statusCode: metric.statusCode,
        method: metric.method,
        userId: metric.userId
      });
    }
  }

  private groupByTier(metrics: PerformanceMetrics[]): any {
    const groups = {
      free: { requests: 0, avg_response_time: 0, errors: 0 },
      premium: { requests: 0, avg_response_time: 0, errors: 0 }
    };

    metrics.forEach(metric => {
      const group = groups[metric.tier];
      group.requests++;
      group.avg_response_time += metric.responseTime;
      if (metric.statusCode >= 400) group.errors++;
    });

    // Calculate averages
    Object.values(groups).forEach(group => {
      if (group.requests > 0) {
        group.avg_response_time = Math.round(group.avg_response_time / group.requests);
      }
    });

    return groups;
  }

  private groupByEndpoint(metrics: PerformanceMetrics[]): any {
    const endpoints: Record<string, any> = {};

    metrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!endpoints[key]) {
        endpoints[key] = {
          requests: 0,
          avg_response_time: 0,
          errors: 0,
          cache_hits: 0
        };
      }

      const endpoint = endpoints[key];
      endpoint.requests++;
      endpoint.avg_response_time += metric.responseTime;
      if (metric.statusCode >= 400) endpoint.errors++;
      if (metric.cacheHit) endpoint.cache_hits++;
    });

    // Calculate averages and rates
    Object.values(endpoints).forEach((endpoint: any) => {
      if (endpoint.requests > 0) {
        endpoint.avg_response_time = Math.round(endpoint.avg_response_time / endpoint.requests);
        endpoint.error_rate = Math.round((endpoint.errors / endpoint.requests) * 100) / 100;
        endpoint.cache_hit_rate = Math.round((endpoint.cache_hits / endpoint.requests) * 100) / 100;
      }
    });

    return endpoints;
  }

  private async checkDatabase(): Promise<void> {
    await prisma.$queryRaw`SELECT 1`;
  }

  private async checkRedis(): Promise<void> {
    await redis.ping();
  }

  private async checkAIModels(): Promise<void> {
    // This would check if AI models are loaded
    // For now, just return success
    return Promise.resolve();
  }

  private async checkExternalAPIs(): Promise<'available' | 'limited' | 'error'> {
    try {
      // Test YR API
      const response = await fetch('https://api.met.no/weatherapi/locationforecast/2.0/status');
      return response.ok ? 'available' : 'limited';
    } catch (error) {
      return 'error';
    }
  }

  private getResourceUsage(): any {
    const memUsage = process.memoryUsage();
    
    return {
      memory_usage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      cpu_usage: Math.round(process.cpuUsage().user / 1000000), // Simplified CPU usage
      disk_usage: 0 // Would need actual disk usage monitoring
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// utils/database-optimization.ts - Database optimization utilities
import { PrismaClient, Prisma } from '@prisma/client';

class DatabaseOptimizer {
  constructor(private prisma: PrismaClient) {}

  /**
   * Optimize database queries with proper indexing and caching
   */
  async getOptimizedWeatherHistory(
    userId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    // Use optimized query with proper indexing
    return this.prisma.weatherSnapshot.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        timestamp: true,
        lat: true,
        lon: true,
        currentTemp: true,
        symbolCode: true,
        // Don't select large rawData unless needed
      }
    });
  }

  /**
   * Batch insert AI history for better performance
   */
  async batchInsertAIHistory(records: Prisma.AIHistoryCreateManyInput[]): Promise<void> {
    const batchSize = 100;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      await this.prisma.aIHistory.createMany({
        data: batch,
        skipDuplicates: true
      });
    }
  }

  /**
   * Clean up old data to maintain performance
   */
  async cleanupOldData(): Promise<{ deleted: any }> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const results = await Promise.allSettled([
      // Delete old weather snapshots (keep 30 days)
      this.prisma.weatherSnapshot.deleteMany({
        where: {
          timestamp: { lt: thirtyDaysAgo }
        }
      }),

      // Delete old AI history (keep 90 days)
      this.prisma.aIHistory.deleteMany({
        where: {
          timestamp: { lt: ninetyDaysAgo }
        }
      }),

      // Clean up devices for users not active in 6 months
      this.prisma.device.deleteMany({
        where: {
          user: {
            lastActive: { lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
          }
        }
      })
    ]);

    return {
      deleted: {
        weatherSnapshots: results[0].status === 'fulfilled' ? results[0].value.count : 0,
        aiHistory: results[1].status === 'fulfilled' ? results[1].value.count : 0,
        devices: results[2].status === 'fulfilled' ? results[2].value.count : 0
      }
    };
  }

  /**
   * Get database statistics for monitoring
   */
  async getDatabaseStats(): Promise<any> {
    const [userCount, deviceCount, aiHistoryCount, weatherSnapshotCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.device.count(),
      this.prisma.aIHistory.count(),
      this.prisma.weatherSnapshot.count()
    ]);

    // Get recent activity
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [recentUsers, recentAIQueries] = await Promise.all([
      this.prisma.user.count({
        where: { lastActive: { gte: last24Hours } }
      }),
      this.prisma.aIHistory.count({
        where: { timestamp: { gte: last24Hours } }
      })
    ]);

    return {
      totals: {
        users: userCount,
        devices: deviceCount,
        ai_history: aiHistoryCount,
        weather_snapshots: weatherSnapshotCount
      },
      activity_24h: {
        active_users: recentUsers,
        ai_queries: recentAIQueries
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Optimize user preferences query with proper joins
   */
  async getOptimizedUserWithPrefs(clerkUserId: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        prefs: true,
        devices: {
          select: {
            id: true,
            platform: true,
            pushToken: true,
            createdAt: true
          }
        },
        weatherSnapshot: {
          select: {
            timestamp: true,
            lat: true,
            lon: true,
            currentTemp: true,
            symbolCode: true
          }
        }
      }
    });
  }
}

export const dbOptimizer = new DatabaseOptimizer(prisma);

// utils/testing.ts - Testing utilities
import { jest } from '@jest/globals';

/**
 * Mock weather data for testing
 */
export const mockWeatherData = {
  current: {
    time: '2024-06-07T12:00:00Z',
    temperature: 20,
    symbol_code: 'fair_day',
    wind_speed: 5,
    wind_direction: 180,
    humidity: 65,
    pressure: 1013,
    dew_point: 12,
    fog: 0,
    uv_index: 3,
    wind_gust: 8,
    temp_pct_10: 18,
    temp_pct_90: 22,
    wind_pct_10: 3,
    wind_pct_90: 7,
    cloud_fraction: 30,
    cloud_fraction_low: 20,
    cloud_fraction_medium: 10,
    cloud_fraction_high: 5,
    precip_amount: 0,
    precip_min: 0,
    precip_max: 0.2,
    precip_prob: 15,
    thunder_prob: 0
  },
  hourly: [
    {
      time: '2024-06-07T13:00:00Z',
      temperature: 21,
      symbol_code: 'fair_day',
      wind_speed: 6,
      wind_direction: 185,
      humidity: 62,
      pressure: 1013
    }
  ],
  daily: [
    {
      date: '2024-06-07',
      maxTemp: 23,
      minTemp: 15,
      symbol_code: 'fair_day',
      precip_amount: 0,
      precip_min: 0,
      precip_max: 1,
      precip_prob: 20,
      thunder_prob: 0,
      avg_wind_speed: 5,
      max_wind_gust: 8,
      avg_humidity: 65,
      avg_cloud_fraction: 30
    }
  ]
};

/**
 * Mock user data for testing
 */
export const mockUser = {
  id: 1,
  clerkUserId: 'test-user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  lastActive: new Date(),
  prefs: {
    unit: 'metric' as const,
    timeFormat: '24h' as const,
    defaultLat: 59.9139,
    defaultLon: 10.7522,
    notifTempBelow: 5,
    notifTempAbove: 25,
    notifRainProb: 70,
    stylePreferences: {
      gender: 'unisex',
      style: 'casual',
      owns: ['raincoat', 'jacket']
    }
  },
  devices: [
    {
      id: 1,
      platform: 'ios' as const,
      pushToken: 'test-push-token',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

/**
 * Test helper functions
 */
export const testHelpers = {
  /**
   * Create a mock Express request
   */
  createMockRequest(overrides: any = {}): any {
    return {
      method: 'GET',
      path: '/api/test',
      query: {},
      body: {},
      params: {},
      headers: {},
      ip: '127.0.0.1',
      user: mockUser,
      userId: mockUser.clerkUserId,
      startTime: Date.now(),
      ...overrides
    };
  },

  /**
   * Create a mock Express response
   */
  createMockResponse(): any {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      end: jest.fn()
    };
    return res;
  },

  /**
   * Mock Redis for testing
   */
  createMockRedis(): any {
    const cache = new Map();
    return {
      get: jest.fn().mockImplementation((...args: any[]) => 
        Promise.resolve(cache.get(args[0]) || null)
      ),
      set: jest.fn().mockImplementation((...args: any[]) => {
        cache.set(args[0], args[1]);
        return Promise.resolve();
      }),
      del: jest.fn().mockImplementation((...args: any[]) => {
        cache.delete(args[0]);
        return Promise.resolve();
      }),
      exists: jest.fn().mockImplementation((...args: any[]) => 
        Promise.resolve(cache.has(args[0]) ? 1 : 0)
      ),
      ping: jest.fn(() => Promise.resolve('PONG')),
      disconnect: jest.fn(() => Promise.resolve()),
      rawClient: {
        info: jest.fn(() => Promise.resolve('redis_version:6.2.0\r\n')),
        keys: jest.fn(() => Promise.resolve([])),
        del: jest.fn(() => Promise.resolve(0))
      }
    };
  },

  /**
   * Mock Prisma for testing
   */
  createMockPrisma(): any {
    return {
      user: {
        findUnique: jest.fn(() => Promise.resolve(mockUser)),
        upsert: jest.fn(() => Promise.resolve(mockUser)),
        count: jest.fn(() => Promise.resolve(100))
      },
      userPrefs: {
        findUnique: jest.fn(() => Promise.resolve(mockUser.prefs)),
        upsert: jest.fn(() => Promise.resolve(mockUser.prefs))
      },
      device: {
        findMany: jest.fn(() => Promise.resolve(mockUser.devices)),
        create: jest.fn(() => Promise.resolve(mockUser.devices[0])),
        delete: jest.fn(() => Promise.resolve(mockUser.devices[0]))
      },
      aIHistory: {
        create: jest.fn(() => Promise.resolve({ id: 1 })),
        findMany: jest.fn(() => Promise.resolve([])),
        count: jest.fn(() => Promise.resolve(0))
      },
      weatherSnapshot: {
        upsert: jest.fn(() => Promise.resolve({ id: 1 })),
        findUnique: jest.fn(() => Promise.resolve(null))
      },
      $connect: jest.fn(() => Promise.resolve()),
      $disconnect: jest.fn(() => Promise.resolve()),
      $queryRaw: jest.fn(() => Promise.resolve([{ '?column?': 1 }]))
    };
  },

  /**
   * Create test environment setup
   */
  setupTestEnvironment(): any {
    const mockRedis = this.createMockRedis();
    const mockPrisma = this.createMockPrisma();
    
    // Mock fetch for external API calls
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: jest.fn(() => Promise.resolve(mockWeatherData)),
      text: jest.fn(() => Promise.resolve('OK')),
      status: 200,
      statusText: 'OK'
    })) as any;

    return {
      mockRedis,
      mockPrisma,
      cleanup: () => {
        jest.clearAllMocks();
        (global.fetch as any).mockClear();
      }
    };
  },

  /**
   * Wait for async operations in tests
   */
  async waitFor(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};