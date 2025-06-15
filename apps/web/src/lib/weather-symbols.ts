/**
 * Enhanced Norwegian weather descriptions with dynamic, contextual descriptions
 * Based on the official YR.no symbol codes with smarter, more expressive descriptions
 */

export interface WeatherSymbolInfo {
  norwegian: string;
  english: string;
  description: string;
}

export interface WeatherContext {
  temperature?: number;
  feelsLike?: number;
  windSpeed?: number;
  windDirection?: number;
  windGusts?: number;
  precipitation?: number;
  humidity?: number;
  uvIndex?: number;
  pressure?: number;
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
    norwegian: 'KRAFTIGE REGNBYGER',
    english: 'Heavy rain showers',
    description: 'KRAFTIGE REGNBYGER - Være forberedt på plutselige oversvømmelser'
  },
  'heavyrainshowers_night': {
    norwegian: 'KRAFTIGE REGNBYGER',
    english: 'Heavy rain showers',
    description: 'KRAFTIGE REGNBYGER - Være forberedt på plutselige oversvømmelser'
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
    norwegian: 'KRAFTIG REGN',
    english: 'Heavy rain',
    description: 'KRAFTIG REGN - Fare for oversvømmelser. Ta forholdsregler!'
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
};

/**
 * Generate dynamic, contextual weather description based on multiple factors
 */
export const getDynamicWeatherDescription = (symbolCode: string, context: WeatherContext = {}): string => {
  // Safety check for undefined symbolCode
  if (!symbolCode || typeof symbolCode !== 'string') {
    return 'Værforholdene er usikre akkurat nå. Sjekk igjen om litt.';
  }

  const { temperature, feelsLike, windSpeed, windGusts, precipitation, humidity } = context;
  const baseSymbol = weatherSymbols[symbolCode];

  if (!baseSymbol) {
    return 'Værforholdene er usikre akkurat nå. Sjekk igjen om litt.';
  }

  // Temperature feeling descriptions
  const tempFeel = getTemperatureFeeling(temperature, feelsLike);
  const windFeel = getWindFeeling(windSpeed, windGusts);
  const comfortLevel = getComfortDescription(temperature, feelsLike, windSpeed, humidity);

  // Generate contextual descriptions based on weather type and conditions
  if (symbolCode.includes('clearsky') || symbolCode.includes('fair')) {
    return getClearWeatherDescription(symbolCode, tempFeel, windFeel, comfortLevel, context);
  }

  if (symbolCode.includes('cloudy')) {
    return getCloudyWeatherDescription(symbolCode, tempFeel, windFeel, comfortLevel, context);
  }

  if (symbolCode.includes('rain')) {
    return getRainWeatherDescription(symbolCode, tempFeel, windFeel, precipitation, context);
  }

  if (symbolCode.includes('snow')) {
    return getSnowWeatherDescription(symbolCode, tempFeel, windFeel, context);
  }

  if (symbolCode.includes('sleet')) {
    return getSleetWeatherDescription(symbolCode, tempFeel, windFeel, context);
  }

  if (symbolCode.includes('fog')) {
    return getFogWeatherDescription(tempFeel, windFeel, context);
  }

  return `${baseSymbol.description}. ${comfortLevel}`;
};

/**
 * Get temperature feeling description
 */
const getTemperatureFeeling = (temp?: number, feelsLike?: number): string => {
  if (temp === undefined) return '';

  const feeling = feelsLike && Math.abs(temp - feelsLike) > 2 ? feelsLike : temp;

  if (feeling >= 25) return 'varmt og behagelig';
  if (feeling >= 20) return 'deilig temperatur';
  if (feeling >= 15) return 'mild temperatur';
  if (feeling >= 10) return 'kjølig, men OK';
  if (feeling >= 5) return 'frisk og kjølig';
  if (feeling >= 0) return 'kaldt';
  if (feeling >= -5) return 'bitende kaldt';
  return 'ekstremt kaldt';
};

/**
 * Get wind feeling description with more precise analysis
 */
