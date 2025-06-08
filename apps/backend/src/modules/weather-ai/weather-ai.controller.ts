import { Controller, Get, Post, Query, Body, BadRequestException, InternalServerErrorException, Inject } from '@nestjs/common';
import { WeatherAIService } from './weather-ai.service';
import { EnhancedYrService } from '../../services/enhanced-yr.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller('weather-ai')
export class WeatherAIController {
  constructor(
    private weatherAIService: WeatherAIService,
    private enhancedYrService: EnhancedYrService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('status')
  async getAIStatus() {
    return this.weatherAIService.getAIStatus();
  }

  @Get('enhance')
  async enhanceWeather(
    @Query('lat') lat: string = '59.9139',
    @Query('lon') lon: string = '10.7522',
    @Query('model') model?: string,
    @Query('force') forceRefresh?: string,
  ) {
    try {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new BadRequestException('Invalid latitude or longitude provided');
      }

      if (latitude < -90 || latitude > 90) {
        throw new BadRequestException('Latitude must be between -90 and 90');
      }

      if (longitude < -180 || longitude > 180) {
        throw new BadRequestException('Longitude must be between -180 and 180');
      }

      const startTime = Date.now();
      const enhanced = await this.enhancedYrService.getEnhancedWeather(latitude, longitude, {
        preferredModel: model,
        forceRefresh: forceRefresh === 'true',
        skipAI: false,
      });

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        location: {
          lat: latitude,
          lon: longitude,
          name: enhanced.location?.name,
          isOslo: enhanced.location?.isOslo || false,
        },
        responseTime,
        ...enhanced,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException(
        `Failed to enhance weather data: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Get('oslo')
  async getOsloWeatherWithAI(@Query('force') forceRefresh?: string) {
    try {
      const startTime = Date.now();
      const enhanced = await this.enhancedYrService.getOsloInstant({
        forceRefresh: forceRefresh === 'true',
      });

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        location: 'Oslo',
        responseTime,
        isInstant: true,
        ...enhanced,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get Oslo weather: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Get('multi-location')
  async getMultiLocationWeather(
    @Query('locations') locationsQuery: string,
    @Query('model') model?: string,
  ) {
    try {
      if (!locationsQuery) {
        throw new BadRequestException('Locations parameter is required');
      }

      // Parse locations: "lat1,lon1|lat2,lon2|lat3,lon3"
      const locationPairs = locationsQuery.split('|');
      const locations = locationPairs.map(pair => {
        const [lat, lon] = pair.split(',').map(coord => parseFloat(coord.trim()));
        if (isNaN(lat) || isNaN(lon)) {
          throw new BadRequestException(`Invalid coordinates in: ${pair}`);
        }
        return { lat, lon };
      });

      if (locations.length > 10) {
        throw new BadRequestException('Maximum 10 locations allowed per request');
      }

      const startTime = Date.now();
      const results = await this.enhancedYrService.getMultiLocationWeather(locations, {
        preferredModel: model,
      });

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        locationsCount: locations.length,
        responseTime,
        results,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException(
        `Failed to get multi-location weather: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Post('multi-location')
  async postMultiLocationWeather(
    @Body() body: { 
      locations: Array<{ lat: number; lon: number; name?: string }>;
      options?: { preferredModel?: string };
    }
  ) {
    try {
      if (!body.locations || !Array.isArray(body.locations)) {
        throw new BadRequestException('locations array is required in request body');
      }

      if (body.locations.length === 0) {
        throw new BadRequestException('At least one location is required');
      }

      if (body.locations.length > 10) {
        throw new BadRequestException('Maximum 10 locations allowed per request');
      }

      // Validate each location
      body.locations.forEach((loc, index) => {
        if (typeof loc.lat !== 'number' || typeof loc.lon !== 'number') {
          throw new BadRequestException(`Invalid coordinates at index ${index}`);
        }
        if (loc.lat < -90 || loc.lat > 90) {
          throw new BadRequestException(`Invalid latitude at index ${index}: must be between -90 and 90`);
        }
        if (loc.lon < -180 || loc.lon > 180) {
          throw new BadRequestException(`Invalid longitude at index ${index}: must be between -180 and 180`);
        }
      });

      const startTime = Date.now();
      const results = await this.enhancedYrService.getMultiLocationWeather(
        body.locations,
        body.options || {}
      );

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        locationsCount: body.locations.length,
        responseTime,
        results,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException(
        `Failed to get multi-location weather: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Get('popular-locations')
  async getPopularLocationsWeather() {
    try {
      const startTime = Date.now();
      const results = await this.enhancedYrService.getPopularLocationsWeather();
      const responseTime = Date.now() - startTime;

      return {
        success: true,
        responseTime,
        results,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get popular locations weather: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Get('cache-stats')
  async getCacheStats() {
    return this.enhancedYrService.getCacheStats();
  }

  @Post('clear-cache')
  async clearCache(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
  ) {
    try {
      // Clear all weather AI caches (pattern based delete)
      // Only works if using Redis cache
      let locationSpecific = false;
      let keysCleared = 0;

      try {
        if ('store' in this.cacheManager && 'keys' in this.cacheManager.store) {
          // Pattern to match weather AI cache entries
          const pattern = lat && lon ? 
            `weather_ai:*_${lat}_${lon}_*` : // Location specific
            'weather_ai:*'; // All weather AI entries
            
          const keys = await this.cacheManager.store.keys(pattern);
          for (const key of keys) {
            await this.cacheManager.del(key);
            keysCleared++;
          }
          
          // Also clear "oslo_instant_weather" if no specific coordinates
          if (!lat && !lon) {
            await this.cacheManager.del('oslo_instant_weather');
            keysCleared++;
          }
          
          locationSpecific = !!(lat && lon);
        } else {
          // Basic implementation for non-Redis cache managers
          await this.cacheManager.reset();
          keysCleared = 1;
        }
      } catch (cacheError) {
        throw new InternalServerErrorException(
          `Cache operation failed: ${cacheError instanceof Error ? cacheError.message : String(cacheError)}`
        );
      }
      
      return {
        success: true,
        message: locationSpecific ? 
          `Cache cleared for location ${lat}, ${lon}` : 
          'Weather AI caches cleared',
        keysCleared
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to clear cache: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
