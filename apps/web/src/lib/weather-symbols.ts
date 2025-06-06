/**
 /**
 * Norwegian weather descriptions for YR weather symbol codes
 * Based on the official YR.no symbol codes and Norwegian meteorological terms
 */

export interface WeatherSymbolInfo {
  norwegian: string;
  english: string;
  description: string;
}

export const weatherSymbols: Record<string, WeatherSymbolInfo> = {
  // Clear sky
  'clearsky_day': {
    norwegian: 'Klarvær',
    english: 'Clear sky',
    description: 'Klar himmel på dagtid'
  },
  'clearsky_night': {
    norwegian: 'Klarvær',
    english: 'Clear sky',
    description: 'Klar himmel på nattestid'
  },
  'clearsky_polartwilight': {
    norwegian: 'Klarvær',
    english: 'Clear sky',
    description: 'Klar himmel i polare skumring'
  },

  // Fair weather
  'fair_day': {
    norwegian: 'Lettskyet',
    english: 'Fair weather',
    description: 'Lett skyet på dagtid'
  },
  'fair_night': {
    norwegian: 'Lettskyet',
    english: 'Fair weather',
    description: 'Lett skyet på nattestid'
  },
  'fair_polartwilight': {
    norwegian: 'Lettskyet',
    english: 'Fair weather',
    description: 'Lett skyet i polare skumring'
  },

  // Partly cloudy
  'partlycloudy_day': {
    norwegian: 'Delvis skyet',
    english: 'Partly cloudy',
    description: 'Delvis skyet på dagtid'
  },
  'partlycloudy_night': {
    norwegian: 'Delvis skyet',
    english: 'Partly cloudy',
    description: 'Delvis skyet på nattestid'
  },
  'partlycloudy_polartwilight': {
    norwegian: 'Delvis skyet',
    english: 'Partly cloudy',
    description: 'Delvis skyet i polare skumring'
  },

  // Cloudy
  'cloudy': {
    norwegian: 'Skyet',
    english: 'Cloudy',
    description: 'Overskyet'
  },

  // Rain showers
  'lightrainshowers_day': {
    norwegian: 'Lette regnbyger',
    english: 'Light rain showers',
    description: 'Lette regnbyger på dagtid'
  },
  'lightrainshowers_night': {
    norwegian: 'Lette regnbyger',
    english: 'Light rain showers',
    description: 'Lette regnbyger på nattestid'
  },
  'lightrainshowers_polartwilight': {
    norwegian: 'Lette regnbyger',
    english: 'Light rain showers',
    description: 'Lette regnbyger i polare skumring'
  },
  'rainshowers_day': {
    norwegian: 'Regnbyger',
    english: 'Rain showers',
    description: 'Regnbyger på dagtid'
  },
  'rainshowers_night': {
    norwegian: 'Regnbyger',
    english: 'Rain showers',
    description: 'Regnbyger på nattestid'
  },
  'rainshowers_polartwilight': {
    norwegian: 'Regnbyger',
    english: 'Rain showers',
    description: 'Regnbyger i polare skumring'
  },
  'heavyrainshowers_day': {
    norwegian: 'Kraftige regnbyger',
    english: 'Heavy rain showers',
    description: 'Kraftige regnbyger på dagtid'
  },
  'heavyrainshowers_night': {
    norwegian: 'Kraftige regnbyger',
    english: 'Heavy rain showers',
    description: 'Kraftige regnbyger på nattestid'
  },
  'heavyrainshowers_polartwilight': {
    norwegian: 'Kraftige regnbyger',
    english: 'Heavy rain showers',
    description: 'Kraftige regnbyger i polare skumring'
  },

  // Rain
  'lightrain': {
    norwegian: 'Lett regn',
    english: 'Light rain',
    description: 'Lett regn'
  },
  'rain': {
    norwegian: 'Regn',
    english: 'Rain',
    description: 'Regn'
  },
  'heavyrain': {
    norwegian: 'Kraftig regn',
    english: 'Heavy rain',
    description: 'Kraftig regn'
  },

  // Sleet showers
  'lightsleetshowers_day': {
    norwegian: 'Lette sluddbyger',
    english: 'Light sleet showers',
    description: 'Lette sluddbyger på dagtid'
  },
  'lightsleetshowers_night': {
    norwegian: 'Lette sluddbyger',
    english: 'Light sleet showers',
    description: 'Lette sluddbyger på nattestid'
  },
  'lightsleetshowers_polartwilight': {
    norwegian: 'Lette sluddbyger',
    english: 'Light sleet showers',
    description: 'Lette sluddbyger i polare skumring'
  },
  'sleetshowers_day': {
    norwegian: 'Sluddbyger',
    english: 'Sleet showers',
    description: 'Sluddbyger på dagtid'
  },
  'sleetshowers_night': {
    norwegian: 'Sluddbyger',
    english: 'Sleet showers',
    description: 'Sluddbyger på nattestid'
  },
  'sleetshowers_polartwilight': {
    norwegian: 'Sluddbyger',
    english: 'Sleet showers',
    description: 'Sluddbyger i polare skumring'
  },
  'heavysleetshowers_day': {
    norwegian: 'Kraftige sluddbyger',
    english: 'Heavy sleet showers',
    description: 'Kraftige sluddbyger på dagtid'
  },
  'heavysleetshowers_night': {
    norwegian: 'Kraftige sluddbyger',
    english: 'Heavy sleet showers',
    description: 'Kraftige sluddbyger på nattestid'
  },
  'heavysleetshowers_polartwilight': {
    norwegian: 'Kraftige sluddbyger',
    english: 'Heavy sleet showers',
    description: 'Kraftige sluddbyger i polare skumring'
  },

  // Sleet
  'lightsleet': {
    norwegian: 'Lett sludd',
    english: 'Light sleet',
    description: 'Lett sludd'
  },
  'sleet': {
    norwegian: 'Sludd',
    english: 'Sleet',
    description: 'Sludd'
  },
  'heavysleet': {
    norwegian: 'Kraftig sludd',
    english: 'Heavy sleet',
    description: 'Kraftig sludd'
  },

  // Snow showers
  'lightsnowshowers_day': {
    norwegian: 'Lette snøbyger',
    english: 'Light snow showers',
    description: 'Lette snøbyger på dagtid'
  },
  'lightsnowshowers_night': {
    norwegian: 'Lette snøbyger',
    english: 'Light snow showers',
    description: 'Lette snøbyger på nattestid'
  },
  'lightsnowshowers_polartwilight': {
    norwegian: 'Lette snøbyger',
    english: 'Light snow showers',
    description: 'Lette snøbyger i polare skumring'
  },
  'snowshowers_day': {
    norwegian: 'Snøbyger',
    english: 'Snow showers',
    description: 'Snøbyger på dagtid'
  },
  'snowshowers_night': {
    norwegian: 'Snøbyger',
    english: 'Snow showers',
    description: 'Snøbyger på nattestid'
  },
  'snowshowers_polartwilight': {
    norwegian: 'Snøbyger',
    english: 'Snow showers',
    description: 'Snøbyger i polare skumring'
  },
  'heavysnowshowers_day': {
    norwegian: 'Kraftige snøbyger',
    english: 'Heavy snow showers',
    description: 'Kraftige snøbyger på dagtid'
  },
  'heavysnowshowers_night': {
    norwegian: 'Kraftige snøbyger',
    english: 'Heavy snow showers',
    description: 'Kraftige snøbyger på nattestid'
  },
  'heavysnowshowers_polartwilight': {
    norwegian: 'Kraftige snøbyger',
    english: 'Heavy snow showers',
    description: 'Kraftige snøbyger i polare skumring'
  },

  // Snow
  'lightsnow': {
    norwegian: 'Lett snø',
    english: 'Light snow',
    description: 'Lett snø'
  },
  'snow': {
    norwegian: 'Snø',
    english: 'Snow',
    description: 'Snø'
  },
  'heavysnow': {
    norwegian: 'Kraftig snø',
    english: 'Heavy snow',
    description: 'Kraftig snø'
  },

  // Fog
  'fog': {
    norwegian: 'Tåke',
    english: 'Fog',
    description: 'Tåke'
  }
};/**
 * Get Norwegian weather description for a YR symbol code
 */
