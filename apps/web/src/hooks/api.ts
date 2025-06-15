// Updated api.ts with correct endpoints and response handling
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { api } from "../lib/api";

// Update the API interfaces to match backend responses
export interface CurrentWeather {
  time: string;
  temperature: number;
  symbol_code: string;
  wind_speed: number;
  wind_direction: number;
  pressure: number;
  humidity: number;
  dew_point?: number;
  fog?: number;
  uv_index?: number;
  wind_gust?: number;
  temp_pct_10?: number;
  temp_pct_90?: number;
  wind_pct_10?: number;
  wind_pct_90?: number;
  cloud_fraction?: number;
  cloud_fraction_low?: number;
  cloud_fraction_medium?: number;
  cloud_fraction_high?: number;
  precip_amount?: number;
  precip_min?: number;
  precip_max?: number;
  precip_prob?: number;
  thunder_prob?: number;
}

// Backend response structure for current weather
export interface CurrentWeatherResponse {
  success: boolean;
  location: {
    lat: number;
    lon: number;
    name?: string;
    region?: string;
    country: string;
  };
  current: {
    timestamp: string;
    location: { lat: number; lon: number; altitude?: number };
    temperature: {
      current: number;
      feels_like: number;
      dew_point?: number;
      percentile_10?: number;
      percentile_90?: number;
    };
    atmospheric: {
      pressure: number;
      humidity: number;
      visibility?: number;
    };
    wind: {
      speed: number;
      direction: number;
      gust?: number;
      percentile_10?: number;
      percentile_90?: number;
    };
    clouds: {
      total_cover: number;
      low_cover?: number;
      medium_cover?: number;
      high_cover?: number;
    };
    precipitation: {
      amount?: number;
      probability?: number;
      thunder_probability?: number;
    };
    conditions: {
      symbol_code: string;
      description: string;
      uv_index?: number;
      fog_fraction?: number;
    };
  };
  last_updated: string;
  timestamp: string;
}

// Additional weather interfaces
export interface HourlyWeather {
  timestamp: string;
  temperature: number;
  wind_speed: number;
  wind_direction: number;
  humidity: number;
  pressure: number;
  symbol_code: string;
  precip_amount?: number;
  precip_prob?: number;
}

export interface DailyWeather {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  wind_speed: number;
  humidity: number;
  symbol_code: string;
  precip_amount?: number;
  precip_prob?: number;
}

export interface WeatherInsights {
  summary: string;
  comfort: string;
  comfortReason: string;
  highlights: string[];
  tips: string[];
  aiModel: string;
  enhanced: boolean;
}

// Enhanced weather response from AI endpoints
export interface EnhancedWeatherResponse {
  location: { lat: number; lon: number; altitude?: number };
  weather: {
    current: CurrentWeather;
    hourly: HourlyWeather[];
    daily: DailyWeather[];
  };
  insights?: WeatherInsights;
  ai?: {
    insights: Record<string, unknown>;
    meteorological?: {
      synopsis: string;
      confidence_level: string;
      weather_patterns: {
        current_system: string;
        trend: string;
        pressure_tendency: string;
      };
    };
    model: string;
    enhanced: boolean;
  };
  performance: {
    responseTime: number;
    cached: boolean;
  };
  timestamp: string;
}

// Fixed UV response interface
export interface UVResponse {
  success: boolean;
  location: { lat: number; lon: number };
  uv: {
    index: number | null;
    level: string;
    description: string;
    protection_needed: boolean;
    recommendations: string[];
  };
  timestamp: string;
}

// Fixed Air Quality response
export interface AirQualityResponse {
  success: boolean;
  location: { lat: number; lon: number };
  air_quality?: {
    current: {
      aqi: number;
      level: string;
      description: string;
    };
  };
  data?: Record<string, unknown>;
  message?: string;
  timestamp: string;
}

