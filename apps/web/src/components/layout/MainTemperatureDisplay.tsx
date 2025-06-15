
// Description: The main temperature display component that shows the current temperature
// from real weather data. Displays Norwegian weather information including temperature,
// wind speed, UV index, and location. Features responsive design and proper API integration
// with the backend weather service using YR (Norwegian Meteorological Institute) data.

// components/weather/MainTemperatureDisplay.tsx
// Complete main temperature display with real weather data integration

'use client';

import React from 'react';
import { useEnhancedWeather, useUVData } from '@/hooks/api';
import {
  formatWindInfo,
  formatUVIndex,
  formatTemperatureWithFeelsLike
} from '@/lib/weather-symbols';
import { formatTemperature } from '@/lib/utils';

interface MainTemperatureDisplayProps {
  lat?: number;
  lon?: number;
  locationName?: string;
}

export const MainTemperatureDisplay: React.FC<MainTemperatureDisplayProps> = ({
  lat = 59.9139, // Default to Oslo
  lon = 10.7522,
  locationName = 'Oslo, Norge'
}) => {
  // Use enhanced weather for comprehensive data
  const { data: weatherData, isLoading, error } = useEnhancedWeather(lat, lon);
  const { data: uvData } = useUVData(lat, lon);

  // Extract current weather from the enhanced response
  const currentWeather = weatherData?.weather?.current;
  const aiInsights = weatherData?.ai?.insights as any;

  if (isLoading) {
    return (
      <>
        <style>{getStyles()}</style>

        <div className="main-temp-display">
          <div className="main-temp-container">
            <div className="loading-placeholder temp-loading">
              <div className="loading-shimmer"></div>
            </div>
          </div>
          <div className="main-temp-info">
            <div className="loading-placeholder info-loading">
              <div className="loading-shimmer"></div>
            </div>
            <div className="loading-placeholder info-loading">
              <div className="loading-shimmer"></div>
            </div>
            <div className="loading-placeholder info-loading">
              <div className="loading-shimmer"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !currentWeather) {
    return (
      <>
        <style>{getStyles()}</style>

        <div className="main-temp-display">
          <div className="main-temp-container">
            <div className="main-temp-value error-state">
              --°
            </div>
          </div>

          <div className="main-temp-info">
            <div className="main-temp-wind error-text">
              Værdata ikke tilgjengelig
            </div>
            <div className="main-temp-location">
              {locationName}
            </div>
            <div className="error-message">
              Sjekk internetttilkoblingen og prøv igjen
            </div>
          </div>
        </div>
      </>
    );
  }

  // Extract data from the backend response structure
  const temperature = currentWeather.temperature;
  const feelsLike = temperature; // Simplified for now
  const windSpeed = currentWeather.wind_speed;
  const windDirection = currentWeather.wind_direction;
  const uvIndex = uvData?.uv?.index ?? currentWeather.uv_index;
  const _symbolCode = currentWeather.symbol_code;
  const _humidity = currentWeather.humidity;

  // Format display values
  const temperatureDisplay = formatTemperature(temperature);
  const _feelsLikeDisplay = formatTemperatureWithFeelsLike(temperature, feelsLike);
  const windInfo = formatWindInfo(windSpeed, windDirection);
  const uvInfo = formatUVIndex(uvIndex || 0);

  // Determine styling based on conditions
  const isExtremeTemp = temperature < -10 || temperature > 35;
  const isHighUV = (uvIndex || 0) > 6;
  const isHighWind = windSpeed > 12;

  return (
    <>
      <style>{getStyles()}</style>

      <div className="main-temp-display">
        <div className="main-temp-container">
          <div className={`main-temp-value ${isExtremeTemp ? 'extreme-temp' : ''}`}>
            {temperatureDisplay}
          </div>

          {Math.abs(temperature - feelsLike) > 3 && (
            <div className="feels-like-display">
              <span className="feels-like-text">Føles som</span>
              <span className="feels-like-temp">{formatTemperature(feelsLike)}</span>
            </div>
          )}
        </div>

        <div className="main-temp-info">
          <div className={`main-temp-wind ${isHighWind ? 'high-wind' : ''}`}>
            {windInfo}
          </div>

          {uvIndex && uvIndex > 0 && (
            <div className={`main-temp-uv ${isHighUV ? 'high-uv' : ''}`}>
              {uvInfo}
            </div>
          )}

          <div className="main-temp-location">
            {locationName}
          </div>

          {aiInsights?.comfort_analysis && (
            <div className="comfort-indicator">
              <div className={`comfort-level comfort-${aiInsights.comfort_analysis.level}`}>
                <span className="comfort-emoji">
                  {getComfortEmoji(aiInsights.comfort_analysis.level)}
                </span>
                <span className="comfort-text">
                  {getComfortText(aiInsights.comfort_analysis.level)}
                </span>
              </div>
            </div>
          )}

          {weatherData?.performance?.responseTime && (
            <div className="performance-indicator">
              <span className="performance-text">
                {weatherData.performance.cached ? '⚡ Cached' : '🔄 Fresh'}
                {' '}({weatherData.performance.responseTime}ms)
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Helper functions
function getComfortEmoji(level: string): string {
  switch (level) {
    case 'excellent': return '😌';
    case 'good': return '🙂';
    case 'moderate': return '😐';
    case 'poor': return '😬';
    case 'very_poor': return '😰';
    default: return '🤔';
  }
}

function getComfortText(level: string): string {
  switch (level) {
    case 'excellent': return 'Perfekte forhold';
    case 'good': return 'Behagelig';
    case 'moderate': return 'OK forhold';
    case 'poor': return 'Ubehagelig';
    case 'very_poor': return 'Krevende forhold';
    default: return 'Ukjent';
  }
}

function getStyles(): string {
  return `
    .main-temp-display {
      text-align: right;
      color: white;
      position: relative;
    }

    .main-temp-container {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .main-temp-value {
      font-size: 10rem;
      font-weight: 300;
      line-height: 0.8;
      letter-spacing: -0.05em;
      text-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
      margin: 0;
      transition: all 0.3s ease;
    }

    .main-temp-value.extreme-temp {
      color: #ff6b6b;
      text-shadow: 0 4px 30px rgba(255, 107, 107, 0.4);
    }

    .main-temp-value.error-state {
      opacity: 0.5;
    }

    .feels-like-display {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
      font-size: 1.25rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .feels-like-text {
      font-size: 0.875rem;
      opacity: 0.7;
    }

    .feels-like-temp {
      font-weight: 400;
    }

    .main-temp-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.75rem;
    }

    .main-temp-wind {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255, 255, 255, 0.9);
      background: rgba(255, 255, 255, 0.1);
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      display: inline-block;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .main-temp-wind.high-wind {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.3);
      color: #fecaca;
    }

    .main-temp-uv {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.8);
      padding: 0.375rem 0.625rem;
      border-radius: 0.375rem;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }
    
    .main-temp-uv.high-uv {
      color: #fbbf24;
      background: rgba(251, 191, 36, 0.15);
      border-color: rgba(251, 191, 36, 0.3);
      font-weight: 500;
    }

    .main-temp-location {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 400;
    }

    .comfort-indicator {
      margin-top: 0.5rem;
    }

    .comfort-level {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .comfort-excellent {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(16, 185, 129, 0.3);
      color: #a7f3d0;
    }

    .comfort-good {
      background: rgba(59, 130, 246, 0.2);
      border-color: rgba(59, 130, 246, 0.3);
      color: #bfdbfe;
    }

    .comfort-moderate {
      background: rgba(251, 191, 36, 0.2);
      border-color: rgba(251, 191, 36, 0.3);
      color: #fde68a;
    }

    .comfort-poor {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.3);
      color: #fecaca;
    }

    .comfort-very_poor {
      background: rgba(147, 51, 234, 0.2);
      border-color: rgba(147, 51, 234, 0.3);
      color: #ddd6fe;
    }

    .comfort-emoji {
      font-size: 1rem;
    }

    .comfort-text {
      font-weight: 500;
    }

    .performance-indicator {
      margin-top: 0.25rem;
    }

    .performance-text {
      font-size: 0.625rem;
      color: rgba(255, 255, 255, 0.5);
      font-family: monospace;
    }

    .error-text {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.3);
      color: #fecaca;
    }

    .error-message {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
      font-style: italic;
      margin-top: 0.5rem;
    }

    /* Loading states */
    .loading-placeholder {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 0.5rem;
      overflow: hidden;
      position: relative;
    }

    .temp-loading {
      width: 280px;
      height: 120px;
      border-radius: 1rem;
    }

    .info-loading {
      width: 150px;
      height: 20px;
      margin-bottom: 0.5rem;
    }

    .loading-shimmer {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.2) 50%,
        transparent 100%
      );
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { left: -100%; }
      100% { left: 100%; }
    }

    /* Responsive design */
    @media (min-width: 1280px) {
      .main-temp-value {
        font-size: 12rem;
      }
      
      .feels-like-display {
        font-size: 1.5rem;
      }
      
      .main-temp-wind {
        font-size: 1rem;
      }
    }

    @media (min-width: 1536px) {
      .main-temp-value {
        font-size: 14rem;
      }
      
      .feels-like-display {
        font-size: 1.75rem;
      }
    }

    @media (max-width: 768px) {
      .main-temp-value {
        font-size: 6rem;
      }
      
      .main-temp-container {
        gap: 0.25rem;
        margin-bottom: 1rem;
      }
      
      .feels-like-display {
        font-size: 1rem;
      }
      
      .main-temp-wind {
        font-size: 0.75rem;
        padding: 0.375rem 0.5rem;
      }
      
      .main-temp-uv,
      .main-temp-location {
        font-size: 0.625rem;
      }
      
      .comfort-level {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
      }
    }

    @media (max-width: 640px) {
      .main-temp-value {
        font-size: 5rem;
      }
      
      .temp-loading {
        width: 200px;
        height: 80px;
      }
      
      .info-loading {
        width: 120px;
        height: 16px;
      }
    }
  `;
}

export default MainTemperatureDisplay;