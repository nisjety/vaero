// src/lib/utils.ts
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function for conditional class names
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

// Temperature formatting
interface TemperatureOptions {
  showUnit?: boolean;
}

export const formatTemperature = (
  value: number,
  unit: 'metric' | 'imperial' = 'metric',
  options: TemperatureOptions = {}
): string => {
  const { showUnit = true } = options;
  
  if (typeof value !== 'number' || isNaN(value)) {
    return '--';
  }
  
  if (unit === 'imperial') {
    const fahrenheit = Math.round(value * 9 / 5 + 32);
    return showUnit ? `${fahrenheit}°F` : `${fahrenheit}`;
  }
  const celsius = Math.round(value);
  return showUnit ? `${celsius}°C` : `${celsius}`;
};

// Time formatting
interface TimeOptions {
  hoursOnly?: boolean;
}

export const formatTime = (
  isoString: string,
  timeFormat: '24h' | '12h' = '24h',
  options: TimeOptions = {}
): string => {
  const { hoursOnly = false } = options;
  const date = parseISO(isoString);
  
  if (hoursOnly) {
    const formatString = timeFormat === '12h' ? 'ha' : 'HH';
    return format(date, formatString);
  }
  
  const formatString = timeFormat === '12h' ? 'h:mm a' : 'HH:mm';
  return format(date, formatString);
};

// Date formatting for daily weather
interface DateOptions {
  format?: 'full' | 'weekday' | 'short';
}

export const formatDate = (
  dateString: string,
  options: DateOptions = {}
): string => {
  const { format: formatType = 'full' } = options;
  const date = parseISO(dateString);
  
  if (isToday(date)) {
    return 'Today';
  }
  
  if (isTomorrow(date)) {
    return 'Tomorrow';
  }
  
  switch (formatType) {
    case 'weekday':
      return format(date, 'EEEE');
    case 'short':
      return format(date, 'EEE');
    default:
      return format(date, 'EEE, MMM d');
  }
};

export const formatWeatherDate = (dateString: string): string => {
  return formatDate(dateString);
};

// Wind speed formatting
export const formatWindSpeed = (
  speed: number,
  unit: 'metric' | 'imperial' = 'metric'
): string => {
  if (unit === 'imperial') {
    const mph = Math.round(speed * 2.237);
    return `${mph} mph`;
  }
  return `${Math.round(speed)} m/s`;
};

// Precipitation probability formatting
export const formatPrecipitation = (probability: number): string => {
  return `${Math.round(probability)}%`;
};

// Weather symbol code to description mapping
export const getWeatherDescription = (symbolCode: string): string => {
  const descriptions: Record<string, string> = {
    clearsky_day: 'Clear sky',
    clearsky_night: 'Clear sky',
    clearsky_polartwilight: 'Clear sky',
    fair_day: 'Fair',
    fair_night: 'Fair',
    fair_polartwilight: 'Fair',
    partlycloudy_day: 'Partly cloudy',
    partlycloudy_night: 'Partly cloudy',
    partlycloudy_polartwilight: 'Partly cloudy',
    cloudy: 'Cloudy',
    rainshowers_day: 'Rain showers',
    rainshowers_night: 'Rain showers',
    rainshowers_polartwilight: 'Rain showers',
    rainshowersandthunder_day: 'Rain showers and thunder',
    rainshowersandthunder_night: 'Rain showers and thunder',
    rainshowersandthunder_polartwilight: 'Rain showers and thunder',
    sleetshowers_day: 'Sleet showers',
    sleetshowers_night: 'Sleet showers',
    sleetshowers_polartwilight: 'Sleet showers',
    snowshowers_day: 'Snow showers',
    snowshowers_night: 'Snow showers',
    snowshowers_polartwilight: 'Snow showers',
    rain: 'Rain',
    rainandthunder: 'Rain and thunder',
    sleet: 'Sleet',
    snow: 'Snow',
    snowandthunder: 'Snow and thunder',
    fog: 'Fog',
    sleetshowersandthunder_day: 'Sleet showers and thunder',
    sleetshowersandthunder_night: 'Sleet showers and thunder',
    sleetshowersandthunder_polartwilight: 'Sleet showers and thunder',
    snowshowersandthunder_day: 'Snow showers and thunder',
    snowshowersandthunder_night: 'Snow showers and thunder',
    snowshowersandthunder_polartwilight: 'Snow showers and thunder',
    lightrain: 'Light rain',
    lightrainandthunder: 'Light rain and thunder',
    lightsleet: 'Light sleet',
    lightsnow: 'Light snow',
    lightsnowandthunder: 'Light snow and thunder',
    heavyrain: 'Heavy rain',
    heavyrainandthunder: 'Heavy rain and thunder',
    heavysleet: 'Heavy sleet',
    heavysnow: 'Heavy snow',
    heavysnowandthunder: 'Heavy snow and thunder',
  };

  return descriptions[symbolCode] || 'Unknown';
};