// Fixed Pollen response
export interface PollenResponse {
  success: boolean;
  location: { lat: number; lon: number };
  pollen?: {
    region: string;
    data: {
      today: Array<{
        type: string;
        level: string;
        index: number;
      }>;
      tomorrow: Array<{
        type: string;
        level: string;
        index: number;
      }>;
    };
  };
  data?: Record<string, unknown>;
  message?: string;
  timestamp: string;
}

// Fixed Astronomical response
export interface AstronomicalResponse {
  success: boolean;
  location: { lat: number; lon: number };
  astronomical?: {
    sun: {
      sunrise: string;
      sunset: string;
      solar_noon: string;
      daylight_duration: { hours: number; minutes: number };
      elevation: number;
      azimuth: number;
    };
    moon: {
      moonrise?: string;
      moonset?: string;
      phase: {
        percentage: number;
        name: string;
        description: string;
      };
      elevation: number;
      azimuth: number;
    };
  };
  timestamp: string;
}

// Fixed Forecast response
export interface ForecastResponse {
  success: boolean;
  location: { lat: number; lon: number; altitude?: number };
  hourly: Array<{
    timestamp: string;
    temperature: number;
    symbol_code: string;
    precipitation: { amount?: number; probability?: number };
    wind: { speed: number; direction: number };
    humidity: number;
    pressure: number;
  }>;
  daily: Array<{
    date: string;
    temperature: { max: number; min: number; avg: number };
    conditions: { symbol_code: string; description: string };
    precipitation: { total: number; probability: number; thunder_probability: number };
    wind: { avg_speed: number; max_gust: number };
    atmospheric: { avg_humidity: number; avg_pressure: number };
    comfort_index: number;
  }>;
  forecast_length: number;
  timestamp: string;
}

// =============================================================================
// UPDATED API HOOKS WITH CORRECT ENDPOINTS
// =============================================================================

