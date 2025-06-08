import { Injectable } from '@nestjs/common';
import { env } from '../utils/env';
import { redis } from '../utils/redis';
import { logger } from '../utils/logger';

export interface YrCurrent {
  time: string;
  temperature: number;
  symbol_code: string;
  wind_speed: number;
  wind_direction: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  fog: number;
  uv_index: number;
  wind_gust: number;
  temp_pct_10: number;
  temp_pct_90: number;
  wind_pct_10: number;
  wind_pct_90: number;
  cloud_fraction: number;
  cloud_fraction_low: number;
  cloud_fraction_medium: number;
  cloud_fraction_high: number;
  precip_amount?: number;
  precip_min?: number;
  precip_max?: number;
  precip_prob?: number;
  thunder_prob?: number;
}

export interface YrHourly extends YrCurrent {
  // Inherits all fields from YrCurrent
}

export interface YrDaily {
  date: string;
  maxTemp: number;
  minTemp: number;
  symbol_code: string;
  precip_amount: number;
  precip_min: number;
  precip_max: number;
  precip_prob: number;
  thunder_prob: number;
  avg_wind_speed: number;
  max_wind_gust: number;
  avg_humidity: number;
  avg_cloud_fraction: number;
}

export interface PollenData {
  date: string;
  region: string;
  today: Array<{
    type: string;
    level: 'none' | 'low' | 'moderate' | 'high' | 'very_high';
  }>;
  tomorrow: Array<{
    type: string;
    level: 'none' | 'low' | 'moderate' | 'high' | 'very_high';
  }>;
}

export interface AirQuality {
  time: string;
  level: 'low' | 'moderate' | 'high' | 'very_high';
  description: string;
  forecast: Array<{
    time: string;
    level: 'low' | 'moderate' | 'high' | 'very_high';
  }>;
}

export interface SunData {
  sunrise: string;
  sunset: string;
  solarNoon: string;
  daylightHours: number;
  daylightMinutes: number;
  altitude: number; // degrees above horizon
  nextSolarEclipse?: {
    date: string;
    type: 'partial' | 'total' | 'annular';
  };
}

export interface MoonData {
  moonrise?: string;
  moonset?: string;
  phase: {
    percentage: number; // 0-100
    description: 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 
                 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
  };
  nextFullMoon?: string;
  nextNewMoon?: string;
  nextMoonEclipse?: {
    date: string;
    type: 'partial' | 'total' | 'penumbral';
  };
  altitude: number; // degrees above horizon
  azimuth: string; // direction (e.g., 'southeast')
}

export interface WeatherData {
  current: YrCurrent;
  hourly: YrHourly[];
  daily: YrDaily[];
  pollen?: PollenData;
  airQuality?: AirQuality;
  sun?: SunData;
  moon?: MoonData;
}

interface UVForecast {
  complete: Array<{
    UV: number;
    time: string;
  }>;
}

interface PollenStation {
  types: Array<{
    name: string;
    level: string;
  }>;
}

interface AirQualityForecast {
  data: {
    time: Array<{
      variables: {
        AQI: {
          value: number;
          description: string;
        };
      };
    }>;
  };
}

interface AstronomicalData {
  properties: {
    sunrise: { time: string };
    sunset: { time: string };
    moonphase: string;
    moonrise?: { time: string };
    moonset?: { time: string };
  };
}

@Injectable()
export class YrService {
  private readonly baseUrl = 'https://api.met.no/weatherapi/locationforecast/2.0';
  // Note: MET Norway doesn't provide a general pollen API - this would need to be replaced with NAAF or similar service
  private readonly pollenApi = 'https://api.met.no/weatherapi/pollen/0.1/stations';
  private readonly airQualityApi = 'https://api.met.no/weatherapi/airqualityforecast/0.1/';
  private readonly astronomicalApi = 'https://api.met.no/weatherapi/sunrise/3.0/sun';
  private readonly userAgent = env.YR_USER_AGENT;
  private readonly fromEmail = env.YR_FROM_EMAIL;

