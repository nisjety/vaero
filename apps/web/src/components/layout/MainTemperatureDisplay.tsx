
 // Description: The main temperature display component that shows the current temperature
// from real weather data. Displays Norwegian weather information including temperature,
// wind speed, UV index, and location. Features responsive design and proper API integration
// with the backend weather service using YR (Norwegian Meteorological Institute) data.

'use client';

import React from 'react';
import { useDetailedWeather } from '@/hooks/api';
import { 
  formatWindInfo, 
  formatUVIndex
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
  // Use detailed weather for comprehensive data
  const { data: detailedWeather, isLoading: detailedLoading, error: detailedError } = useDetailedWeather(lat, lon);
  
  // Use detailed weather data - access current weather from the weather property
  const weather = detailedWeather?.weather?.current;
  const isLoading = detailedLoading;
  const error = detailedError;

  if (isLoading) {
    return (
      <>
        <style>{`
          /* =====================================================
             6. MAIN TEMPERATURE DISPLAY COMPONENT
             ===================================================== */
          .main-temp-display {
            text-align: right;
            color: white;
          }

          .main-temp-container {
            display: flex;
            align-items: flex-start;
            justify-content: flex-end;
            gap: 1rem;
          }

          .main-temp-value {
            font-size: 10rem;
            font-weight: 300;
            line-height: 0.8;
            letter-spacing: -0.05em;
            text-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
            margin: 0;
          }

          @media (min-width: 1280px) {
            .main-temp-value {
              font-size: 12rem;
            }
          }

          @media (min-width: 1536px) {
            .main-temp-value {
              font-size: 14rem;
            }
          }

          .loading-placeholder {
            background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 0.5rem;
          }

          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          .main-temp-wind {
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 0.5rem;
            color: rgba(255, 255, 255, 0.7);
          }

          .main-temp-uv {
            font-size: 0.75rem;
            margin-top: 0.25rem;
            color: rgba(255, 255, 255, 0.6);
          }

          .main-temp-location {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 0.25rem;
            color: rgba(255, 255, 255, 0.5);
          }

          @media (max-width: 768px) {
            .main-temp-container {
              gap: 0.5rem;
            }
          }

          @media (max-width: 640px) {
            .main-temp-wind {
              font-size: 0.75rem;
            }
            
            .main-temp-uv,
            .main-temp-location {
              font-size: 0.625rem;
            }
          }
        `}</style>
        
        <div className="main-temp-display">
          <div className="main-temp-container">
            <div className="main-temp-value loading-placeholder" style={{ width: '200px', height: '120px' }}>
            </div>
          </div>
          <div className="main-temp-wind loading-placeholder" style={{ width: '120px', height: '20px' }}>
          </div>
          <div className="main-temp-uv loading-placeholder" style={{ width: '100px', height: '16px', marginTop: '0.25rem' }}>
          </div>
          <div className="main-temp-location loading-placeholder" style={{ width: '80px', height: '16px', marginTop: '0.25rem' }}>
          </div>
        </div>
      </>
    );
  }

  if (error || !weather) {
    return (
      <>
        <style>{`
          .main-temp-display {
            text-align: right;
            color: white;
          }

          .main-temp-container {
            display: flex;
            align-items: flex-start;
            justify-content: flex-end;
            gap: 1rem;
          }

          .main-temp-value {
            font-size: 10rem;
            font-weight: 300;
            line-height: 0.8;
            letter-spacing: -0.05em;
            text-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
            margin: 0;
          }

          .main-temp-wind {
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 0.5rem;
            color: rgba(255, 255, 255, 0.7);
          }

          .main-temp-uv {
            font-size: 0.75rem;
            margin-top: 0.25rem;
            color: rgba(255, 255, 255, 0.6);
          }

          .main-temp-location {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 0.25rem;
            color: rgba(255, 255, 255, 0.5);
          }
        `}</style>
        
        <div className="main-temp-display">
          <div className="main-temp-container">
            <div className="main-temp-value">
              --°
            </div>
          </div>
          <div className="main-temp-wind">
            Værdata ikke tilgjengelig
          </div>
          <div className="main-temp-uv">
            --
          </div>
          <div className="main-temp-location">
            {locationName}
          </div>
        </div>
      </>
    );
  }

  const temperature = formatTemperature(weather?.temperature ?? 0);
  const windInfo = formatWindInfo(weather?.wind_speed ?? 0, weather?.wind_direction ?? 0);
  const uvInfo = formatUVIndex(weather?.uv_index ?? 0);
  const isHighUV = weather?.uv_index && weather.uv_index > 5;

  return (
    <>
      <style>{`
        /* =====================================================
           6. MAIN TEMPERATURE DISPLAY COMPONENT
           ===================================================== */
        .main-temp-display {
          text-align: right;
          color: white;
        }

        .main-temp-container {
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          gap: 1rem;
        }

        .main-temp-value {
          font-size: 10rem;
          font-weight: 300;
          line-height: 0.8;
          letter-spacing: -0.05em;
          text-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
          margin: 0;
        }

        @media (min-width: 1280px) {
          .main-temp-value {
            font-size: 12rem;
          }
        }

        @media (min-width: 1536px) {
          .main-temp-value {
            font-size: 14rem;
          }
        }

        .main-temp-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .main-temp-wind {
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          display: inline-block;
        }

        .main-temp-uv {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.8);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }
        
        .main-temp-uv-high {
          color: #f87171;
          font-weight: 500;
          background: rgba(248, 113, 113, 0.1);
        }

        .main-temp-location {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.7);
        }

        .main-temp-ai-insight {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem;
          border-radius: 0.375rem;
          margin-top: 0.5rem;
          border-left: 3px solid rgba(59, 130, 246, 0.6);
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .main-temp-container {
            gap: 0.5rem;
          }
        }

        @media (max-width: 640px) {
          .main-temp-wind {
            font-size: 0.75rem;
          }
          
          .main-temp-uv,
          .main-temp-location {
            font-size: 0.625rem;
          }
        }
      `}</style>
      
      <div className="main-temp-display">
        <div className="main-temp-container">
          <div className="main-temp-value">
            {temperature}
          </div>
        </div>
        
        <div className="main-temp-info">
          <div className="main-temp-wind">
            {windInfo}
          </div>
          {weather?.uv_index && (
            <div className={`main-temp-uv ${isHighUV ? 'main-temp-uv-high' : ''}`}>
              {uvInfo}
            </div>
          )}
          <div className="main-temp-location">
            {locationName}
          </div>
        </div>
      </div>
    </>
  );
};