const getWindFeeling = (windSpeed?: number, windGusts?: number): string => {
  if (!windSpeed) return '';

  const gustText = windGusts && windGusts > windSpeed + 2 ? ` med kast opp til ${Math.round(windGusts)} m/s` : '';

  if (windSpeed < 1) return 'vindstille';
  if (windSpeed < 3) return `svak bris (${Math.round(windSpeed)} m/s)${gustText}`;
  if (windSpeed < 6) return `lett bris (${Math.round(windSpeed)} m/s)${gustText}`;
  if (windSpeed < 9) return `frisk bris (${Math.round(windSpeed)} m/s)${gustText}`;
  if (windSpeed < 12) return `moderat vind (${Math.round(windSpeed)} m/s)${gustText}`;
  if (windSpeed < 15) return `sterk vind (${Math.round(windSpeed)} m/s)${gustText}`;
  return `kraftig vind (${Math.round(windSpeed)} m/s)${gustText}`;
};

/**
 * Get overall comfort description
 */
const getComfortDescription = (temp?: number, feelsLike?: number, windSpeed?: number, humidity?: number): string => {
  if (temp === undefined) return 'Temperaturen er ukjent akkurat nå.';

  const feeling = feelsLike && Math.abs(temp - feelsLike) > 2 ? feelsLike : temp;
  const windEffect = windSpeed && windSpeed > 5;
  const _humidEffect = humidity && humidity > 80;

  if (feeling >= 20 && !windEffect) {
    return 'Perfekt vær for å være ute og nyte dagen!';
  }

  if (feeling >= 15 && !windEffect) {
    return 'Behagelig temperatur - flott for en tur ute.';
  }

  if (feeling >= 10) {
    return windEffect ? 'Kjølig med litt vind - ta på en ekstra genser.' : 'Ganske behagelig ute.';
  }

  if (feeling >= 5) {
    return windEffect ? 'Føles kaldere enn det er på grunn av vinden.' : 'Litt kjølig, men helt OK med riktige klær.';
  }

  if (feeling >= 0) {
    return 'Kaldt ute - kle deg godt og pass på ising.';
  }

  return 'Meget kaldt - vær ekstra forsiktig og kle deg varmt!';
};

/**
 * Clear weather descriptions
 */
const getClearWeatherDescription = (symbolCode: string, tempFeel: string, windFeel: string, comfort: string, context: WeatherContext): string => {
  const isDay = symbolCode.includes('_day');
  const _hour = new Date().getHours();

  if (isDay && context.temperature && context.temperature >= 20) {
    return `Strålende sol og ${tempFeel}. ${comfort} Perfekt dag for aktiviteter ute!`;
  }

  if (isDay && context.temperature && context.temperature >= 15) {
    return `Klar himmel og ${tempFeel}. ${windFeel ? `${windFeel} gjør det ` + (context.temperature < 10 ? 'litt friskere' : 'behagelig') : 'Deilig vær'} for en tur ute.`;
  }

  if (isDay) {
    return `Sol og klar himmel, men ${tempFeel}. ${comfort}`;
  }

  if (symbolCode.includes('_night')) {
    return `Klar og stjerneklar natt. ${tempFeel && tempFeel.includes('kaldt') ? 'Blir kaldt utover natten' : 'Behagelig kveld'}.`;
  }

  return `Klart vær og ${tempFeel}. ${comfort}`;
};

/**
 * Cloudy weather descriptions
 */
const getCloudyWeatherDescription = (symbolCode: string, tempFeel: string, windFeel: string, comfort: string, context: WeatherContext): string => {
  if (symbolCode.includes('partlycloudy')) {
    return `Delvis skyet med ${tempFeel}. ${windFeel ? `${windFeel} ` : ''}Hyggelig vær med sol og skyer om hverandre.`;
  }

  if (context.temperature && context.temperature >= 15) {
    return `Overskyet, men ${tempFeel}. Fortsatt fint vær for å være ute.`;
  }

  return `Grått og overskyet. ${tempFeel ? `Føles ${tempFeel}` : comfort}${windFeel ? ` med ${windFeel}` : ''}.`;
};

/**
 * Rain weather descriptions with data-driven analysis
 */
