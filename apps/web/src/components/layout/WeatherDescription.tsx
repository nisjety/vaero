// components/weather/WeatherDescription.tsx
// Complete weather description with AI insights and dynamic content

'use client';

import React from 'react';
import { useEnhancedWeather, useDailySummary } from '@/hooks/api';
import {
  getWeatherSymbol,
  getTimeGreeting,
  getContextualWeatherAdvice,
  getDynamicWeatherDescription
} from '@/lib/weather-symbols';

interface WeatherDescriptionProps {
  lat?: number;
  lon?: number;
  showAIInsights?: boolean;
}

export const WeatherDescription: React.FC<WeatherDescriptionProps> = ({
  lat = 59.9139, // Default to Oslo
  lon = 10.7522,
  showAIInsights = true
}) => {
  // Get enhanced weather data with AI analysis
  const { data: weatherData, isLoading, error } = useEnhancedWeather(lat, lon);
  const { data: dailySummary } = useDailySummary(lat, lon);

  // Extract data from response
  const currentWeather = weatherData?.weather?.current;
  const aiInsights = weatherData?.ai?.insights as any;
  const metadata = weatherData?.location;

  const getStyles = () => `
    .weather-description {
      margin-bottom: 3rem;
      position: relative;
    }
    
    .weather-title-container {
      margin-bottom: 2rem;
    }
    
    .weather-main-title {
      font-size: 4.5rem;
      font-weight: 400;
      line-height: 0.9;
      color: white;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      animation: fadeInUp 0.8s ease-out;
    }
    
    .weather-subtitle {
      font-size: 2.25rem;
      font-weight: 300;
      line-height: 1.1;
      color: rgba(255, 255, 255, 0.9);
      letter-spacing: -0.01em;
      animation: fadeInUp 0.8s ease-out 0.2s both;
    }
    
    .weather-description-content {
      max-width: 42rem;
      animation: fadeInUp 0.8s ease-out 0.4s both;
    }
    
    .weather-description-text {
      color: rgba(255, 255, 255, 0.85);
      font-size: 0.80rem;
      line-height: 1.2;
      font-weight: 200;
      margin-bottom: 1rem;
    }
    
    .weather-description-text strong {
      color: rgba(255, 255, 255, 1);
      font-weight: 600;
    }
    
    .weather-emoji {
      font-size: 1.1em;
      margin: 0 0.1em;
    }
    
    .weather-advice {
      color: rgba(255, 255, 255, 0.75);
      font-size: 0.875rem;
      line-height: 1.5;
      font-weight: 300;
      margin-bottom: 1rem;
      padding: 1rem 1.25rem;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }
    
    .urgent-warning {
      color: #ff4444;
      font-weight: 600;
      padding: 1rem 1.25rem;
      background: rgba(255, 68, 68, 0.15);
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 68, 68, 0.3);
      display: block;
      margin-bottom: 1.5rem;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      animation: pulse 2s infinite;
    }
    
    .heavy-warning {
      color: #ff9800;
      font-weight: 500;
      padding: 0.75rem 1rem;
      background: rgba(255, 152, 0, 0.12);
      border-radius: 0.5rem;
      border: 1px solid rgba(255, 152, 0, 0.25);
      display: block;
      margin-bottom: 1rem;
    }
    
    .loading-placeholder {
      background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 0.5rem;
    }
    
    .performance-badge {
      position: absolute;
      top: 0;
      right: 0;
      padding: 0.25rem 0.5rem;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 0.25rem;
      font-size: 0.625rem;
      color: rgba(255, 255, 255, 0.6);
      font-family: monospace;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
    
    /* Responsive design */
    @media (min-width: 1024px) {
      .weather-main-title { font-size: 5.5rem; }
      .weather-subtitle { font-size: 2.75rem; }
      .weather-description-text { font-size: 1rem; }
      .weather-advice { font-size: 0.9rem; }
    }
    
    @media (min-width: 1280px) {
      .weather-main-title { font-size: 6rem; }
      .weather-subtitle { font-size: 3rem; }
    }
    
    @media (max-width: 640px) {
      .weather-main-title { font-size: 3.5rem; }
      .weather-subtitle { font-size: 1.75rem; }
      .weather-description-text { font-size: 0.875rem; }
      .weather-advice { font-size: 0.8rem; padding: 0.75rem 1rem; }
      .weather-description { margin-bottom: 2rem; }
      .weather-title-container { margin-bottom: 1.5rem; }
    }
  `;

  if (isLoading) {
    return (
      <>
        <style>{getStyles()}</style>

        <div className="weather-description">
          <div className="weather-title-container">
            <h1 className="weather-main-title">
              {getTimeGreeting()}
            </h1>
            <h2 className="weather-subtitle">
              Laster værdata...
            </h2>
          </div>

          <div className="weather-description-content">
            <div className="loading-placeholder" style={{ height: '1rem', width: '80%', marginBottom: '0.5rem' }}></div>
            <div className="loading-placeholder" style={{ height: '1rem', width: '60%' }}></div>
          </div>
        </div>
      </>
    );
  }

  if (error || !currentWeather) {
    return (
      <>
        <style>{getStyles()}</style>

        <div className="weather-description">
          <div className="weather-title-container">
            <h1 className="weather-main-title">
              {getTimeGreeting()}
            </h1>
            <h2 className="weather-subtitle">
              Værdata utilgjengelig
            </h2>
          </div>

          <div className="weather-description-content">
            <p className="weather-description-text">
              Kan ikke hente værdata for øyeblikket.
              Vennligst sjekk tilkoblingen din og prøv igjen.
            </p>
          </div>
        </div>
      </>
    );
  }

  // Extract weather data
  const temperature = currentWeather.temperature;
  const feelsLike = temperature; // Simplified for now
  const symbolCode = currentWeather.symbol_code || '';
  const _description = symbolCode; // Use symbol code as description fallback

  // Create weather context for enhanced descriptions
  const weatherContext = {
    temperature,
    feelsLike,
    windSpeed: currentWeather.wind_speed,
    windDirection: currentWeather.wind_direction,
    windGusts: currentWeather.wind_gust || 0,
    precipitation: currentWeather.precip_amount || 0,
    humidity: currentWeather.humidity,
    uvIndex: currentWeather.uv_index || 0,
    pressure: currentWeather.pressure
  };

  const weatherInfo = getWeatherSymbol(symbolCode, weatherContext);  // Get AI-generated description and tips from the insights
  const aiInsightsData = weatherData?.insights; // Basic insights from generateBasicInsights
  const aiAnalysisData = weatherData?.ai?.insights; // Advanced insights from the main weather analysis
  const meteorologicalData = weatherData?.ai?.meteorological;

  // Use meteorological synopsis first, then fall back to basic summary
  const aiMeteorologicalDescription = meteorologicalData?.synopsis || aiInsightsData?.summary;
  const aiTips = aiInsightsData?.tips || [];

  // Use the comprehensive AI description if available, otherwise fall back to separate tips
  let fullAiDescription = aiMeteorologicalDescription;

  // Only use separate tips if we don't have a comprehensive AI description
  if (!fullAiDescription && aiTips && aiTips.length > 0) {
    fullAiDescription = aiTips.slice(0, 2).join('. ');
  }

  // Only use hardcoded fallbacks if no AI description is available
  const dynamicDescription = fullAiDescription || getDynamicWeatherDescription(symbolCode, weatherContext);
  const contextualAdvice = fullAiDescription ? null : getContextualWeatherAdvice(symbolCode, weatherContext);

  // Convert markdown-style formatting to HTML for better display
  const formatAIDescription = (text: string): string => {
    if (!text) return text;

    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold** to <strong>
      .replace(/\n\n/g, '<br><br>') // Double newlines to breaks
      .replace(/\n/g, '<br>') // Single newlines to breaks
      .replace(/🌡️|☀️|☁️|🌧️|🌦️|❄️|💨|🌬️|🍃|🎯|👕|⚠️|☀️|💨|🌧️|📈/g, '<span class="weather-emoji">$&</span>'); // Wrap emojis
  };

  const formattedDescription = formatAIDescription(dynamicDescription);

  // Determine urgent conditions
  const isUrgentWeather = (
    (weatherContext.precipitation > 8) ||
    (weatherContext.windSpeed > 15) ||
    (temperature < -10) ||
    (symbolCode && typeof symbolCode === 'string' && symbolCode.includes('heavyrain')) ||
    (symbolCode && typeof symbolCode === 'string' && symbolCode.includes('heavysnow'))
  );

  const isHeavyWeather = (
    (weatherContext.precipitation > 3) ||
    (weatherContext.windSpeed > 10) ||
    (temperature < -5) ||
    (symbolCode && typeof symbolCode === 'string' && symbolCode.includes('heavy')) ||
    (symbolCode && typeof symbolCode === 'string' && symbolCode.includes('rain') && weatherContext.windSpeed > 8)
  );

  return (
    <>
      <style>{getStyles()}</style>

      <div className="weather-description">
        <div className="weather-title-container">
          <h1 className="weather-main-title">
            {weatherInfo.norwegian}
          </h1>
          <h2 className="weather-subtitle">
            {getTimeGreeting()}
          </h2>
        </div>

        <div className="weather-description-content">
          {/* Weather warnings */}
          {isUrgentWeather ? (
            <div className="urgent-warning">
              ⚠️ <span dangerouslySetInnerHTML={{ __html: formattedDescription }} />
            </div>
          ) : isHeavyWeather ? (
            <div className="heavy-warning">
              <span dangerouslySetInnerHTML={{ __html: formattedDescription }} />
            </div>
          ) : (
            <div className="weather-description-text">
              <span dangerouslySetInnerHTML={{ __html: formattedDescription }} />
            </div>
          )}

          {/* Contextual advice - only show if no AI insights */}
          {contextualAdvice && (
            <div className="weather-advice">
              💡 <strong>Råd:</strong> {contextualAdvice}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Helper function for comfort level text
function getComfortLevelText(level: string): string {
  switch (level) {
    case 'excellent': return 'Perfekte forhold';
    case 'good': return 'Behagelige forhold';
    case 'moderate': return 'Moderate forhold';
    case 'poor': return 'Ubehagelige forhold';
    case 'very_poor': return 'Meget krevende forhold';
    default: return 'Ukjent komfortnivå';
  }
}

export default WeatherDescription;