export const getWeatherDescription = (symbolCode: string): string => {
  const symbol = weatherSymbols[symbolCode];
  return symbol ? symbol.norwegian : 'Ukjent værtype';
};

/**
 * Get full weather symbol object for a YR symbol code
 */
export const getWeatherSymbol = (symbolCode: string) => {
  const symbol = weatherSymbols[symbolCode];
  return symbol ? symbol : {
    norwegian: 'Ukjent værtype',
    english: 'Unknown weather',
    description: 'Ukjent værtype'
  };
};

/**
 * Get English weather description for a YR symbol code
 */
export const getWeatherDescriptionEnglish = (symbolCode: string): string => {
  const symbol = weatherSymbols[symbolCode];
  return symbol ? symbol.english : 'Unknown weather';
};

/**
 * Get detailed weather description for a YR symbol code
 */
export const getDetailedWeatherDescription = (symbolCode: string): string => {
  const symbol = weatherSymbols[symbolCode];
  return symbol ? symbol.description : 'Ukjent værtype';
};

/**
 * Get weather icon URL from YR symbol code
 */
export const getWeatherIconUrl = (symbolCode: string): string => {
  // YR provides SVG icons for weather symbols
  return `https://api.met.no/images/weathericons/svg/${symbolCode}.svg`;
};