const getRainWeatherDescription = (symbolCode: string, tempFeel: string, windFeel: string, precipitation?: number, context?: WeatherContext): string => {
  const isHeavy = symbolCode.includes('heavy');
  const isShowers = symbolCode.includes('showers');
  const precipAmount = precipitation || 0;
  const windSpeed = context?.windSpeed || 0;

  if (isHeavy || precipAmount > 8) {
    const windText = windSpeed > 8 ? ' og kraftig vind' : '';
    return `KRAFTIG REGN med ${precipAmount.toFixed(1)}mm nedbør${windText}! Dårlig vær for å være ute.`;
  }

  if (isShowers || precipAmount > 2) {
    const intensityText = precipAmount > 5 ? 'kraftige' : precipAmount > 1 ? 'moderate' : 'lette';
    return `${intensityText} regnbyger med ${precipAmount.toFixed(1)}mm nedbør. ${tempFeel ? `${tempFeel} ` : ''}Været kan skifte raskt.`;
  }

  if (symbolCode.includes('lightrain') || precipAmount <= 1) {
    return `Lett regn${precipAmount > 0 ? ` (${precipAmount.toFixed(1)}mm)` : ''}. ${tempFeel ? `${tempFeel} ` : ''}Ikke så verst - en lett regnjakke holder deg tørr.`;
  }

  return `Regn med ${precipAmount.toFixed(1)}mm nedbør og ${tempFeel}. ${windSpeed > 6 ? 'Blåsete forhold gjør det ubehagelig' : 'Helt OK med riktige klær'}.`;
};

/**
 * Snow weather descriptions
 */
const getSnowWeatherDescription = (symbolCode: string, tempFeel: string, windFeel: string, context: WeatherContext): string => {
  const isHeavy = symbolCode.includes('heavy');
  const isShowers = symbolCode.includes('showers');

  if (isHeavy) {
    return `Kraftig snøfall! ${tempFeel ? `${tempFeel} ` : ''}Kjør forsiktig og vær obs på dårlig sikt.`;
  }

  if (isShowers) {
    return `Snøbyger og ${tempFeel}. ${windFeel ? `${windFeel} ` : ''}Vinterlig stemning, men værskifte underveis.`;
  }

  if (context.temperature && context.temperature > -2) {
    return `Våt snø som ${tempFeel}. Pass på glatte veier og fortau.`;
  }

  return `Snøfall og ${tempFeel}. ${windFeel ? `${windFeel} ` : ''}Vakkert, men kle deg varmt og gå forsiktig.`;
};

/**
 * Sleet weather descriptions
 */
const getSleetWeatherDescription = (symbolCode: string, tempFeel: string, windFeel: string, _context: WeatherContext): string => {
  return `Sludd - en blanding av regn og snø. ${tempFeel ? `${tempFeel} ` : ''}Ekstra glatt på veiene! ${windFeel ? `${windFeel} gjør det ubehagelig` : ''}.`;
};

/**
 * Fog weather descriptions
 */
const getFogWeatherDescription = (tempFeel: string, windFeel: string, context: WeatherContext): string => {
  if (context.temperature && context.temperature < 5) {
    return `Tåke og ${tempFeel}. Kjør sakte og bruk nærlys. Kan være rim på bakken.`;
  }

  return `Tåkete forhold. ${tempFeel ? `${tempFeel} ` : ''}Redusert sikt - vær ekstra forsiktig i trafikken.`;
};

/**
 * Get weather symbol with enhanced description
 */
export const getWeatherSymbol = (symbolCode: string, context: WeatherContext = {}) => {
  const symbol = weatherSymbols[symbolCode];
  if (!symbol) {
    return {
      norwegian: 'Ukjent værtype',
      english: 'Unknown weather',
      description: 'Værforholdene er usikre akkurat nå.'
    };
  }

  return {
    ...symbol,
    description: getDynamicWeatherDescription(symbolCode, context)
  };
};

/**
 * Format temperature with "feels like" information
 */
export const formatTemperatureWithFeelsLike = (temp: number | undefined, feelsLike: number | undefined): string => {
  if (temp === undefined || typeof temp !== 'number' || isNaN(temp)) {
    return '--°';
  }

  const tempText = `${Math.round(temp)}°`;

  if (feelsLike !== undefined && !isNaN(feelsLike) && Math.abs(temp - feelsLike) > 1) {
    return `${tempText} (føles som ${Math.round(feelsLike)}°)`;
  }

  return tempText;
};

