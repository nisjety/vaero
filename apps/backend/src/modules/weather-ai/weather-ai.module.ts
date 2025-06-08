import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { WeatherAIService } from './weather-ai.service';
import { WeatherAIController } from './weather-ai.controller';
import { EnhancedYrService } from '../../services/enhanced-yr.service';
import { YrService } from '../../services/yr.service';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register({
      ttl: 10 * 60 * 1000, // 10 minutes default TTL
      max: 1000, // Maximum items in cache
    }),
  ],
  providers: [
    WeatherAIService,
    EnhancedYrService,
    YrService,
  ],
  controllers: [WeatherAIController],
  exports: [
    WeatherAIService,
    EnhancedYrService,
    YrService,
  ],
})
export class WeatherAIModule {}
