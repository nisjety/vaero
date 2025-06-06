// Description: A responsive React component that displays Norwegian weather description with real-time data
// from the backend API. The component fetches current weather conditions and displays them in Norwegian
// with proper typography and responsive design. It includes loading states and error handling for
// a better user experience.

'use client';

import React from 'react';
import { useCurrentWeather } from '@/hooks/api';
import { getWeatherSymbol, getTimeGreeting, formatTemperature, formatWindSpeed, formatPrecipitationProbability } from '@/lib/weather-symbols';

interface WeatherDescriptionProps {
  lat?: number;
  lon?: number;
}

export const WeatherDescription: React.FC<WeatherDescriptionProps> = ({ 
  lat = 59.9139, // Default to Oslo
  lon = 10.7522 
}) => {
  const { data: weather, isLoading, error } = useCurrentWeather(lat, lon);

  if (isLoading) {
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
        `}</style>
        
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
          .weather-description-text {
            color: rgba(255, 255, 255, 0.75);
            font-size: 0.95rem;
            line-height: 1.6;
            max-width: 24rem;
            font-weight: 300;
            letter-spacing: 0.01em;
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
        `}</style>
        
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

  const weatherInfo = getWeatherSymbol(weather.symbol_code);
  const temperature = formatTemperature(weather.temperature);
  const windSpeed = formatWindSpeed(weather.wind_speed);
  const precipProb = formatPrecipitationProbability(weather.precipitation_probability);

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

        .weather-description-text {
          color: rgba(255, 255, 255, 0.75);
          font-size: 0.95rem;
          line-height: 1.6;
          max-width: 24rem;
          font-weight: 300;
          letter-spacing: 0.01em;
        }

        @media (min-width: 1024px) {
          .weather-main-title {
            font-size: 5.5rem;
          }

          .weather-subtitle {
            font-size: 2.75rem;
          }

          .weather-description-text {
            font-size: 1rem;
            max-width: 26rem;
          }
        }

        @media (min-width: 1280px) {
          .weather-main-title {
            font-size: 6rem;
          }

          .weather-subtitle {
            font-size: 3rem;
          }
        }

        @media (max-width: 640px) {
          .weather-main-title {
            font-size: 3.5rem;
          }

          .weather-subtitle {
            font-size: 1.75rem;
          }

          .weather-description-text {
            font-size: 0.875rem;
            max-width: 20rem;
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
            {temperature}
          </h2>
        </div>
        
        <p className="weather-description-text">
          {weatherInfo.description}. Temperatur {temperature}. 
          Vind {windSpeed}. {precipProb}.
          {weather.humidity && ` Luftfuktighet ${Math.round(weather.humidity)}%.`}
        </p>
      </div>
    </>
  );
};