/**
 * Format wind information in Norwegian
 */
export const formatWindInfo = (windSpeed?: number, windDirection?: number): string => {
  if (!windSpeed) return 'Lite vind';

  const speed = Math.round(windSpeed);

  // Wind direction in Norwegian
  const getWindDirection = (degrees?: number): string => {
    if (!degrees) return '';

    const directions = [
      'nord', 'nordøst', 'øst', 'sørøst',
      'sør', 'sørvest', 'vest', 'nordvest'
    ];

    const index = Math.round(degrees / 45) % 8;
    return ` fra ${directions[index]}`;
  };

  // Wind strength descriptions
  if (speed < 1) return 'Vindstille';
  if (speed < 4) return `Svak vind${getWindDirection(windDirection)} (${speed} m/s)`;
  if (speed < 8) return `Lett bris${getWindDirection(windDirection)} (${speed} m/s)`;
  if (speed < 12) return `Frisk bris${getWindDirection(windDirection)} (${speed} m/s)`;
  if (speed < 18) return `Sterk vind${getWindDirection(windDirection)} (${speed} m/s)`;
  if (speed < 25) return `Liten kuling${getWindDirection(windDirection)} (${speed} m/s)`;
  if (speed < 32) return `Full kuling${getWindDirection(windDirection)} (${speed} m/s)`;

  return `Sterk kuling${getWindDirection(windDirection)} (${speed} m/s)`;
};

/**
 * Format UV index information in Norwegian
 */
export const formatUVIndex = (uvIndex?: number): string => {
  if (!uvIndex || uvIndex < 0) return 'UV-data ikke tilgjengelig';

  const index = Math.round(uvIndex);

  if (index === 0) return 'Ingen UV-stråling';
  if (index <= 2) return `Lav UV-stråling (${index})`;
  if (index <= 5) return `Moderat UV-stråling (${index})`;
  if (index <= 7) return `Høy UV-stråling (${index}) - Bruk solkrem`;
  if (index <= 10) return `Svært høy UV-stråling (${index}) - Unngå sol 11-15`;

  return `Ekstrem UV-stråling (${index}) - Hold deg i skyggen!`;
};

/**
 * Get realistic, data-driven weather advice based on actual metrics
 */
