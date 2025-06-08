import { ConfigService } from '@nestjs/config';
import { caching } from 'cache-manager';
import { WeatherAIService } from '../modules/weather-ai/weather-ai.service';
import { EnhancedYrService } from '../services/enhanced-yr.service';
import { YrService, yrService } from '../services/yr.service';
import { logger } from './logger';

/**
 * Factory to create properly configured WeatherAI services for use with Express
 * This bridges the gap between NestJS services and Express.js
 */
class WeatherAIFactory {
  private static instance: WeatherAIFactory;
  private isInitialized = false;
  private weatherAIService: WeatherAIService | null = null;
  private enhancedYrService: EnhancedYrService | null = null;
  private yrService: YrService | null = null;

  private constructor() {}

  /**
   * Get the singleton factory instance
   */
  public static getInstance(): WeatherAIFactory {
    if (!WeatherAIFactory.instance) {
      WeatherAIFactory.instance = new WeatherAIFactory();
    }
    return WeatherAIFactory.instance;
  }

  /**
   * Initialize all services with proper dependencies
   * This needs to be called before using any services
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      logger.info('Initializing WeatherAI services for Express integration');
      
      // Create config service with environment variables
      const configService = new ConfigService(process.env);

      // Create cache manager
      const cache = await caching('memory', {
        max: 1000,
        ttl: 10 * 60 * 1000 // 10 minutes
      });

      // Initialize services with dependencies - use the singleton instance
      this.yrService = yrService;
      this.weatherAIService = new WeatherAIService(configService, cache);
      this.enhancedYrService = new EnhancedYrService(
        this.yrService,
        this.weatherAIService, 
        configService, 
        cache
      );

      // Manually trigger lifecycle hooks
      await this.weatherAIService.onModuleInit();
      await this.enhancedYrService.onModuleInit();

      this.isInitialized = true;
      logger.info('WeatherAI services successfully initialized');
    } catch (error) {
      logger.error('Failed to initialize WeatherAI services:', error);
      throw new Error(`WeatherAI initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get the WeatherAI service
   */
  public getWeatherAIService(): WeatherAIService {
    if (!this.isInitialized || !this.weatherAIService) {
      throw new Error('WeatherAI services not initialized. Call initialize() first.');
    }
    return this.weatherAIService;
  }

  /**
   * Get the EnhancedYr service
   */
  public getEnhancedYrService(): EnhancedYrService {
    if (!this.isInitialized || !this.enhancedYrService) {
      throw new Error('WeatherAI services not initialized. Call initialize() first.');
    }
    return this.enhancedYrService;
  }

  /**
   * Get the Yr service
   */
  public getYrService(): YrService {
    if (!this.isInitialized || !this.yrService) {
      throw new Error('WeatherAI services not initialized. Call initialize() first.');
    }
    return this.yrService;
  }
}

export default WeatherAIFactory.getInstance();