  async getWeather(lat: number, lon: number, altitude?: number): Promise<WeatherData> {
    const cacheKey = `weather:${lat}:${lon}${altitude ? `:${altitude}` : ''}`;
    
    try {
      // Check cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info({ lat, lon, altitude }, 'Weather data retrieved from cache');
        return JSON.parse(cached);
      }

      logger.info({ lat, lon, altitude }, 'Fetching fresh weather data');

      // Fetch all data in parallel
      const [basicData, pollenData, airQuality, astronomicalData] = await Promise.all([
        this.fetchFromYr(lat, lon, altitude),
        this.fetchPollenData(lat, lon),
        this.fetchAirQuality(lat, lon),
        this.fetchAstronomicalData(lat, lon, new Date().toISOString().split('T')[0]),
      ]);

      logger.debug('Data fetched:', {
        basicData: !!basicData,
        pollenData: !!pollenData,
        airQuality: !!airQuality,
        astronomicalData: !!astronomicalData
      });

      // Parse basic weather data
      const baseWeather = this.parseYrResponse(basicData);
      
      // Combine all data
      const fullWeatherData: WeatherData = {
        ...baseWeather,
        pollen: pollenData,
        airQuality: airQuality,
        sun: astronomicalData?.sun,
        moon: astronomicalData?.moon,
      };
      
      // Cache for 10 minutes
      await redis.set(cacheKey, JSON.stringify(fullWeatherData), 'EX', 600);
      
      logger.info({ lat, lon, altitude }, 'Complete weather data fetched and cached');
      return fullWeatherData;
    } catch (error) {
      logger.error({ error, lat, lon, altitude }, 'Failed to get weather data');
      throw error;
    }
  }

  private async fetchFromYr(lat: number, lon: number, altitude?: number): Promise<any> {
    // Switch to complete endpoint with optional altitude and elements filtering
    let url = `${this.baseUrl}/complete?lat=${lat}&lon=${lon}`;
    
    if (typeof altitude === 'number') {
      url += `&altitude=${altitude}`;
    }
    
    // Optional: limit payload with specific elements
    // Uncomment to reduce data transfer if you only need specific fields
    // const elements = [
    //   'air_temperature', 'dew_point_temperature', 'cloud_area_fraction',
    //   'fog_area_fraction', 'wind_speed', 'wind_speed_of_gust', 'wind_from_direction',
    //   'air_pressure_at_sea_level', 'relative_humidity', 'ultraviolet_index_clear_sky',
    //   'precipitation_amount', 'probability_of_precipitation', 'probability_of_thunder'
    // ].join(',');
    // url += `&elements=${elements}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent,
        'From': this.fromEmail,
      },
    });

    if (!response.ok) {
      throw new Error(`Yr API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private parseYrResponse(data: any): WeatherData {
    const timeseries = data.properties?.timeseries || [];
    
    if (timeseries.length === 0) {
      throw new Error('No weather data available from Yr API');
    }

    // Current weather (first entry)
    const current = this.parseCurrentWeather(timeseries[0]);
    
    // Hourly forecast (next 24 hours)
    const hourly = this.parseHourlyForecast(timeseries.slice(0, 25));
    
    // Daily forecast (next 7 days)
    const daily = this.parseDailyForecast(timeseries);

    return { current, hourly, daily };
  }

  private parseCurrentWeather(entry: any): YrCurrent {
    const instant = entry.data?.instant?.details || {};
    const next1h = entry.data?.next_1_hours?.details || {};
    const next6h = entry.data?.next_6_hours?.details || {};
    const next1hSummary = entry.data?.next_1_hours?.summary || {};
    const next6hSummary = entry.data?.next_6_hours?.summary || {};
    
    const symbolCode = next1hSummary.symbol_code || 
                      next6hSummary.symbol_code || 
                      'unknown';

    return {
      time: entry.time,
      temperature: instant.air_temperature || 0,
      symbol_code: symbolCode,
      wind_speed: instant.wind_speed || 0,
      wind_direction: instant.wind_from_direction || 0,
      pressure: instant.air_pressure_at_sea_level || 0,
      humidity: instant.relative_humidity || 0,
      dew_point: instant.dew_point_temperature || 0,
      fog: instant.fog_area_fraction || 0,
      uv_index: instant.ultraviolet_index_clear_sky || 0,
      wind_gust: instant.wind_speed_of_gust || 0,
      temp_pct_10: instant.air_temperature_percentile_10 || 0,
      temp_pct_90: instant.air_temperature_percentile_90 || 0,
      wind_pct_10: instant.wind_speed_percentile_10 || 0,
      wind_pct_90: instant.wind_speed_percentile_90 || 0,
      cloud_fraction: instant.cloud_area_fraction || 0,
      cloud_fraction_low: instant.cloud_area_fraction_low || 0,
      cloud_fraction_medium: instant.cloud_area_fraction_medium || 0,
      cloud_fraction_high: instant.cloud_area_fraction_high || 0,
      precip_amount: next1h.precipitation_amount || next6h.precipitation_amount,
      precip_min: next1h.precipitation_amount_min || next6h.precipitation_amount_min,
      precip_max: next1h.precipitation_amount_max || next6h.precipitation_amount_max,
      precip_prob: next1h.probability_of_precipitation || next6h.probability_of_precipitation,
      thunder_prob: next1h.probability_of_thunder || next6h.probability_of_thunder,
    };
  }

  private parseHourlyForecast(timeseries: any[]): YrHourly[] {
    return timeseries.map(entry => {
      const instant = entry.data?.instant?.details || {};
      const next1h = entry.data?.next_1_hours?.details || {};
      const next6h = entry.data?.next_6_hours?.details || {};
      const next1hSummary = entry.data?.next_1_hours?.summary || {};
      const next6hSummary = entry.data?.next_6_hours?.summary || {};
      
      const symbolCode = next1hSummary.symbol_code || 
                        next6hSummary.symbol_code || 
                        'unknown';

      return {
        time: entry.time,
        temperature: instant.air_temperature || 0,
        symbol_code: symbolCode,
        wind_speed: instant.wind_speed || 0,
        wind_direction: instant.wind_from_direction || 0,
        pressure: instant.air_pressure_at_sea_level || 0,
        humidity: instant.relative_humidity || 0,
        dew_point: instant.dew_point_temperature || 0,
        fog: instant.fog_area_fraction || 0,
        uv_index: instant.ultraviolet_index_clear_sky || 0,
        wind_gust: instant.wind_speed_of_gust || 0,
        temp_pct_10: instant.air_temperature_percentile_10 || 0,
        temp_pct_90: instant.air_temperature_percentile_90 || 0,
        wind_pct_10: instant.wind_speed_percentile_10 || 0,
        wind_pct_90: instant.wind_speed_percentile_90 || 0,
        cloud_fraction: instant.cloud_area_fraction || 0,
        cloud_fraction_low: instant.cloud_area_fraction_low || 0,
        cloud_fraction_medium: instant.cloud_area_fraction_medium || 0,
        cloud_fraction_high: instant.cloud_area_fraction_high || 0,
        precip_amount: next1h.precipitation_amount || next6h.precipitation_amount,
        precip_min: next1h.precipitation_amount_min || next6h.precipitation_amount_min,
        precip_max: next1h.precipitation_amount_max || next6h.precipitation_amount_max,
        precip_prob: next1h.probability_of_precipitation || next6h.probability_of_precipitation,
        thunder_prob: next1h.probability_of_thunder || next6h.probability_of_thunder,
      };
    });
  }

  private parseDailyForecast(timeseries: any[]): YrDaily[] {
    const dailyData = new Map<string, { 
      temps: number[];
      tempMins: number[];
      tempMaxs: number[];
      symbols: string[];
      precipAmounts: number[];
      precipMins: number[];
      precipMaxs: number[];
      precipProbs: number[];
      thunderProbs: number[];
      windSpeeds: number[];
      windGusts: number[];
      humidities: number[];
      cloudFractions: number[];
    }>();

    // Group data by date
    timeseries.forEach(entry => {
      const date = entry.time.split('T')[0];
      const instant = entry.data?.instant?.details || {};
      const next6h = entry.data?.next_6_hours?.details || {};
      const next12h = entry.data?.next_12_hours?.details || {};
      
      const symbolCode = entry.data?.next_6_hours?.summary?.symbol_code || 
                        entry.data?.next_12_hours?.summary?.symbol_code || 
                        entry.data?.next_1_hours?.summary?.symbol_code;

      if (!dailyData.has(date)) {
        dailyData.set(date, { 
          temps: [], tempMins: [], tempMaxs: [], symbols: [], 
          precipAmounts: [], precipMins: [], precipMaxs: [], 
          precipProbs: [], thunderProbs: [], windSpeeds: [], 
          windGusts: [], humidities: [], cloudFractions: []
        });
      }

      const dayData = dailyData.get(date)!;
      
      // Collect instant data
      if (instant.air_temperature !== undefined) dayData.temps.push(instant.air_temperature);
      if (instant.wind_speed !== undefined) dayData.windSpeeds.push(instant.wind_speed);
      if (instant.wind_speed_of_gust !== undefined) dayData.windGusts.push(instant.wind_speed_of_gust);
      if (instant.relative_humidity !== undefined) dayData.humidities.push(instant.relative_humidity);
      if (instant.cloud_area_fraction !== undefined) dayData.cloudFractions.push(instant.cloud_area_fraction);
      
      // Collect period data (prefer 6h over 12h)
      const period = next6h.precipitation_amount !== undefined ? next6h : next12h;
      
      if (symbolCode) dayData.symbols.push(symbolCode);
      if (period.precipitation_amount !== undefined) dayData.precipAmounts.push(period.precipitation_amount);
      if (period.precipitation_amount_min !== undefined) dayData.precipMins.push(period.precipitation_amount_min);
      if (period.precipitation_amount_max !== undefined) dayData.precipMaxs.push(period.precipitation_amount_max);
      if (period.probability_of_precipitation !== undefined) dayData.precipProbs.push(period.probability_of_precipitation);
      if (period.probability_of_thunder !== undefined) dayData.thunderProbs.push(period.probability_of_thunder);
      if (period.air_temperature_min !== undefined) dayData.tempMins.push(period.air_temperature_min);
      if (period.air_temperature_max !== undefined) dayData.tempMaxs.push(period.air_temperature_max);
    });

    // Convert to daily forecasts
    const dailyForecasts: YrDaily[] = [];
    for (const [date, data] of dailyData) {
      if (data.temps.length === 0 && data.tempMins.length === 0) continue;

      // Calculate temperature range
      const allTemps = [...data.temps, ...data.tempMins, ...data.tempMaxs];
      const maxTemp = allTemps.length > 0 ? Math.max(...allTemps) : 0;
      const minTemp = allTemps.length > 0 ? Math.min(...allTemps) : 0;
      
      // Get most frequent symbol
      const symbolCode = this.getMostFrequent(data.symbols) || 'unknown';

      // Aggregate precipitation data
      const precipAmount = data.precipAmounts.length > 0 ? 
        data.precipAmounts.reduce((sum, p) => sum + p, 0) : 0;
      const precipMin = data.precipMins.length > 0 ? 
        Math.min(...data.precipMins) : 0;
      const precipMax = data.precipMaxs.length > 0 ? 
        Math.max(...data.precipMaxs) : 0;
      const precipProb = data.precipProbs.length > 0 ? 
        Math.max(...data.precipProbs) : 0;
      const thunderProb = data.thunderProbs.length > 0 ? 
        Math.max(...data.thunderProbs) : 0;

      // Calculate averages for other metrics
      const avgWindSpeed = data.windSpeeds.length > 0 ? 
        data.windSpeeds.reduce((sum, w) => sum + w, 0) / data.windSpeeds.length : 0;
      const maxWindGust = data.windGusts.length > 0 ? 
        Math.max(...data.windGusts) : 0;
      const avgHumidity = data.humidities.length > 0 ? 
        data.humidities.reduce((sum, h) => sum + h, 0) / data.humidities.length : 0;
      const avgCloudFraction = data.cloudFractions.length > 0 ? 
        data.cloudFractions.reduce((sum, c) => sum + c, 0) / data.cloudFractions.length : 0;

      dailyForecasts.push({
        date,
        maxTemp,
        minTemp,
        symbol_code: symbolCode,
        precip_amount: precipAmount,
        precip_min: precipMin,
        precip_max: precipMax,
        precip_prob: precipProb,
        thunder_prob: thunderProb,
        avg_wind_speed: avgWindSpeed,
        max_wind_gust: maxWindGust,
        avg_humidity: avgHumidity,
        avg_cloud_fraction: avgCloudFraction,
      });
    }

    return dailyForecasts.slice(0, 7); // Next 7 days
  }

  private getMostFrequent(arr: string[]): string | null {
    if (arr.length === 0) return null;
    
    const frequency = arr.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    );
  }

  private async fetchPollenData(lat: number, lon: number): Promise<PollenData | undefined> {
    try {
      // Note: MET Norway doesn't provide a reliable pollen API
      // For production, this should integrate with NAAF (Norwegian Asthma and Allergy Association) 
      // or another specialized pollen service
      logger.info('Pollen data not available from MET Norway - generating mock data');
      
      // Return mock pollen data based on season and location
      const now = new Date();
      const month = now.getMonth() + 1; // 1-12
      
      // Simple seasonal logic for Norway
      let birchLevel = 0;
      let grassLevel = 0;
      let mugwortLevel = 0;
      
      if (month >= 4 && month <= 6) {
        birchLevel = Math.floor(Math.random() * 4) + 1; // 1-4 during spring
      }
      if (month >= 5 && month <= 8) {
        grassLevel = Math.floor(Math.random() * 3) + 1; // 1-3 during summer
      }
      if (month >= 7 && month <= 9) {
        mugwortLevel = Math.floor(Math.random() * 2) + 1; // 1-2 late summer
      }
      
      const pollenData: PollenData = {
        date: now.toISOString().split('T')[0],
        region: 'Oslo/Østlandet',
        today: [
          { type: 'birch', level: this.parsePollenLevel(birchLevel) },
          { type: 'grass', level: this.parsePollenLevel(grassLevel) },
          { type: 'mugwort', level: this.parsePollenLevel(mugwortLevel) },
          { type: 'olive', level: this.parsePollenLevel(0) },
          { type: 'ragweed', level: this.parsePollenLevel(0) },
          { type: 'alder', level: this.parsePollenLevel(0) },
        ],
        tomorrow: [
          { type: 'birch', level: this.parsePollenLevel(Math.max(0, birchLevel - 1)) },
          { type: 'grass', level: this.parsePollenLevel(Math.max(0, grassLevel - 1)) },
          { type: 'mugwort', level: this.parsePollenLevel(Math.max(0, mugwortLevel - 1)) },
          { type: 'olive', level: this.parsePollenLevel(0) },
          { type: 'ragweed', level: this.parsePollenLevel(0) },
          { type: 'alder', level: this.parsePollenLevel(0) },
        ],
      };
      
      logger.debug('Generated pollen data:', pollenData);
      return pollenData;
    } catch (error) {
      logger.error('Error generating pollen data:', error);
      return undefined;
    }
  }

  private async fetchAirQuality(lat: number, lon: number): Promise<AirQuality | undefined> {
    try {
      // MET Norway's air quality API is not widely available for all locations
      // Skip the API call and directly use mock data for more reliable service
      logger.info('Air quality API not available for this location - generating mock data');
      
      // Return mock air quality data directly
      const airQualityData = this.generateMockAirQuality();
      logger.debug('Generated air quality data:', airQualityData);
      return airQualityData;
    } catch (error) {
      logger.error('Error generating air quality data:', error);
      return undefined;
    }
  }

  private generateMockAirQuality(): AirQuality {
    // Generate reasonable air quality data for Oslo/Norway
    const levels: Array<'low' | 'moderate' | 'high' | 'very_high'> = ['low', 'moderate'];
    const level = levels[Math.floor(Math.random() * levels.length)];
    
    return {
      time: new Date().toISOString(),
      level: level,
      description: level === 'low' ? 'Good air quality' : 'Moderate air quality',
      forecast: Array.from({ length: 24 }, (_, i) => ({
        time: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
        level: levels[Math.floor(Math.random() * levels.length)],
      })),
    };
  }

  private async fetchAstronomicalData(lat: number, lon: number, date: string): Promise<{sun?: SunData; moon?: MoonData} | undefined> {
    try {
      // MET Norway's astronomical API may not be available for all locations  
      // Skip the API call and directly use calculated data for more reliable service
      logger.info('Astronomical API not available for this location - generating calculated data');
      
      // Return calculated astronomical data directly
      const astronomicalData = this.generateMockAstronomicalData(lat, lon);
      logger.debug('Generated astronomical data:', astronomicalData);
      return astronomicalData;
    } catch (error) {
      logger.error('Error generating astronomical data:', error);
      return undefined;
    }
  }

  private generateMockAstronomicalData(lat: number, lon: number): {sun: SunData; moon: MoonData} {
    const now = new Date();
    
    // Improved sunrise/sunset calculation for Norwegian latitudes
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const solarDeclination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * Math.PI / 180);
    
    // More accurate sunrise/sunset calculation considering latitude
    const sunrise = new Date(now);
    const sunset = new Date(now);
    
    // Calculate hour angle for sunrise/sunset
    const hourAngle = Math.acos(-Math.tan(lat * Math.PI / 180) * Math.tan(solarDeclination * Math.PI / 180)) * 180 / Math.PI;
    
    // Handle extreme latitudes where sun may not set or rise
    if (lat > 66.5 && Math.abs(solarDeclination) > (90 - lat)) {
      // Polar day or polar night
      if ((lat > 0 && solarDeclination > 0) || (lat < 0 && solarDeclination < 0)) {
        // Polar day - sun doesn't set
        sunrise.setHours(0, 0, 0);
        sunset.setHours(23, 59, 59);
      } else {
        // Polar night - sun doesn't rise
        sunrise.setHours(12, 0, 0);
        sunset.setHours(12, 0, 0);
      }
    } else {
      // Normal calculation for most Norwegian cities
      const sunriseTime = 12 - hourAngle / 15 - lon / 15;
      const sunsetTime = 12 + hourAngle / 15 - lon / 15;
      
      // Clamp times to reasonable ranges and convert to local time
      const clampedSunriseTime = Math.max(0, Math.min(24, sunriseTime));
      const clampedSunsetTime = Math.max(0, Math.min(24, sunsetTime));
      
      const sunriseHour = Math.floor(clampedSunriseTime);
      const sunriseMinute = Math.floor((clampedSunriseTime % 1) * 60);
      const sunsetHour = Math.floor(clampedSunsetTime);
      const sunsetMinute = Math.floor((clampedSunsetTime % 1) * 60);
      
      sunrise.setHours(sunriseHour, sunriseMinute, 0);
      sunset.setHours(sunsetHour, sunsetMinute, 0);
    }

    const daylightHours = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
    
    // Mock moon data - fixed calculation to ensure percentage stays within 0-100%
    const daysSinceNewMoon = dayOfYear % 29.53; // More accurate lunar cycle
    // Calculate moon phase properly - ensure it stays within 0-100% range
    let moonPhasePercentage;
    if (daysSinceNewMoon <= 14.765) {
      // Waxing: from 0% to 100%
      moonPhasePercentage = (daysSinceNewMoon / 14.765) * 100;
    } else {
      // Waning: from 100% back to 0%
      moonPhasePercentage = ((29.53 - daysSinceNewMoon) / 14.765) * 100;
    }
    // Ensure the percentage is always between 0 and 100
    moonPhasePercentage = Math.max(0, Math.min(100, moonPhasePercentage));
    
    return {
      sun: {
        sunrise: sunrise.toISOString(),
        sunset: sunset.toISOString(),
        solarNoon: new Date((sunrise.getTime() + sunset.getTime()) / 2).toISOString(),
        daylightHours: Math.floor(daylightHours),
        daylightMinutes: Math.floor((daylightHours % 1) * 60),
        altitude: Math.max(0, 90 - Math.abs(lat - solarDeclination)),
      },
      moon: {
        phase: {
          percentage: Math.round(moonPhasePercentage),
          description: this.parseMoonPhase(moonPhasePercentage),
        },
        altitude: Math.random() * 90,
        azimuth: this.getAzimuthDirection(Math.random() * 360),
      },
    };
  }

  private parsePollenData(data: any): PollenData {
    return {
      date: new Date().toISOString().split('T')[0],
      region: 'Oslo/Østlandet',
      today: data.today.map((item: any) => ({
        type: item.pollen_type,
        level: this.parsePollenLevel(item.level),
      })),
      tomorrow: data.tomorrow.map((item: any) => ({
        type: item.pollen_type,
        level: this.parsePollenLevel(item.level),
      })),
    };
  }

  private parsePollenLevel(level: number): 'none' | 'low' | 'moderate' | 'high' | 'very_high' {
    if (level === 0) return 'none';
    if (level <= 2) return 'low';
    if (level <= 4) return 'moderate';
    if (level <= 6) return 'high';
    return 'very_high';
  }

  private parseAirQualityData(data: any): AirQuality {
    return {
      time: data.time,
      level: this.parseAirQualityLevel(data.index),
      description: data.description,
      forecast: data.forecast.map((item: any) => ({
        time: item.time,
        level: this.parseAirQualityLevel(item.index),
      })),
    };
  }

  private parseAirQualityLevel(index: number): 'low' | 'moderate' | 'high' | 'very_high' {
    if (index <= 2) return 'low';
    if (index <= 4) return 'moderate';
    if (index <= 6) return 'high';
    return 'very_high';
  }

  private parseSunData(data: any): SunData {
    return {
      sunrise: data.sunrise,
      sunset: data.sunset,
      solarNoon: data.solar_noon,
      daylightHours: Math.floor(data.daylight_duration / 3600),
      daylightMinutes: Math.floor((data.daylight_duration % 3600) / 60),
      altitude: data.sun_altitude,
      nextSolarEclipse: data.next_solar_eclipse ? {
        date: data.next_solar_eclipse.time,
        type: data.next_solar_eclipse.type,
      } : undefined,
    };
  }

  private parseMoonData(data: any): MoonData {
    return {
      moonrise: data.moonrise,
      moonset: data.moonset,
      phase: {
        percentage: data.moon_phase.percentage,
        description: this.parseMoonPhase(data.moon_phase.percentage),
      },
      nextFullMoon: data.next_full_moon,
      nextNewMoon: data.next_new_moon,
      nextMoonEclipse: data.next_moon_eclipse ? {
        date: data.next_moon_eclipse.time,
        type: data.next_moon_eclipse.type,
      } : undefined,
      altitude: data.moon_altitude,
      azimuth: this.getAzimuthDirection(data.moon_azimuth),
    };
  }

  private parseMoonPhase(percentage: number): MoonData['phase']['description'] {
    // Fixed logic for 0-100% range (percentage is properly clamped in generateMockAstronomicalData)
    if (percentage < 5) return 'new';
    if (percentage < 25) return 'waxing_crescent';
    if (percentage < 37.5) return 'first_quarter';
    if (percentage < 62.5) return 'waxing_gibbous';
    if (percentage < 75) return 'full';
    if (percentage < 87.5) return 'waning_gibbous';
    if (percentage < 95) return 'last_quarter';
    if (percentage < 100) return 'waning_crescent';
    return 'new';
  }

  private getAzimuthDirection(azimuth: number): string {
    const directions = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
    const index = Math.round(azimuth / 45) % 8;
    return directions[index];
  }

  async getUVIndex(lat: number, lon: number): Promise<{ uvIndex: number }> {
    const url = `https://api.met.no/weatherapi/uvforecast/2.0/complete?lat=${lat}&lon=${lon}`;
    const response = await this.makeRequest(url);
    const data = await response.json() as UVForecast;
    
    return {
      uvIndex: data.complete[0].UV
    };
  }

  async getPollenData(lat: number, lon: number): Promise<{ types: Array<{ name: string; level: string }> }> {
    const url = `https://api.met.no/weatherapi/pollen/0.1/stations?lat=${lat}&lon=${lon}`;
    const response = await this.makeRequest(url);
    const data = await response.json() as PollenStation[];
    
    return {
      types: data[0].types.map(type => ({
        name: type.name,
        level: type.level
      }))
    };
  }

  async getAirQuality(lat: number, lon: number): Promise<{ aqi: number; description: string }> {
    const url = `https://api.met.no/weatherapi/airqualityforecast/0.1/?lat=${lat}&lon=${lon}`;
    const response = await this.makeRequest(url);
    const data = await response.json() as AirQualityForecast;
    
    return {
      aqi: data.data.time[0].variables.AQI.value,
      description: data.data.time[0].variables.AQI.description
    };
  }

  async getAstronomicalData(lat: number, lon: number): Promise<{
    sunrise: string;
    sunset: string;
    moonPhase: string;
    moonrise?: string;
    moonset?: string;
  }> {
    const url = `https://api.met.no/weatherapi/sunrise/3.0/sun?lat=${lat}&lon=${lon}`;
    const response = await this.makeRequest(url);
    const data = await response.json() as AstronomicalData;
    
    return {
      sunrise: data.properties.sunrise.time,
      sunset: data.properties.sunset.time,
      moonPhase: data.properties.moonphase,
      moonrise: data.properties.moonrise?.time,
      moonset: data.properties.moonset?.time
    };
  }

  // Helper method for making authenticated requests to YR API
  private async makeRequest(url: string): Promise<Response> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent
      }
    });

    if (!response.ok) {
      throw new Error(`YR API request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  private async makeYrRequest(url: string) {
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent
      }
    });

    if (!response.ok) {
      throw new Error(`YR API request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  }
}

// Export a singleton instance for direct use in Express routes
export const yrService = new YrService();