export const getContextualWeatherAdvice = (symbolCode: string, context: WeatherContext): string => {
  const { temperature, feelsLike, windSpeed, precipitation, humidity, uvIndex, pressure: _pressure } = context;
  const effectiveTemp = feelsLike !== undefined ? feelsLike : temperature;
  const hour = new Date().getHours();
  const isCommutingTime = (hour >= 7 && hour <= 9) || (hour >= 15 && hour <= 18);
  const isEvening = hour >= 18;
  const isWeekend = [0, 6].includes(new Date().getDay());

  // Heavy precipitation advice
  if (precipitation && precipitation > 8) {
    return isCommutingTime
      ? 'Mye regn - vurder hjemmekontor eller utsett reisen hvis mulig. Ellers: gode støvler og regnklær!'
      : 'Kraftig regn - perfekt dag for innendørs aktiviteter. Kaffe og en god bok?';
  }

  if (precipitation && precipitation > 3) {
    return isCommutingTime
      ? 'Regn underveis - ta med paraply og regn med forsinkelser i trafikken.'
      : 'Regn i lufta - ta med paraply hvis du skal ut, eller nyt lyden av regn innendørs.';
  }

  if (precipitation && precipitation > 0.5) {
    return 'Litt regn - en lett regnjakke eller paraply holder deg tørr.';
  }

  // Wind advice
  if (windSpeed && windSpeed > 12) {
    return isCommutingTime
      ? 'Kraftig vind - hold godt fast i paraplyer og vær obs på fallende grener. Ekstra reisetid!'
      : 'Sterk vind - ikke ideelt for paraply. Bruk vindtett jakke og pass på løse gjenstander.';
  }

  if (windSpeed && windSpeed > 7) {
    return 'Ganske blåsete - vindtett jakke anbefales. Paraplyer kan bli utfordrende.';
  }

  // Temperature-based advice
  if (effectiveTemp && effectiveTemp < -10) {
    return isCommutingTime
      ? 'Bitterkaldt! Kle deg i flere lag, dekk til ansiktet og varm opp bilen godt på forhånd.'
      : 'Ekstremt kaldt - vurder å utsette unødvendige turer. Hvis du må ut: flere lag og korte opphold ute.';
  }

  if (effectiveTemp && effectiveTemp < -5) {
    return 'Kaldt og mulighet for ising - ekstra forsiktig kjøring og vintersko anbefales.';
  }

  if (effectiveTemp && effectiveTemp < 0) {
    return 'Under null - pass på glatte flater og kle deg godt. Vintersko kan være lurt.';
  }

  if (effectiveTemp && effectiveTemp < 5) {
    return windSpeed && windSpeed > 5
      ? 'Kjølig med vind - føles kaldere enn det er. Ta på en ekstra genser eller vindjakke.'
      : 'Litt kjølig - en varm genser eller lett jakke holder deg komfortabel.';
  }

  // Snow conditions
  if (symbolCode && typeof symbolCode === 'string' && symbolCode.includes('snow')) {
    if (effectiveTemp && effectiveTemp > -2) {
      return 'Våt snø som kan gjøre veier glatte - kjør forsiktig og bruk vinterdekk.';
    }
    return isCommutingTime
      ? 'Snøfall - regn med lengre reisetid og kjør etter forholdene.'
      : 'Snøvær - flott for vinteraktiviteter, men kle deg varmt og gå forsiktig.';
  }

  // Fog conditions
  if (symbolCode && typeof symbolCode === 'string' && symbolCode.includes('fog')) {
    return isCommutingTime
      ? 'Tåke - kjør sakte, bruk nærlys og hold god avstand. Regn med forsinkelser.'
      : 'Tåkete - dårlig sikt, så vær ekstra forsiktig hvis du kjører.';
  }

  // Pleasant weather advice
  if (effectiveTemp && effectiveTemp > 25) {
    return uvIndex && uvIndex > 6
      ? 'Varmt og sol - perfekt bade- eller grillvær! Husk solkrem og drikk mye vann.'
      : 'Deilig varmt - perfekt for utendørs aktiviteter. Nyt solen!';
  }

  if (effectiveTemp && effectiveTemp > 20) {
    if (isWeekend && symbolCode && typeof symbolCode === 'string' && (symbolCode.includes('clear') || symbolCode.includes('fair'))) {
      return 'Perfekt helgevær - flott for turer, grilling eller bare å være ute.';
    }
    return isEvening
      ? 'Behagelig kveld - perfekt for en tur eller å sitte ute.'
      : 'Deilig temperatur - fin dag for en pause ute eller en gåtur.';
  }

  if (effectiveTemp && effectiveTemp > 15) {
    return symbolCode && typeof symbolCode === 'string' && (symbolCode.includes('clear') || symbolCode.includes('fair'))
      ? 'Hyggelig vær - en lett jakke eller genser og du er klar for å være ute.'
      : 'Ganske behagelig - fin temperatur for en tur selv om det er litt skyet.';
  }

  // UV warnings
  if (uvIndex && uvIndex > 7) {
    return 'Høy UV-stråling - bruk solkrem, solbriller og unngå sol mellom 11-15.';
  }

  if (uvIndex && uvIndex > 5) {
    return 'Moderat UV-nivå - solkrem anbefales ved lengre opphold ute.';
  }

  // High humidity
  if (humidity && humidity > 85 && effectiveTemp && effectiveTemp > 20) {
    return 'Fuktig og varmt - kan føles klammt. Drikk mye vann og søk skygge ved behov.';
  }

  // Default advice based on time and weather
  if (isWeekend && symbolCode && typeof symbolCode === 'string' && !symbolCode.includes('rain') && effectiveTemp && effectiveTemp > 10) {
    return 'Helt grei helgedag - muligheter for noen timer ute.';
  }

  if (isCommutingTime) {
    return 'Grei dag for pendling - vanlige klær holder.';
  }

  return isEvening ? 'Ha en fin kveld!' : 'Ha en fin dag!';
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
    return 'God kveld';
  } else {
    return 'God natt';
  }
};