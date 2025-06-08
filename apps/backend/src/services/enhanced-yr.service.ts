// services/enhanced-yr.service.ts - Optimized YR service with AI integration
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { YrService, WeatherData } from './yr.service';
import { WeatherAIService } from '../modules/weather-ai/weather-ai.service';
import { redis } from '../utils/redis';
import { logger } from '../utils/logger';

interface EnhancedWeatherOptions {
  preferredModel?: string;
  forceRefresh?: boolean;
  skipAI?: boolean;
  useCache?: boolean;
}

interface LocationInfo {
  name?: string;
  isOslo?: boolean;
  isPopular?: boolean;
  timezone?: string;
}

interface EnhancedWeatherData extends WeatherData {
  location?: LocationInfo;
  ai?: {
    insights?: any;
    model?: string;
    enhanced?: boolean;
    responseTime?: number;
  };
  performance?: {
    cacheHit?: boolean;
    responseTime?: number;
    dataSource?: string;
  };
  fromCache?: boolean;
}

// Popular Norwegian locations for quick access
const POPULAR_LOCATIONS = [
  { name: 'Oslo', lat: 59.9139, lon: 10.7522, timezone: 'Europe/Oslo' },
  { name: 'Bergen', lat: 60.3913, lon: 5.3221, timezone: 'Europe/Oslo' },
  { name: 'Trondheim', lat: 63.4305, lon: 10.3951, timezone: 'Europe/Oslo' },
  { name: 'Stavanger', lat: 58.9700, lon: 5.7331, timezone: 'Europe/Oslo' },
  { name: 'Tromsø', lat: 69.6496, lon: 18.9560, timezone: 'Europe/Oslo' },
  { name: 'Kristiansand', lat: 58.1599, lon: 7.9956, timezone: 'Europe/Oslo' },
  { name: 'Drammen', lat: 59.7439, lon: 10.2045, timezone: 'Europe/Oslo' },
  { name: 'Fredrikstad', lat: 59.2181, lon: 10.9298, timezone: 'Europe/Oslo' }
];