// Get weather icon URL from Yr.no
export const getWeatherIconUrl = (
  symbolCode: string,
  size: 'small' | 'medium' | 'large' = 'medium'
): string => {
  const sizes = {
    small: '48',
    medium: '64',
    large: '128',
  };
  
  const iconSize = sizes[size];
  return `https://api.met.no/images/weathericons/png/${iconSize}/${symbolCode}.png`;
};

// Time of day utilities for background gradients
export const getTimeOfDay = (hour: number): 'dawn' | 'day' | 'evening' | 'night' => {
  if (hour >= 5 && hour < 9) return 'dawn';
  if (hour >= 9 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

export const getTimeBasedGradient = (time?: string): string => {
  if (!time) return 'weather-gradient';
  
  const hour = parseISO(time).getHours();
  const timeOfDay = getTimeOfDay(hour);
  
  const gradients = {
    dawn: 'dawn-gradient',
    day: 'weather-gradient',
    evening: 'aurora-gradient',
    night: 'night-gradient',
  };
  
  return gradients[timeOfDay];
};

// Clothing suggestion utilities
export const categorizeClothesByType = (items: string[]): Record<string, string[]> => {
  const categories: Record<string, string[]> = {
    outerwear: [],
    tops: [],
    bottoms: [],
    footwear: [],
    accessories: [],
    underwear: [],
  };

  const categoryMap: Record<string, string> = {
    // Outerwear
    'jacket': 'outerwear',
    'coat': 'outerwear',
    'raincoat': 'outerwear',
    'windbreaker': 'outerwear',
    'hoodie': 'outerwear',
    'cardigan': 'outerwear',
    'blazer': 'outerwear',
    
    // Tops
    'shirt': 'tops',
    'blouse': 'tops',
    't-shirt': 'tops',
    'sweater': 'tops',
    'pullover': 'tops',
    'tank top': 'tops',
    
    // Bottoms
    'jeans': 'bottoms',
    'pants': 'bottoms',
    'trousers': 'bottoms',
    'shorts': 'bottoms',
    'skirt': 'bottoms',
    'dress': 'bottoms',
    
    // Footwear
    'boots': 'footwear',
    'shoes': 'footwear',
    'sneakers': 'footwear',
    'sandals': 'footwear',
    'heels': 'footwear',
    
    // Accessories
    'hat': 'accessories',
    'cap': 'accessories',
    'beanie': 'accessories',
    'scarf': 'accessories',
    'gloves': 'accessories',
    'sunglasses': 'accessories',
    'umbrella': 'accessories',
    
    // Underwear/Base layers
    'thermal': 'underwear',
    'base layer': 'underwear',
    'underwear': 'underwear',
    'socks': 'underwear',
  };

  items.forEach(item => {
    const itemLower = item.toLowerCase();
    let categorized = false;
    
    for (const [key, category] of Object.entries(categoryMap)) {
      if (itemLower.includes(key)) {
        categories[category].push(item);
        categorized = true;
        break;
      }
    }
    
    if (!categorized) {
      categories.accessories.push(item);
    }
  });

  // Remove empty categories
  return Object.fromEntries(
    Object.entries(categories).filter(([_, items]) => items.length > 0)
  );
};

// Alias for clothing categorization
export const categorizeClothingItems = categorizeClothesByType;

// Location utilities
export const formatLocationName = (lat: number, lon: number): string => {
  // This is a simplified version - in a real app you'd use reverse geocoding
  if (lat > 58 && lat < 72 && lon > 4 && lon < 32) {
    return 'Norway';
  }
  return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
};

// Error handling utilities
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};