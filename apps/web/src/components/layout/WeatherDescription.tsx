// Description: A responsive React component that displays Norwegian weather description with real-time data
// from the backend API. The component fetches current weather conditions and displays them in Norwegian
// with proper typography and responsive design. It includes loading states and error handling for
// a better user experience.

'use client';

import React from 'react';
import { useDetailedWeather } from '@/hooks/api';
import { 
  getWeatherSymbol, 
  getTimeGreeting,
  formatTemperatureWithFeelsLike,
  getContextualWeatherAdvice
} from '@/lib/weather-symbols';

interface WeatherDescriptionProps {
  lat?: number;
  lon?: number;
}

export const WeatherDescription: React.FC<WeatherDescriptionProps> = ({ 
  lat = 59.9139, // Default to Oslo
  lon = 10.7522 
}) => {
  // Use free tier detailed weather endpoint for enhanced data
  const { data: detailedWeather, isLoading, error } = useDetailedWeather(lat, lon);
  
  // Use the detailed weather data - correct the path to access nested weather object
  const weather = detailedWeather?.weather;

  // Helper function to return consistent styles
  const getStyles = () => `
    .weather-description {
      margin-bottom: 3rem;
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
    }
    .weather-subtitle {
      font-size: 2.25rem;
      font-weight: 300;
      line-height: 1.1;
      color: rgba(255, 255, 255, 0.9);
      letter-spacing: -0.01em;
    }
    .weather-description-text {
      color: rgba(255, 255, 255, 0.75);
      font-size: 0.95rem;
      line-height: 1.6;
      max-width: 24rem;
      font-weight: 300;
      letter-spacing: 0.01em;
    }
    .loading-placeholder {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 0.5rem;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @media (min-width: 1024px) {
      .weather-main-title { font-size: 5.5rem; }
      .weather-subtitle { font-size: 2.75rem; }
      .weather-description-text { font-size: 1rem; max-width: 26rem; }
    }
    @media (min-width: 1280px) {
      .weather-main-title { font-size: 6rem; }
      .weather-subtitle { font-size: 3rem; }
    }
    @media (max-width: 640px) {
      .weather-main-title { font-size: 3.5rem; }
      .weather-subtitle { font-size: 1.75rem; }
      .weather-description-text { font-size: 0.875rem; max-width: 20rem; }
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
          
          <div className="weather-description-text">
            <div className="loading-placeholder" style={{ height: '1rem', width: '80%', marginBottom: '0.5rem' }}></div>
            <div className="loading-placeholder" style={{ height: '1rem', width: '60%' }}></div>
          </div>
        </div>
      </>
    );
  }

  if (error || !weather) {
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
          
          <p className="weather-description-text">
            Kan ikke hente værdata for øyeblikket. 
            Vennligst prøv igjen senere eller sjekk tilkoblingen din.
          </p>
        </div>
      </>
    );
  }

  // Ensure we have weather data before proceeding
  if (!weather || !weather.current) {
    return (
      <>
        <style>{getStyles()}</style>
        <div className="weather-description">
          <div className="weather-title-container">
            <h1 className="weather-main-title">
              Venter på værdata...
            </h1>
          </div>
          <p className="weather-description-text">
            Henter værdata for øyeblikket...
          </p>
        </div>
      </>
    );
  }

  // Create weather context for enhanced descriptions with safe property access
  const weatherContext = {
    feelsLike: weather?.current?.dew_point ?? weather?.current?.temperature ?? 0,
    windSpeed: weather?.current?.wind_speed ?? 0,
    windDirection: weather?.current?.wind_direction ?? 0,
    precipitation: weather?.current?.precip_amount ?? 0,
    humidity: weather?.current?.humidity ?? 0,
    uvIndex: weather?.current?.uv_index ?? 0,
    pressure: weather?.current?.pressure ?? 1013
  };

  const weatherInfo = getWeatherSymbol(weather?.current?.symbol_code || 'clearsky_day', weatherContext);
  const temperatureText = formatTemperatureWithFeelsLike(
    weather?.current?.temperature ?? 0, 
    weather?.current?.dew_point ?? weather?.current?.temperature ?? 0
  );
  const contextualWeatherAdvice = getContextualWeatherAdvice(weather?.current?.symbol_code || 'clearsky_day', weatherContext);
  
  // More intelligent urgent weather detection based on actual metrics with safe property access
  const isUrgentWeather = (
    (weather?.current?.precip_amount && weather?.current?.precip_amount > 8) ||
    (weather?.current?.wind_speed && weather?.current?.wind_speed > 15) ||
    (weather?.current?.dew_point && weather?.current?.dew_point < -10) ||
    (weather?.current?.symbol_code && weather?.current?.symbol_code.includes('heavyrain')) ||
    (weather?.current?.symbol_code && weather?.current?.symbol_code.includes('heavysnow'))
  );
  
  const isHeavyWeather = (
    (weather?.current?.precip_amount && weather?.current?.precip_amount > 3) ||
    (weather?.current?.wind_speed && weather?.current?.wind_speed > 10) ||
    (weather?.current?.dew_point && weather?.current?.dew_point < -5) ||
    (weather?.current?.symbol_code && weather?.current?.symbol_code.includes('heavy')) ||
    (weather?.current?.symbol_code && weather?.current?.symbol_code.includes('rain') && weather?.current?.wind_speed && weather?.current?.wind_speed > 8)
  );

  return (
    <>
      <style>{`
        .weather-description {
          margin-bottom: 3rem;
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
        }
        .weather-subtitle {
          font-size: 2.25rem;
          font-weight: 300;
          line-height: 1.1;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: -0.01em;
        }
        .weather-temperature {
          font-size: 1.125rem;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.95);
          margin-top: 0.5rem;
          letter-spacing: -0.01em;
        }
        .weather-description-text {
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.95rem;
          line-height: 1.6;
          max-width: 28rem;
          font-weight: 300;
          letter-spacing: 0.01em;
        }
        .weather-advice {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          line-height: 1.5;
          max-width: 28rem;
          font-weight: 300;
          margin-top: 1rem;
          font-style: italic;
        }
        .weather-urgent-warning {
          color: #ff4444;
          font-weight: 600;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 68, 68, 0.15);
          border-radius: 0.375rem;
          border: 1px solid rgba(255, 68, 68, 0.3);
          display: block;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .weather-heavy-warning {
          color: #ff9800;
          font-weight: 500;
          padding: 0.375rem 0.625rem;
          background: rgba(255, 152, 0, 0.12);
          border-radius: 0.25rem;
          display: block;
          margin-bottom: 0.75rem;
        }
        
        @media (min-width: 1024px) {
          .weather-main-title {
            font-size: 5.5rem;
          }
          .weather-subtitle {
            font-size: 2.75rem;
          }
          .weather-temperature {
            font-size: 1.25rem;
          }
          .weather-description-text {
            font-size: 1rem;
            max-width: 30rem;
          }
          .weather-advice {
            font-size: 0.9rem;
            max-width: 30rem;
          }
        }
        @media (min-width: 1280px) {
          .weather-main-title {
            font-size: 6rem;
          }
          .weather-subtitle {
            font-size: 3rem;
          }
          .weather-temperature {
            font-size: 1.375rem;
          }
        }
        @media (max-width: 640px) {
          .weather-main-title {
            font-size: 3.5rem;
          }
          .weather-subtitle {
            font-size: 1.75rem;
          }
          .weather-temperature {
            font-size: 1rem;
          }
          .weather-description-text {
            font-size: 0.875rem;
            max-width: 24rem;
          }
          .weather-advice {
            font-size: 0.8rem;
            max-width: 24rem;
          }
          
          .weather-ai-advice {
            font-size: 0.85rem;
            max-width: 28rem;
            background: rgba(255, 255, 255, 0.05);
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
            border-left: 3px solid rgba(59, 130, 246, 0.6);
            line-height: 1.5;
          }
          
          .weather-ai-advice-title {
            font-weight: 600;
            color: rgba(59, 130, 246, 0.9);
            margin-bottom: 0.5rem;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .weather-description {
            margin-bottom: 2rem;
          }
          .weather-title-container {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
      
      <div className="weather-description">
        <div className="weather-title-container">
          <h1 className="weather-main-title">
            {weatherInfo.norwegian}
          </h1>
          <h2 className="weather-subtitle">
            {getTimeGreeting()}
          </h2>
          <div className="weather-temperature">
            {temperatureText}
          </div>
        </div>
        
        <div className="weather-description-text">
          {isUrgentWeather ? (
            <div className="weather-urgent-warning">
              ⚠️ {weatherInfo.description}
            </div>
          ) : isHeavyWeather ? (
            <div className="weather-heavy-warning">
              {weatherInfo.description}
            </div>
          ) : (
            <p>{weatherInfo.description}</p>
          )}
          
          <div className="weather-advice">
            {contextualWeatherAdvice}
          </div>
        </div>
      </div>
    </>
  );
};