@Injectable()
export class EnhancedYrService implements OnModuleInit {
  private readonly logger = new Logger(EnhancedYrService.name);
  private cacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0
  };

  constructor(
    private yrService: YrService,
    private weatherAIService: WeatherAIService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async onModuleInit() {
    this.logger.log('🌤️ Enhanced YR Service initializing...');
    
    // Pre-warm Oslo cache
    setTimeout(async () => {
      try {
        await this.getOsloInstant({ forceRefresh: true });
        this.logger.log('✅ Oslo weather pre-cached');
      } catch (error) {
        this.logger.warn('Oslo pre-caching failed:', error);
      }
    }, 3000);
    
    // Schedule popular locations caching
    this.schedulePopularLocationsCaching();
  }

  /**
   * Get enhanced weather data with AI analysis
   */
  async getEnhancedWeather(
    lat: number, 
    lon: number, 
    options: EnhancedWeatherOptions = {}
  ): Promise<EnhancedWeatherData> {
    const startTime = Date.now();
    const { 
      preferredModel, 
      forceRefresh = false, 
      skipAI = false, 
      useCache = true 
    } = options;

    this.cacheStats.totalRequests++;

    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(lat, lon, { skipAI, preferredModel });
      
      // Check cache first (unless forced refresh)
      if (useCache && !forceRefresh) {
        const cached = await this.getCachedWeather(cacheKey);
        if (cached) {
          this.cacheStats.hits++;
          return {
            ...cached,
            fromCache: true,
            performance: {
              cacheHit: true,
              responseTime: Date.now() - startTime,
              dataSource: 'redis_cache'
            }
          };
        }
      }

      this.cacheStats.misses++;

      // Get base weather data from YR
      const weatherData = await this.yrService.getWeather(lat, lon);
      
      // Add location information
      const location = this.getLocationInfo(lat, lon);
      
      // Enhance with AI if not skipped
      let enhancedData: EnhancedWeatherData = {
        ...weatherData,
        location,
        performance: {
          cacheHit: false,
          responseTime: Date.now() - startTime,
          dataSource: 'yr_api'
        }
      };

      if (!skipAI) {
        try {
          const aiStartTime = Date.now();
          const aiAnalysis = await this.weatherAIService.enhanceWeatherWithAI(
            weatherData, 
            { model: preferredModel, useCache }
          );
          
          enhancedData.ai = {
            insights: aiAnalysis.aiAnalysis,
            model: aiAnalysis.aiModel,
            enhanced: aiAnalysis.enhanced,
            responseTime: Date.now() - aiStartTime
          };
        } catch (aiError) {
          this.logger.warn('AI enhancement failed, continuing without:', aiError);
          enhancedData.ai = {
            enhanced: false,
            model: 'none'
          };
        }
      }

      // Cache the result
      if (useCache) {
        const ttl = this.getTTL(lat, lon);
        await this.setCachedWeather(cacheKey, enhancedData, ttl);
      }

      return enhancedData;

    } catch (error) {
      this.logger.error(`Failed to get enhanced weather for ${lat}, ${lon}:`, error);
      throw error;
    }
  }

  /**
   * Get ultra-fast Oslo weather (always cached)
   */
  async getOsloInstant(options: { forceRefresh?: boolean } = {}): Promise<EnhancedWeatherData> {
    const osloLat = 59.9139;
    const osloLon = 10.7522;
    const { forceRefresh = false } = options;

    const cacheKey = 'oslo_instant_weather';
    
    // Try cache first unless forced refresh
    if (!forceRefresh) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          
          // Verify the cached data contains valid weather info
          if (this.isValidWeatherData(data)) {
            this.logger.debug('Using cached Oslo weather data');
            return {
              ...data,
              fromCache: true,
              location: {
                name: 'Oslo',
                isOslo: true,
                isPopular: true,
                timezone: 'Europe/Oslo'
              }
            };
          } else {
            this.logger.warn('Invalid Oslo cache data found, refreshing');
          }
        } catch (parseError) {
          this.logger.warn('Oslo cache parse error:', parseError);
        }
      }
    }

    // Get fresh data with AI enhancement
    const enhancedData = await this.getEnhancedWeather(osloLat, osloLon, {
      forceRefresh: true,
      skipAI: false,  // Make sure to get AI insights
      useCache: false // Get fresh data
    });

    // Validate the data before caching
    if (this.isValidWeatherData(enhancedData)) {
      // Cache for 5 minutes (shorter for Oslo to keep it fresh)
      await redis.set(cacheKey, JSON.stringify(enhancedData), 'EX', 300);
    } else {
      this.logger.warn('Not caching invalid Oslo weather data:', 
        JSON.stringify({
          hasTemp: !!enhancedData?.current?.temperature,
          hasSymbol: !!enhancedData?.current?.symbol_code
        })
      );
    }

    return {
      ...enhancedData,
      location: {
        name: 'Oslo',
        isOslo: true,
        isPopular: true,
        timezone: 'Europe/Oslo'
      }
    };
  }

  /**
   * Get weather for multiple locations efficiently
   */
  async getMultiLocationWeather(
    locations: Array<{ lat: number; lon: number; name?: string; altitude?: number }>,
    options: { preferredModel?: string } = {}
  ): Promise<Array<{ location: any; weather?: EnhancedWeatherData; error?: string }>> {
    const { preferredModel } = options;

    // Process locations in parallel with controlled concurrency
    const results = await Promise.allSettled(
      locations.map(async (location) => {
        try {
          const weather = await this.getEnhancedWeather(
            location.lat, 
            location.lon, 
            { 
              preferredModel,
              skipAI: true, // Skip AI for multi-location to improve performance
              useCache: true 
            }
          );

          return {
            location: {
              name: location.name || this.getLocationName(location.lat, location.lon),
              lat: location.lat,
              lon: location.lon,
              altitude: location.altitude
            },
            weather
          };
        } catch (error) {
          return {
            location: {
              name: location.name || `${location.lat}, ${location.lon}`,
              lat: location.lat,
              lon: location.lon
            },
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : {
        location: { error: 'Processing failed' },
        error: 'Failed to process location'
      }
    );
  }

  /**
   * Get weather for all popular Norwegian locations
   */
  async getPopularLocationsWeather(): Promise<Array<{ location: any; weather: EnhancedWeatherData }>> {
    const cacheKey = 'popular_locations_enhanced';
    
    // Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (parseError) {
        this.logger.warn('Popular locations cache parse error:', parseError);
      }
    }

    // Get fresh data for all popular locations
    const results = await this.getMultiLocationWeather(POPULAR_LOCATIONS);
    
    // Filter successful results
    const successful = results
      .filter(result => result.weather && !result.error)
      .map(result => ({
        location: result.location,
        weather: result.weather!
      }));

    // Cache for 15 minutes
    await redis.set(cacheKey, JSON.stringify(successful), 'EX', 900);

    return successful;
  }

  /**
   * Get cache statistics for monitoring
   */
  async getCacheStats(): Promise<any> {
    const hitRate = this.cacheStats.totalRequests > 0 ? 
      (this.cacheStats.hits / this.cacheStats.totalRequests * 100).toFixed(2) : 0;
    
    const missRate = this.cacheStats.totalRequests > 0 ? 
      (this.cacheStats.misses / this.cacheStats.totalRequests * 100).toFixed(2) : 0;

    return {
      hitRate: parseFloat(hitRate as string),
      missRate: parseFloat(missRate as string),
      totalRequests: this.cacheStats.totalRequests,
      hits: this.cacheStats.hits,
      misses: this.cacheStats.misses,
      redisStats: await this.getRedisStats()
    };
  }

  // Private helper methods

  private generateCacheKey(lat: number, lon: number, options: any = {}): string {
    const { skipAI, preferredModel } = options;
    const roundedLat = Math.round(lat * 100) / 100; // Round to 2 decimal places
    const roundedLon = Math.round(lon * 100) / 100;
    
    return `enhanced_weather:${roundedLat}:${roundedLon}:${skipAI ? 'no_ai' : 'ai'}:${preferredModel || 'auto'}`;
  }

  private async getCachedWeather(cacheKey: string): Promise<EnhancedWeatherData | null> {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.warn('Cache retrieval error:', error);
    }
    return null;
  }

  private async setCachedWeather(cacheKey: string, data: EnhancedWeatherData, ttlSeconds: number): Promise<void> {
    try {
      // Remove performance data before caching to reduce size
      const cacheData = { ...data };
      delete cacheData.performance;
      
      await redis.set(cacheKey, JSON.stringify(cacheData), 'EX', ttlSeconds);
    } catch (error) {
      this.logger.warn('Cache storage error:', error);
    }
  }

  private getTTL(lat: number, lon: number): number {
    // Oslo gets shorter TTL for freshness
    if (Math.abs(lat - 59.9139) < 0.01 && Math.abs(lon - 10.7522) < 0.01) {
      return 300; // 5 minutes for Oslo
    }
    
    // Popular locations get medium TTL
    const isPopular = POPULAR_LOCATIONS.some(loc => 
      Math.abs(lat - loc.lat) < 0.01 && Math.abs(lon - loc.lon) < 0.01
    );
    
    if (isPopular) {
      return 600; // 10 minutes for popular locations
    }
    
    return 900; // 15 minutes for other locations
  }

  private getLocationInfo(lat: number, lon: number): LocationInfo {
    // Check if it's Oslo
    if (Math.abs(lat - 59.9139) < 0.01 && Math.abs(lon - 10.7522) < 0.01) {
      return {
        name: 'Oslo',
        isOslo: true,
        isPopular: true,
        timezone: 'Europe/Oslo'
      };
    }

    // Check popular locations
    const popular = POPULAR_LOCATIONS.find(loc => 
      Math.abs(lat - loc.lat) < 0.05 && Math.abs(lon - loc.lon) < 0.05
    );

    if (popular) {
      return {
        name: popular.name,
        isOslo: false,
        isPopular: true,
        timezone: popular.timezone
      };
    }

    return {
      isOslo: false,
      isPopular: false,
      timezone: 'Europe/Oslo' // Default to Norwegian timezone
    };
  }

  private getLocationName(lat: number, lon: number): string {
    const location = this.getLocationInfo(lat, lon);
    return location.name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  }

  private async getRedisStats(): Promise<any> {
    try {
      const info = await redis.rawClient.info('memory');
      const lines = info.split('\r\n');
      const stats: any = {};
      
      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          if (key.includes('memory') || key.includes('keys')) {
            stats[key] = value;
          }
        }
      });
      
      return stats;
    } catch (error) {
      this.logger.warn('Failed to get Redis stats:', error);
      return {};
    }
  }

  private schedulePopularLocationsCaching(): void {
    // Cache popular locations every 10 minutes
    setInterval(async () => {
      try {
        await this.getPopularLocationsWeather();
        this.logger.debug('Popular locations cache refreshed');
      } catch (error) {
        this.logger.warn('Failed to refresh popular locations cache:', error);
      }
    }, 10 * 60 * 1000); // 10 minutes
  }

  /**
   * Warm up cache for better performance
   */
  async warmUpCache(): Promise<void> {
    this.logger.log('🔥 Warming up cache...');
    
    try {
      // Warm up Oslo
      await this.getOsloInstant({ forceRefresh: true });
      
      // Warm up a few popular locations
      const locationsToWarm = POPULAR_LOCATIONS.slice(0, 4); // First 4 cities
      
      await Promise.allSettled(
        locationsToWarm.map(location => 
          this.getEnhancedWeather(location.lat, location.lon, { 
            forceRefresh: true,
            skipAI: true 
          })
        )
      );
      
      this.logger.log('✅ Cache warm-up completed');
    } catch (error) {
      this.logger.warn('Cache warm-up failed:', error);
    }
  }

  /**
   * Clear cache for a specific location or all cache
   */
  async clearCache(lat?: number, lon?: number): Promise<void> {
    if (lat !== undefined && lon !== undefined) {
      // Clear specific location cache
      const patterns = [
        this.generateCacheKey(lat, lon, { skipAI: true }),
        this.generateCacheKey(lat, lon, { skipAI: false }),
        this.generateCacheKey(lat, lon, { skipAI: true, preferredModel: 'onnx' }),
        this.generateCacheKey(lat, lon, { skipAI: false, preferredModel: 'onnx' })
      ];
      
      await Promise.allSettled(
        patterns.map(pattern => redis.del(pattern))
      );
      
      this.logger.log(`Cache cleared for location ${lat}, ${lon}`);
    } else {
      // Clear all enhanced weather cache
      const keys = await redis.rawClient.keys('enhanced_weather:*');
      if (keys.length > 0) {
        await redis.rawClient.del(...keys);
      }
      
      // Clear special caches
      await redis.del('oslo_instant_weather');
      await redis.del('popular_locations_enhanced');
      
      this.logger.log('All weather cache cleared');
    }
  }

  /**
   * Helper method to validate weather data
   * Checks if the required properties exist
   */
  private isValidWeatherData(data: any): boolean {
    return !!(
      data &&
      data.current &&
      typeof data.current.temperature === 'number' &&
      data.current.symbol_code &&
      Array.isArray(data.hourly) &&
      Array.isArray(data.daily)
    );
  }
}