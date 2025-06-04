import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';

// Types based on the backend API
export interface CurrentWeather {
  time: string;
  temperature: number;
  symbol_code: string;
  wind_speed: number;
  precipitation_probability: number;
  humidity?: number;
  pressure?: number;
  visibility?: number;
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
  unit: 'metric' | 'imperial';
  timeFormat: '24h' | '12h';
  defaultLat?: number;
  defaultLon?: number;
  stylePreferences?: {
    gender: string;
    style: string;
    owns?: string[];
  };
  notifTempBelow?: number;
  notifTempAbove?: number;
  notifRainProb?: number;
}

// Weather hooks
export const useWeatherWithAI = (lat: number, lon: number) => {
  const api = useApi();
  
  return useQuery<WeatherWithAI>({
    queryKey: ['weatherWithAI', lat, lon],
    queryFn: async () => {
      const { data } = await api.get('/weather', { params: { lat, lon } });
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: Boolean(lat && lon),
  });
};

export const useDailySummary = (lat: number, lon: number) => {
  const api = useApi();
  
  return useQuery<DailySummary>({
    queryKey: ['dailySummary', lat, lon],
    queryFn: async () => {
      const { data } = await api.get('/ai/daily-summary', { params: { lat, lon } });
      return data;
    },
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
    enabled: Boolean(lat && lon),
  });
};

export const useActivitySuggestion = (lat: number, lon: number, date: string) => {
  const api = useApi();
  
  return useQuery<ActivitySuggestion>({
    queryKey: ['activitySuggestion', lat, lon, date],
    queryFn: async () => {
      const { data } = await api.get('/ai/activity', { params: { lat, lon, date } });
      return data;
    },
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
    enabled: Boolean(lat && lon && date),
  });
};

// AI Mutations
export const usePackingList = () => {
  const api = useApi();
  
  return useMutation<PackingList, Error, PackingListRequest>({
    mutationFn: async (request) => {
      const { data } = await api.post('/ai/packing-list', request);
      return data;
    },
  });
};

export const useAskAI = () => {
  const api = useApi();
  
  return useMutation<AskAIResponse, Error, AskAIRequest>({
    mutationFn: async (request) => {
      const { data } = await api.post('/ai/ask', request);
      return data;
    },
  });
};

// User preferences hooks
export const useUserPrefs = () => {
  const api = useApi();
  
  return useQuery<UserPrefs>({
    queryKey: ['userPrefs'],
    queryFn: async () => {
      const { data } = await api.get('/users/me/prefs');
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useUpdateUserPrefs = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation<UserPrefs, Error, Partial<UserPrefs>>({
    mutationFn: async (prefs) => {
      const { data } = await api.put('/users/me/prefs', prefs);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPrefs'] });
    },
  });
};

// Device registration
export const useRegisterDevice = () => {
  const api = useApi();
  
  return useMutation<void, Error, { platform: string; pushToken: string }>({
    mutationFn: async (device) => {
      await api.post('/users/me/device', device);
    },
  });
};