/**
 * Format temperature with proper Norwegian formatting
 */
export const formatTemperature = (temp: number, showUnit: boolean = true): string => {
  const rounded = Math.round(temp);
  return showUnit ? `${rounded}°` : `${rounded}`;
};

/**
 * Format wind speed with Norwegian units
 */
export const formatWindSpeed = (windSpeed: number, showUnit: boolean = true): string => {
  const rounded = Math.round(windSpeed);
  return showUnit ? `${rounded} m/s` : `${rounded}`;
};

/**
 * Format precipitation probability in Norwegian
 */
export const formatPrecipitationProbability = (probability: number): string => {
  return `${Math.round(probability)}% nedbør`;
};

/**
 * Get time of day greeting in Norwegian
 */
export const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 10) {
    return 'God morgen';
  } else if (hour >= 10 && hour < 18) {
    return 'God dag';
  } else if (hour >= 18 && hour < 22) {
    return 'God kvell';
  } else {
    return 'God natt';
  }
};

/**
 * Get Norwegian day name from date
 */
export const getNorwegianDayName = (date: Date): string => {
  const days = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
  return days[date.getDay()];
};

/**
 * Get Norwegian month name from date
 */
export const getNorwegianMonthName = (date: Date): string => {
  const months = [
    'januar', 'februar', 'mars', 'april', 'mai', 'juni',
    'juli', 'august', 'september', 'oktober', 'november', 'desember'
  ];
  return months[date.getMonth()];
};

/**
 * Format date in Norwegian format
 */
export const formatNorwegianDate = (date: Date): string => {
  const day = date.getDate();
  const month = getNorwegianMonthName(date);
  return `${day}. ${month}`;
};

/**
 * Format full date with day name in Norwegian
 */
export const formatFullNorwegianDate = (date: Date): string => {
  const dayName = getNorwegianDayName(date);
  const formattedDate = formatNorwegianDate(date);
  return `${dayName}, ${formattedDate}`;
};

/**
 * Get weather advice in Norwegian based on conditions
 */
export const getWeatherAdvice = (symbolCode: string, temperature: number): string => {
  const symbol = weatherSymbols[symbolCode];
  
  if (!symbol) return 'Sjekk værvarsel før du går ut';
  
  if (symbolCode.includes('rain') || symbolCode.includes('sleet')) {
    return 'Husk paraply eller regnjakke';
  }
  
  if (symbolCode.includes('snow')) {
    return 'Kle deg varmt og pass på glatte veier';
  }
  
  if (temperature < 0) {
    return 'Pass på is og kle deg varmt';
  }
  
  if (temperature > 20) {
    return 'Perfekt vær for å være ute';
  }
  
  if (symbolCode.includes('clear') || symbolCode.includes('fair')) {
    return 'Flott vær - nyt solen!';
  }
  
  return 'Ha en fin dag!';
};

/**
 * Get UV index description in Norwegian
 */
export const getUVDescription = (uvIndex: number): string => {
  if (uvIndex <= 2) {
    return 'Lav UV-stråling';
  } else if (uvIndex <= 5) {
    return 'Moderat UV-stråling';
  } else if (uvIndex <= 7) {
    return 'Høy UV-stråling';
  } else if (uvIndex <= 10) {
    return 'Svært høy UV-stråling';
  } else {
    return 'Ekstrem UV-stråling';
  }
};

/**
 * Get wind direction in Norwegian
 */
export const getWindDirection = (degrees: number): string => {
  const directions = [
    'Nord', 'Nordøst', 'Øst', 'Sørøst',
    'Sør', 'Sørvest', 'Vest', 'Nordvest'
  ];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};