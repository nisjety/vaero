// src/modules/weather-ai/weather-ai.processor.ts

import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WeatherAIService } from './weather-ai.service';

@Processor('weather-ai')
@Injectable()
export class WeatherAIProcessor {
  private readonly logger = new Logger(WeatherAIProcessor.name);

  constructor(private weatherAIService: WeatherAIService) {}

  // Pre-cache Oslo every 15 minutes
  @Cron('*/15 * * * *')
  async preCacheOslo() {
    try {
      // Import YrService to get actual weather data
      const { yrService } = await import('../../services/yr.service');
      
      // Get real Oslo weather data instead of hardcoded values
      const osloLat = 59.9139;
      const osloLon = 10.7522;
      const osloWeather = await yrService.getWeather(osloLat, osloLon);
      
      // Enhance with AI and cache it
      await this.weatherAIService.enhanceWeatherWithAI(osloWeather, { useCache: true });
      this.logger.log('✅ Oslo weather AI analysis pre-cached with real data');
    } catch (error) {
      this.logger.warn('Oslo pre-caching failed:', error);
    }
  }
}
