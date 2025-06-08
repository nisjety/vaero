// src/hooks/api.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { api } from "../lib/api";

// =============================================================================
// TypeScript interfaces based on actual backend API responses
// =============================================================================
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

// Enhanced weather data interfaces matching backend API
export interface SunData {
  sunrise: string;
  sunset: string;
  solarNoon: string;
  daylightHours: number;
  daylightMinutes: number;
  altitude: number;
}

export interface MoonData {
  phase: {
    percentage: number;
    description: string;
  };
  altitude: number;
  azimuth: string;
}

export interface AstronomicalData {
  sun: SunData;
  moon: MoonData;
}

export interface AirQualityForecast {
  time: string;
  level: string;
}

export interface AirQualityData {
  time: string;
  level: string;
  description: string;
  forecast: AirQualityForecast[];
}

export interface PollenItem {
  type: string;
  level: string;
}

export interface PollenData {
  date: string;
  region: string;
  today: PollenItem[];
  tomorrow: PollenItem[];
}

export interface DetailedWeatherResponse {
  location: {
    lat: number;
    lon: number;
  };
  current: CurrentWeather;
  sun: SunData;
  moon: MoonData;
  airQuality: AirQualityData;
  pollen: PollenData;
  timestamp: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HourlyWeather extends CurrentWeather {}

export interface DailyWeather {
  date: string;
  maxTemp: number;
  minTemp: number;
  symbol_code: string;
  precip_amount?: number;
  precip_min?: number;
  precip_max?: number;
  precip_prob?: number;
  thunder_prob?: number;
  avg_wind_speed?: number;
  max_wind_gust?: number;
  avg_humidity?: number;
  avg_cloud_fraction?: number;
}

// UV Index data interface
export interface UVData {
  uv_index: number | null;
  uv_warning: string | null;
}

// API Response wrapper interfaces for free tier endpoints
export interface CurrentWeatherResponse {
  location: {
    lat: number;
    lon: number;
  };
  current: CurrentWeather;
  cached?: boolean;
  timestamp: string;
}

export interface UVResponse {
  location: {
    lat: number;
    lon: number;
  };
  uv_index: number | null;
  uv_warning: string | null;
  timestamp: string;
}

export interface AirQualityResponse {
  location: {
    lat: number;
    lon: number;
  };
  airQuality: AirQualityData;
  timestamp: string;
}

export interface PollenResponse {
  location: {
    lat: number;
    lon: number;
  };
  pollen: PollenData;
  timestamp: string;
}

export interface AstronomicalResponse {
  location: {
    lat: number;
    lon: number;
  };
  sun: SunData;
  moon: MoonData;
  timestamp: string;
}

export interface ForecastResponse {
  location: {
    lat: number;
    lon: number;
    altitude?: number;
  };
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  timestamp: string;
}

// Enhanced weather response interface (for AI-enabled endpoints)
export interface WeatherInsights {
  summary: string;
  clothing: ClothingSuggestion;
}

export interface EnhancedWeatherResponse {
  weather: {
    current: CurrentWeather;
    hourly: HourlyWeather[];
    daily: DailyWeather[];
  };
  insights?: WeatherInsights;
  location: {
    lat: number;
    lon: number;
  };
  timestamp: string;
}

// Legacy interfaces for AI-enhanced features (require authentication)
export interface ClothingSuggestion {
  items: string[];
  explanation: string;
}

export interface WeatherWithAI {
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  clothingSuggestion: ClothingSuggestion;
}

export interface DailySummary {
  summary: string;
}

export interface ActivitySuggestion {
  activity: string;
  reason: string;
}

export interface PackingListRequest {
  lat: number;
  lon: number;
  startDate: string;
  endDate: string;
}

export interface PackingList {
  items: string[];
  notes: string;
}

export interface AskAIRequest {
  question: string;
}

export interface AskAIResponse {
  answer: string;
}

export interface UserPrefs {
  unit: "metric" | "imperial";
  timeFormat: "24h" | "12h";
  defaultLat?: number;
  defaultLon?: number;
  stylePreferences?: {
    gender?: string;
    style?: string;
    owns?: string[];
  };
  notifTempBelow?: number;
  notifTempAbove?: number;
  notifRainProb?: number;
}

// =============================================================================
// FREE TIER WEATHER API HOOKS - No authentication required
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

// Detailed weather with all enhanced features (free)
export const useDetailedWeather = (lat: number, lon: number) => {
  return useQuery<EnhancedWeatherResponse>({
    queryKey: ["detailedWeather", lat, lon],
    queryFn: async () => {
      const response = await api.get<EnhancedWeatherResponse>("/weather-ai/enhanced", {
        params: { lat, lon },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: Boolean(lat && lon),
  });
};

// UV Index data (free)
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

// Astronomical data (free)
export const useAstronomicalData = (lat: number, lon: number) => {
  return useQuery<AstronomicalResponse>({
    queryKey: ["astronomicalData", lat, lon],
    queryFn: async () => {
      const response = await api.get<AstronomicalResponse>("/weather/astro", {
        params: { lat, lon },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: Boolean(lat && lon),
  });
};

// Forecast data (free) - hourly and daily
export const useForecast = (lat: number, lon: number, hours = 24, days = 7) => {
  return useQuery<ForecastResponse>({
    queryKey: ["forecast", lat, lon, hours, days],
    queryFn: async () => {
      const response = await api.get<ForecastResponse>("/weather/forecast", {
        params: { lat, lon, hours, days },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: Boolean(lat && lon),
  });
};

// =============================================================================
// 2.5) Hook: useEnhancedWeather (AI-enhanced weather data, public with optional auth)
// =============================================================================
export const useEnhancedWeather = (lat: number, lon: number, options?: { enabled?: boolean }) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<EnhancedWeatherResponse>({
    queryKey: ["enhancedWeather", lat, lon, isSignedIn],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      
      // Add auth token if available for personalized data
      if (isLoaded && isSignedIn) {
        try {
          const token = await getToken();
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn('Failed to get auth token, continuing without auth:', error);
        }
      }

      const response = await api.get<EnhancedWeatherResponse>("/weather-ai/enhanced", {
        params: { lat, lon },
        headers,
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutter
    enabled: Boolean(lat && lon && (options?.enabled !== false)),
  });
};

// =============================================================================
// 2.6) Hook: useOsloWeather (instant Oslo weather from cache)
// =============================================================================
export const useOsloWeather = () => {
  return useQuery<EnhancedWeatherResponse>({
    queryKey: ["osloWeather"],
    queryFn: async () => {
      const response = await api.get<EnhancedWeatherResponse>("/weather-ai/oslo");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutter
    refetchOnWindowFocus: true,
  });
};

// =============================================================================
// 3) Hook: useWeatherWithAI (beskyttet, krever at bruker er logget inn)
// =============================================================================
export function useWeatherWithAI(lat: number, lon: number, options?: UseQueryOptions<WeatherWithAI>) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<WeatherWithAI>({
    queryKey: ["weatherWithAI", lat, lon],
    queryFn: async () => {
      // Fallback til mock data hvis ikke autentisert (for demo)
      if (!isSignedIn) {
        const baseMockWeather: CurrentWeather = {
          time: new Date().toISOString(),
          temperature: 14,
          symbol_code: 'cloudy',
          wind_speed: 5.5,
          wind_direction: 225,
          pressure: 1015,
          humidity: 65,
          dew_point: 8,
          fog: 0,
          uv_index: 2,
          wind_gust: 8.5,
          temp_pct_10: 12,
          temp_pct_90: 16,
          wind_pct_10: 3.5,
          wind_pct_90: 7.5,
          cloud_fraction: 80,
          cloud_fraction_low: 60,
          cloud_fraction_medium: 40,
          cloud_fraction_high: 20,
          precip_amount: 0.2,
          precip_min: 0,
          precip_max: 0.5,
          precip_prob: 50,
          thunder_prob: 5,
        };

        return {
          current: baseMockWeather,
          hourly: Array.from({ length: 24 }, (_, i) => ({
            ...baseMockWeather,
            time: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
            temperature: 14 + Math.sin(i / 4) * 3,
            symbol_code: i < 8 ? 'cloudy' : 'partlycloudy',
            precip_prob: Math.max(0, 50 - i * 2),
            wind_speed: 5.5 + Math.random() * 2,
          })),
          daily: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
            maxTemp: 14 + Math.random() * 5,
            minTemp: 8 + Math.random() * 3,
            symbol_code: i % 2 === 0 ? 'cloudy' : 'partlycloudy',
            precip_amount: 0.2,
            precip_min: 0,
            precip_max: 0.5,
            precip_prob: Math.max(0, 50 - i * 5),
            thunder_prob: 5,
            avg_wind_speed: 5.5,
            max_wind_gust: 8.5,
            avg_humidity: 65,
            avg_cloud_fraction: 80,
          })),
          clothingSuggestion: {
            items: ['Lett jakke', 'Genser', 'Lange bukser'],
            explanation: 'Kjølig og skyet vær, kle deg i lag',
          },
        };
      }

      // Hent gyldig Clerk‐token (forutsetter at isLoaded && isSignedIn er true)
      const token = await getToken();
      const response = await api.get<WeatherWithAI>("/weather", {
        params: { lat, lon },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: Boolean(lat && lon && isLoaded),
    retry: (failureCount, error: Error & { response?: { status: number } }) => {
      // Ikke retry ved 401 (ikke autentisert)
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // 5 minutter
    ...options,
  });
}

// =============================================================================
// 4) Hook: useDailySummary (beskyttet AI‐sammendrag)
// =============================================================================
export function useDailySummary(lat: number, lon: number) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<DailySummary>({
    queryKey: ["dailySummary", lat, lon],
    queryFn: async () => {
      // Fallback til mock data hvis ikke autentisert (for demo)
      if (!isSignedIn) {
        return {
          summary: 'Variabel skydekke med snøbyger. Høy 14°C. Vind Ø på 10 til 20 mph. Sannsynlighet for snø 50%. Snøakkumulasjoner mindre enn en tomme.',
        };
      }

      // Hent Clerk‐token etter auth‐sjekk
      const token = await getToken();
      const response = await api.get<DailySummary>("/ai/daily-summary", {
        params: { lat, lon },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: Boolean(lat && lon && isLoaded),
    retry: (failureCount, error) => {
      const errorWithResponse = error as { response?: { status?: number } };
      if (errorWithResponse?.response?.status === 401) return false;
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 60, // 1 time
  });
}

// =============================================================================
// 5) Hook: usePackingList (AI‐mutasjon, krever ingen session‐token hvis din backend
//    ikke beskytter denne ruten. Legg til token‐header hvis nødvendig.)
// =============================================================================
export const usePackingList = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useMutation<PackingList, Error, PackingListRequest>({
    mutationFn: async (request) => {
      // Hvis autentisert, send med token
      if (isLoaded && isSignedIn) {
        const token = await getToken();
        const response = await api.post<PackingList>("/ai/packing-list", request, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
      } else {
        // Fallback uten autentisering
        const response = await api.post<PackingList>("/ai/packing-list", request);
        return response.data;
      }
    },
    // Du kan eventuelt legge til onError/onSuccess callbacks her
  });
};

// =============================================================================
// 6) Hook: useAskAI (AI‐mutasjon for fri tekst‐forespørsel)
// =============================================================================
export const useAskAI = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useMutation<AskAIResponse, Error, AskAIRequest>({
    mutationFn: async (request) => {
      // Hvis autentisert, send med token
      if (isLoaded && isSignedIn) {
        const token = await getToken();
        const response = await api.post<AskAIResponse>("/ai/ask", request, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
      } else {
        // Fallback uten autentisering
        const response = await api.post<AskAIResponse>("/ai/ask", request);
        return response.data;
      }
    },
  });
};

// =============================================================================
// 7) Hook: useUserPrefs (henter brukerinnstillinger, beskyttet rute)
// =============================================================================
export function useUserPrefs() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<UserPrefs>({
    queryKey: ["userPrefs"],
    queryFn: async () => {
      const token = await getToken();
      const response = await api.get<UserPrefs>("/users/me/prefs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: Boolean(isLoaded && isSignedIn),
    retry: (failureCount, error) => {
      const errorWithResponse = error as { response?: { status?: number } };
      if (errorWithResponse?.response?.status === 401) return false;
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 10, // 10 minutter
  });
}

// =============================================================================
// 8) Hook: useUpdateUserPrefs (oppdaterer brukerinnstillinger)
// =============================================================================
export const useUpdateUserPrefs = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<UserPrefs, Error, Partial<UserPrefs>>({
    mutationFn: async (prefs) => {
      if (!isLoaded || !isSignedIn) {
        throw new Error("Bruker må være logget inn for å oppdatere innstillinger");
      }
      
      const token = await getToken();
      const response = await api.put<UserPrefs>("/users/me/prefs", prefs, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      // Når oppdatering lykkes, invalideres cache for brukerinnstillinger
      queryClient.invalidateQueries({ queryKey: ["userPrefs"] });
    },
  });
};

// =============================================================================
// 9) Hook: useRegisterDevice (registrerer push‐device til backend, beskyttet)
// =============================================================================
export const useRegisterDevice = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useMutation<void, Error, { platform: string; pushToken: string }>({
    mutationFn: async (device) => {
      // Hvis backend krever autentisering, hent token først
      if (isLoaded && isSignedIn) {
        const token = await getToken();
        await api.post(
          "/users/me/device",
          { platform: device.platform, pushToken: device.pushToken },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Hvis ikke autentisert, kast feil
        throw new Error("Bruker må være logget inn for å registrere enhet");
      }
    },
    onError: (error) => {
      console.error("Kunne ikke registrere device:", error);
    },
  });
};

// =============================================================================
// AI-ENHANCED LEGACY ENDPOINTS (require authentication)
// =============================================================================;