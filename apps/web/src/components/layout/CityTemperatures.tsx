// Description: A React component that shows the users favorite Norwegian cities,
//  colored line based on hot/cold/neutral temperature readings,
//  with text indicating which city temperatures.

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface CityData {
  name: string;
  lat: number;
  lon: number;
  temp?: number;
  isActive: boolean;
  loading: boolean;
  error?: string;
}

export const CityTemperatures = () => {
  const [cities, setCities] = useState<CityData[]>([
    { name: "Oslo", lat: 59.9139, lon: 10.7522, isActive: true, loading: true },
    { name: "Bergen", lat: 60.3913, lon: 5.3221, isActive: false, loading: true },
    { name: "Trondheim", lat: 63.4305, lon: 10.3951, isActive: false, loading: true },
  ]);

  useEffect(() => {
    const fetchCityWeather = async (city: CityData, index: number) => {
      try {
        const response = await api.get(`/weather/current?lat=${city.lat}&lon=${city.lon}`);
        const weatherData = response.data;
        
        setCities(prev => prev.map((c, i) => 
          i === index 
            ? { 
                ...c, 
                temp: Math.round(weatherData.current.temperature),
                loading: false,
                error: undefined 
              }
            : c
        ));
      } catch (error) {
        console.error(`Error fetching weather for ${city.name}:`, error);
        setCities(prev => prev.map((c, i) => 
          i === index 
            ? { 
                ...c, 
                loading: false,
                error: 'Feil ved lasting av værdata' 
              }
            : c
        ));
      }
    };

    cities.forEach((city, index) => {
      if (city.loading && !city.temp) {
        fetchCityWeather(city, index);
      }
    });
  }, []);

  return (
    <>
      <style>{`
        .city-temperatures-container {
          display: flex;
          gap: 2rem;
          padding-top: 1rem;
          align-items: flex-start;
        }

        .city-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-width: 120px;
        }

        .city-temp {
          font-size: 2rem;
          font-weight: 300;
          color: white;
          line-height: 1;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }

        .city-name {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.5rem;
          font-weight: 300;
          margin-bottom: 1rem;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }

        .city-indicator {
          height: 2px;
          width: 100%;
          min-width: 80px;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .city-indicator.active {
          background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
        }

        .city-indicator.inactive {
          background: rgba(255, 255, 255, 0.3);
        }

        @media (min-width: 1024px) {
          .city-temperatures-container {
            gap: 3rem;
          }

          .city-temp {
            font-size: 2rem;
          }

          .city-name {
            font-size: 0.6rem;
          }

          .city-item {
            min-width: 140px;
          }
        }

        @media (max-width: 768px) {
          .city-temperatures-container {
            gap: 2rem;
            padding-top: 1rem;
          }

          .city-temp {
            font-size: 1rem;
          }

          .city-name {
            font-size: 0.5rem;
            margin-bottom: 0.75rem;
          }

          .city-item {
            min-width: 90px;
          }

          .city-indicator {
            height: 2px;
            min-width: 60px;
          }
        }

        @media (max-width: 480px) {
          .city-temperatures-container {
            gap: 1.5rem;
          }

          .city-temp {
            font-size: 1.5rem;
          }

          .city-name {
            font-size: 0.5rem;
          }

          .city-item {
            min-width: 70px;
          }
        }
      `}</style>
      
      <div className="city-temperatures-container">
        {cities.map((city, _index) => (
          <div key={city.name} className="city-item">
            <div className="city-temp">
              {city.loading ? (
                <span style={{ opacity: 0.5 }}>--</span>
              ) : city.error ? (
                <span style={{ opacity: 0.5, fontSize: '1rem' }}>!</span>
              ) : (
                `${city.temp}°`
              )}
            </div>
            <div className="city-name">
              {city.name}
            </div>
            <div className={`city-indicator ${city.isActive ? 'active' : 'inactive'}`}></div>
          </div>
        ))}
      </div>
    </>
  );
};