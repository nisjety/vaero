// src/hooks/api.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { api } from "../lib/api"; // Axios‐instansen din

// =============================================================================
// 1) Type­definisjoner basert på backend­APIet
// =============================================================================
export interface CurrentWeather {
  time: string;
  temperature: number;
  symbol_code: string;
  wind_speed: number;
  precipitation_probability: number;
  visibility?: number;
  uv_index?: number;
  humidity?: number;
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  symbol_code: string;
  precipitation_probability?: number;
  wind_speed?: number;
}

export interface DailyWeather {
  date: string;
  maxTemp: number;
  minTemp: number;
  symbol_code: string;
  precipitation_probability?: number;
}

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
// 2) Hook: useCurrentWeather (offentlig weather‐data, ingen auth kreves)
// =============================================================================
export const useCurrentWeather = (lat: number, lon: number) => {
  return useQuery<CurrentWeather>({
    queryKey: ["currentWeather", lat, lon],
    queryFn: async () => {
      const response = await api.get<CurrentWeather>("/weather/current", {
        params: { lat, lon },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutter
    enabled: Boolean(lat && lon),
  });
};

// =============================================================================
// 3) Hook: useWeatherWithAI (beskyttet, krever at bruker er logget inn)
// =============================================================================
export function useWeatherWithAI(lat: number, lon: number, options?: any) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<WeatherWithAI>({
    queryKey: ["weatherWithAI", lat, lon],
    queryFn: async () => {
      // Fallback til mock data hvis ikke autentisert (for demo)
      if (!isSignedIn) {
        return {
          current: {
            time: new Date().toISOString(),
            temperature: 14,
            symbol_code: 'cloudy',
            wind_speed: 5.5,
            precipitation_probability: 50,
            visibility: 18,
          },
          hourly: Array.from({ length: 24 }, (_, i) => ({
            time: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
            temperature: 14 + Math.sin(i / 4) * 3,
            symbol_code: i < 8 ? 'cloudy' : 'partlycloudy',
            precipitation_probability: Math.max(0, 50 - i * 2),
            wind_speed: 5.5 + Math.random() * 2,
          })),
          daily: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
            maxTemp: 14 + Math.random() * 5,
            minTemp: 8 + Math.random() * 3,
            symbol_code: i % 2 === 0 ? 'cloudy' : 'partlycloudy',
            precipitation_probability: Math.max(0, 50 - i * 5),
          })),
          clothingSuggestion: {
            items: ['Lett jakke', 'Genser', 'Lange bukser'],
            explanation: 'Kjølig og skyet vær, kle deg i lag',
          },
        };
      }

      // Hent gyldig Clerk‐token (forutsetter at isLoaded && isSignedIn er true)
      const token = await getToken();
      const response = await api.get<WeatherWithAI>("/weather/current", {
        params: { lat, lon },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: Boolean(lat && lon && isLoaded),
    retry: (failureCount, error: any) => {
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
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
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
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
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