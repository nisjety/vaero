import { env } from '../utils/env';
import { redis } from '../utils/redis';
import { logger } from '../utils/logger';

export interface YrCurrent {
  time: string;
  temperature: number;
  symbol_code: string;
  wind_speed: number;
  precipitation_probability: number;
  humidity?: number;
  pressure?: number;
}

export interface YrHourly {
  time: string;
  temperature: number;
  symbol_code: string;
  wind_speed?: number;
  precipitation_probability?: number;
}

export interface YrDaily {
  date: string;
  maxTemp: number;
  minTemp: number;
  symbol_code: string;
  precipitation_probability?: number;
}

export interface WeatherData {
  current: YrCurrent;
  hourly: YrHourly[];
  daily: YrDaily[];
}

class YrService {
  private readonly baseUrl = 'https://api.met.no/weatherapi/locationforecast/2.0';
  private readonly userAgent = env.YR_USER_AGENT;
  private readonly fromEmail = env.YR_FROM_EMAIL;

  async getWeather(lat: number, lon: number): Promise<WeatherData> {
    const cacheKey = `weather:${lat}:${lon}`;
    
    try {
      // Check cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info({ lat, lon }, 'Weather data retrieved from cache');
        return JSON.parse(cached);
      }

      // Fetch from Yr API
      const rawData = await this.fetchFromYr(lat, lon);
      const parsed = this.parseYrResponse(rawData);
      
      // Cache for 10 minutes
      await redis.set(cacheKey, JSON.stringify(parsed), 'EX', 600);
      
      logger.info({ lat, lon }, 'Weather data fetched from Yr API and cached');
      return parsed;
    } catch (error) {
      logger.error({ error, lat, lon }, 'Failed to get weather data');
      throw error;
    }
  }

  private async fetchFromYr(lat: number, lon: number): Promise<any> {
    const url = `${this.baseUrl}/compact?lat=${lat}&lon=${lon}`;
    
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
    const symbolCode = entry.data?.next_1_hours?.summary?.symbol_code || 
                      entry.data?.next_6_hours?.summary?.symbol_code || 
                      'unknown';

    return {
      time: entry.time,
      temperature: instant.air_temperature || 0,
      symbol_code: symbolCode,
      wind_speed: instant.wind_speed || 0,
      precipitation_probability: next1h.precipitation_amount ? 
        Math.min(100, (next1h.precipitation_amount / 10) * 100) : 0,
      humidity: instant.relative_humidity,
      pressure: instant.air_pressure_at_sea_level,
    };
  }

  private parseHourlyForecast(timeseries: any[]): YrHourly[] {
    return timeseries.map(entry => {
      const instant = entry.data?.instant?.details || {};
      const next1h = entry.data?.next_1_hours?.details || {};
      const symbolCode = entry.data?.next_1_hours?.summary?.symbol_code || 
                        entry.data?.next_6_hours?.summary?.symbol_code || 
                        'unknown';

      return {
        time: entry.time,
        temperature: instant.air_temperature || 0,
        symbol_code: symbolCode,
        wind_speed: instant.wind_speed,
        precipitation_probability: next1h.precipitation_amount ? 
          Math.min(100, (next1h.precipitation_amount / 10) * 100) : 0,
      };
    });
  }

  private parseDailyForecast(timeseries: any[]): YrDaily[] {
    const dailyData = new Map<string, { temps: number[], symbols: string[], precip: number[] }>();

    // Group data by date
    timeseries.forEach(entry => {
      const date = entry.time.split('T')[0];
      const temp = entry.data?.instant?.details?.air_temperature;
      const symbolCode = entry.data?.next_6_hours?.summary?.symbol_code || 
                        entry.data?.next_12_hours?.summary?.symbol_code || 
                        entry.data?.next_1_hours?.summary?.symbol_code;
      const precipAmount = entry.data?.next_6_hours?.details?.precipitation_amount || 0;

      if (!dailyData.has(date)) {
        dailyData.set(date, { temps: [], symbols: [], precip: [] });
      }

      const dayData = dailyData.get(date)!;
      if (temp !== undefined) dayData.temps.push(temp);
      if (symbolCode) dayData.symbols.push(symbolCode);
      dayData.precip.push(precipAmount);
    });

    // Convert to daily forecasts
    const dailyForecasts: YrDaily[] = [];
    for (const [date, data] of dailyData) {
      if (data.temps.length === 0) continue;

      const maxTemp = Math.max(...data.temps);
      const minTemp = Math.min(...data.temps);
      const mostCommonSymbol = this.getMostFrequent(data.symbols) || 'unknown';
      const totalPrecip = data.precip.reduce((sum, p) => sum + p, 0);
      const precipProb = Math.min(100, totalPrecip > 0 ? (totalPrecip / 10) * 100 : 0);

      dailyForecasts.push({
        date,
        maxTemp,
        minTemp,
        symbol_code: mostCommonSymbol,
        precipitation_probability: precipProb,
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
}

export const yrService = new YrService();