// Basic current weather (free)
export const useCurrentWeather = (lat: number, lon: number) => {
  return useQuery<CurrentWeatherResponse>({
    queryKey: ["currentWeather", lat, lon],
    queryFn: async () => {
      const response = await api.get<CurrentWeatherResponse>("/weather/current", {
        params: { lat, lon },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: Boolean(lat && lon),
  });
};

// Detailed weather with AI enhancement (free)
export const useDetailedWeather = (lat: number, lon: number) => {
  return useQuery<EnhancedWeatherResponse>({
    queryKey: ["detailedWeather", lat, lon],
    queryFn: async () => {
      const response = await api.get("/weather-ai/enhanced", {
        params: { lat, lon },
      });

      // Transform the API response to match the expected frontend interface
      const apiData = response.data;

      // Extract current weather data from nested structure
      const apiCurrent = apiData.weather?.current;
      if (!apiCurrent) {
        throw new Error('No current weather data available');
      }

      // Map nested API structure to flat structure expected by frontend
      const transformedCurrent: CurrentWeather = {
        time: apiCurrent.timestamp || new Date().toISOString(),
        temperature: apiCurrent.temperature?.current ?? apiCurrent.temperature,
        symbol_code: apiCurrent.conditions?.symbol_code ?? apiCurrent.symbol_code,
        wind_speed: apiCurrent.wind?.speed ?? apiCurrent.wind_speed,
        wind_direction: apiCurrent.wind?.direction ?? apiCurrent.wind_direction,
        pressure: apiCurrent.atmospheric?.pressure ?? apiCurrent.pressure,
        humidity: apiCurrent.atmospheric?.humidity ?? apiCurrent.humidity,
        dew_point: apiCurrent.temperature?.dew_point ?? apiCurrent.dew_point,
        uv_index: apiCurrent.conditions?.uv_index ?? apiCurrent.uv_index,
        wind_gust: apiCurrent.wind?.gust ?? apiCurrent.wind_gust,
        precip_amount: apiCurrent.precipitation?.amount ?? apiCurrent.precip_amount,
        precip_prob: apiCurrent.precipitation?.probability ?? apiCurrent.precip_prob,
        thunder_prob: apiCurrent.precipitation?.thunder_probability ?? apiCurrent.thunder_prob,
        cloud_fraction: apiCurrent.clouds?.total_cover ?? apiCurrent.cloud_fraction,
        fog: apiCurrent.conditions?.fog_fraction ?? apiCurrent.fog,
      };

      // Transform the response to expected format
      const transformedData: EnhancedWeatherResponse = {
        location: apiData.location,
        weather: {
          current: transformedCurrent,
          hourly: apiData.weather?.hourly || [],
          daily: apiData.weather?.daily || []
        },
        insights: apiData.insights,
        ai: apiData.ai,
        performance: apiData.performance || { responseTime: 0, cached: false },
        timestamp: apiData.timestamp
      };

      return transformedData;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: Boolean(lat && lon),
  });
};

// Enhanced weather hook (alias for useDetailedWeather for backward compatibility)
export const useEnhancedWeather = useDetailedWeather;

// UV Index data (free) - Fixed endpoint
export const useUVData = (lat: number, lon: number) => {
  return useQuery<UVResponse>({
    queryKey: ["uvData", lat, lon],
    queryFn: async () => {
      const response = await api.get<UVResponse>("/weather/uv", {
        params: { lat, lon },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: Boolean(lat && lon),
  });
};

// Air Quality data (free)
export const useAirQuality = (lat: number, lon: number) => {
  return useQuery<AirQualityResponse>({
    queryKey: ["airQuality", lat, lon],
    queryFn: async () => {
      const response = await api.get<AirQualityResponse>("/weather/air-quality", {
        params: { lat, lon },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: Boolean(lat && lon),
  });
};

// Pollen data (free)
export const usePollenData = (lat: number, lon: number) => {
  return useQuery<PollenResponse>({
    queryKey: ["pollenData", lat, lon],
    queryFn: async () => {
      const response = await api.get<PollenResponse>("/weather/pollen", {
        params: { lat, lon },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
    enabled: Boolean(lat && lon),
  });
};

// Astronomical data (free) - Fixed endpoint name
export const useAstronomicalData = (lat: number, lon: number) => {
  return useQuery<AstronomicalResponse>({
    queryKey: ["astronomicalData", lat, lon],
    queryFn: async () => {
      const response = await api.get<AstronomicalResponse>("/weather/astronomical", {
        params: { lat, lon },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: Boolean(lat && lon),
  });
};

// Forecast data (free) - Fixed parameter names
export const useForecast = (lat: number, lon: number, hours = 24, days = 7) => {
  return useQuery<ForecastResponse>({
    queryKey: ["forecast", lat, lon, hours, days],
    queryFn: async () => {
      // Use hourly endpoint for hourly data and daily for daily data
      const response = await api.get<ForecastResponse>("/weather/hourly", {
        params: { lat, lon, hours },
      });

      // Get daily data separately
      const dailyResponse = await api.get("/weather/daily", {
        params: { lat, lon, days },
      });

      return {
        ...response.data,
        daily: dailyResponse.data.daily || []
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: Boolean(lat && lon),
  });
};

// Oslo instant weather
export const useOsloWeather = () => {
  return useQuery<EnhancedWeatherResponse>({
    queryKey: ["osloWeather"],
    queryFn: async () => {
      const response = await api.get<EnhancedWeatherResponse>("/weather-ai/oslo");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Keep all the authenticated endpoints as they were...
// (Premium tier endpoints with authentication)

export function useWeatherWithAI(lat: number, lon: number, options?: UseQueryOptions<EnhancedWeatherResponse>) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["weatherWithAI", lat, lon],
    queryFn: async () => {
      if (!isSignedIn) {
        // Return mock data for demo when not authenticated
        return {
          current: {
            time: new Date().toISOString(),
            temperature: 14,
            symbol_code: 'cloudy',
            wind_speed: 5.5,
            wind_direction: 225,
            pressure: 1015,
            humidity: 65,
          },
          hourly: Array.from({ length: 24 }, (_, i) => ({
            time: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
            temperature: 14 + Math.sin(i / 4) * 3,
            symbol_code: i < 8 ? 'cloudy' : 'partlycloudy',
            precipitation: { amount: Math.max(0, 2 - i * 0.1) },
            wind: { speed: 5.5 + Math.random() * 2, direction: 225 },
            humidity: 65,
            pressure: 1015,
          })),
          daily: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
            temperature: { max: 14 + Math.random() * 5, min: 8 + Math.random() * 3, avg: 11 },
            conditions: { symbol_code: i % 2 === 0 ? 'cloudy' : 'partlycloudy', description: 'Skyet' },
            precipitation: { total: 0.2, probability: Math.max(0, 50 - i * 5), thunder_probability: 5 },
            wind: { avg_speed: 5.5, max_gust: 8.5 },
            atmospheric: { avg_humidity: 65, avg_pressure: 1015 },
            comfort_index: 65,
          })),
          clothingSuggestion: {
            items: ['Lett jakke', 'Genser', 'Lange bukser'],
            explanation: 'Kjølig og skyet vær, kle deg i lag',
          },
        };
      }

      const token = await getToken();
      const response = await api.get("/ai/weather", {
        params: { lat, lon },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: Boolean(lat && lon && isLoaded),
    retry: (failureCount, error: unknown) => {
      if ((error as any)?.response?.status === 401) return false;
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

// Keep other authenticated hooks as they were...
export function useDailySummary(lat: number, lon: number) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["dailySummary", lat, lon],
    queryFn: async () => {
      if (!isSignedIn) {
        return {
          summary: 'Variabel skydekke med lette regnbyger. Høy 14°C. Vind Ø på 5 m/s. Sannsynlighet for regn 50%.',
        };
      }

      const token = await getToken();
      const response = await api.get("/ai/daily-summary", {
        params: { lat, lon },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: Boolean(lat && lon && isLoaded),
    retry: (failureCount, error: unknown) => {
      if ((error as any)?.response?.status === 401) return false;
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Keep other hooks unchanged...
export const usePackingList = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useMutation({
    mutationFn: async (request: { location: string; days: number; activities?: string[] }) => {
      if (isLoaded && isSignedIn) {
        const token = await getToken();
        const response = await api.post("/ai/packing-list", request, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
      } else {
        const response = await api.post("/ai/packing-list", request);
        return response.data;
      }
    },
  });
};

export const useAskAI = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useMutation({
    mutationFn: async (request: { question: string; context?: Record<string, unknown> }) => {
      if (isLoaded && isSignedIn) {
        const token = await getToken();
        const response = await api.post("/ai/ask", request, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
      } else {
        const response = await api.post("/ai/ask", request);
        return response.data;
      }
    },
  });
};

// User preferences hooks (require auth)
export function useUserPrefs() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["userPrefs"],
    queryFn: async () => {
      const token = await getToken();
      const response = await api.get("/users/me/prefs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: Boolean(isLoaded && isSignedIn),
    retry: (failureCount, error: unknown) => {
      if ((error as any)?.response?.status === 401) return false;
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export const useUpdateUserPrefs = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prefs: Record<string, unknown>) => {
      if (!isLoaded || !isSignedIn) {
        throw new Error("Bruker må være logget inn for å oppdatere innstillinger");
      }

      const token = await getToken();
      const response = await api.put("/users/me/prefs", prefs, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPrefs"] });
    },
  });
};

export const useRegisterDevice = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useMutation({
    mutationFn: async (device: { platform: string; pushToken: string }) => {
      if (isLoaded && isSignedIn) {
        const token = await getToken();
        await api.post(
          "/users/me/device",
          { platform: device.platform, pushToken: device.pushToken },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        throw new Error("Bruker må være logget inn for å registrere enhet");
      }
    },
    onError: (error) => {
      console.error("Kunne ikke registrere device:", error);
    },
  });
};