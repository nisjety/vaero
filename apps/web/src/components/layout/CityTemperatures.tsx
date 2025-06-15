// Description: A React component that shows the 3 nearest Norwegian cities based on user's position,
//  colored line based on hot/cold/neutral temperature readings,
//  with text indicating which city temperatures.

// components/weather/CityTemperatures.tsx
// Complete city temperatures with real API integration and dynamic updates based on user location

import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, TrendingDown, RotateCw } from 'lucide-react';
import { api } from '../../lib/api';

interface CityData {
  name: string;
  region: string;
  lat: number;
  lon: number;
  temp?: number;
  isActive: boolean;
  loading: boolean;
  error?: string;
  symbolCode?: string;
  comfort?: number;
  trend?: 'up' | 'down' | 'stable';
  lastUpdated?: Date;
  windSpeed?: number;
  humidity?: number;
  distance?: number; // Distance from user's location in km
}

interface CityTemperaturesProps {
  onCitySelect?: (city: CityData) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Utility functions for weather calculations
/**
 * Calculate comfort score based on temperature, wind and humidity
 */
const calculateComfortScore = (temp?: number, windSpeed?: number, humidity?: number): number => {
  if (temp === undefined) return 50;

  // Base score from temperature (optimal around 21-22°C)
  let score = 100 - Math.min(Math.abs(temp - 21.5) * 4, 50);

  // Wind penalty (higher wind reduces comfort)
  if (windSpeed && windSpeed > 2) {
    const windPenalty = Math.min(windSpeed * 2, 30);
    score = Math.max(score - windPenalty, 0);
  }

  // Humidity penalty (extreme humidity reduces comfort)
  if (humidity) {
    // Both very low and very high humidity affect comfort
    const humidityPenalty = Math.abs(humidity - 50) > 30 ?
      Math.min(Math.abs(humidity - 50) - 30, 20) : 0;
    score = Math.max(score - humidityPenalty, 0);
  }

  return Math.round(score);
};

/**
 * Calculate temperature trend compared to previous reading
 */
const calculateTrend = (temp: number, prevTemp?: number): 'up' | 'down' | 'stable' => {
  if (prevTemp === undefined) return 'stable';
  const diff = temp - prevTemp;
  if (diff > 1) return 'up';
  if (diff < -1) return 'down';
  return 'stable';
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const CityTemperatures: React.FC<CityTemperaturesProps> = ({
  onCitySelect,
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000 // 5 minutes
}) => {
  // Complete list of major Norwegian cities with coordinates
  const allNorwegianCities: CityData[] = [
    { name: "Oslo", region: "Østlandet", lat: 59.9139, lon: 10.7522, isActive: false, loading: true },
    { name: "Bergen", region: "Vestlandet", lat: 60.3913, lon: 5.3221, isActive: false, loading: true },
    { name: "Trondheim", region: "Trøndelag", lat: 63.4305, lon: 10.3951, isActive: false, loading: true },
    { name: "Stavanger", region: "Vestlandet", lat: 58.9700, lon: 5.7331, isActive: false, loading: true },
    { name: "Tromsø", region: "Nord-Norge", lat: 69.6496, lon: 18.9560, isActive: false, loading: true },
    { name: "Kristiansand", region: "Sørlandet", lat: 58.1599, lon: 8.0182, isActive: false, loading: true },
    { name: "Drammen", region: "Østlandet", lat: 59.7439, lon: 10.2045, isActive: false, loading: true },
    { name: "Fredrikstad", region: "Østlandet", lat: 59.2181, lon: 10.9298, isActive: false, loading: true },
    { name: "Bodø", region: "Nordland", lat: 67.2804, lon: 14.4049, isActive: false, loading: true },
    { name: "Ålesund", region: "Møre og Romsdal", lat: 62.4722, lon: 6.1494, isActive: false, loading: true },
    { name: "Haugesund", region: "Vestlandet", lat: 59.4136, lon: 5.2680, isActive: false, loading: true },
    { name: "Tønsberg", region: "Vestfold", lat: 59.2674, lon: 10.4075, isActive: false, loading: true },
    { name: "Moss", region: "Østlandet", lat: 59.4327, lon: 10.6589, isActive: false, loading: true },
    { name: "Sandefjord", region: "Vestfold", lat: 59.1313, lon: 10.2165, isActive: false, loading: true },
  ];

  // State for keeping track of user's position
  const [userPosition, setUserPosition] = useState<{ lat: number, lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Cities state - will hold the 3 nearest cities once we get user location
  const [cities, setCities] = useState<CityData[]>([
    { name: "Oslo", region: "Østlandet", lat: 59.9139, lon: 10.7522, isActive: true, loading: true },
    { name: "Bergen", region: "Vestlandet", lat: 60.3913, lon: 5.3221, isActive: false, loading: true },
    { name: "Trondheim", region: "Trøndelag", lat: 63.4305, lon: 10.3951, isActive: false, loading: true },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastGlobalRefresh, setLastGlobalRefresh] = useState<Date>(new Date());

  // Get user's current position
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Kunne ikke hente posisjon');
          // Fall back to default cities if we can't get location
        }
      );
    } else {
      setLocationError('Posisjonstjenester støttes ikke av nettleseren');
    }
  }, []);

  // Update cities list when we get user's position
  useEffect(() => {
    if (userPosition) {
      // Calculate distances to all cities
      const citiesWithDistance = allNorwegianCities.map(city => ({
        ...city,
        distance: calculateDistance(
          userPosition.lat,
          userPosition.lon,
          city.lat,
          city.lon
        )
      }));

      // Sort by distance and take the 3 nearest
      const nearestCities = citiesWithDistance
        .sort((a, b) => a.distance! - b.distance!)
        .slice(0, 3)
        .map((city, index) => ({
          ...city,
          isActive: index === 0, // Set first city as active
          loading: true
        }));

      setCities(nearestCities);
    }
  }, [userPosition]);

  useEffect(() => {
    const fetchCityWeather = async (city: CityData, index: number) => {
      try {
        // Use the enhanced weather endpoint for better data
        const response = await api.get(`/weather-ai/enhanced`, {
          params: { lat: city.lat, lon: city.lon }
        });

        const weatherData = response.data;
        const current = weatherData.weather?.current || weatherData.current;
        const aiInsights = weatherData.ai_analysis?.insights;

        if (!current) {
          throw new Error('No current weather data available');
        }

        const temperature = current.temperature?.current ?? current.temperature;
        const symbolCode = current.conditions?.symbol_code ?? current.symbol_code;
        const windSpeed = current.wind?.speed ?? current.wind_speed ?? 0;
        const humidity = current.atmospheric?.humidity ?? current.humidity ?? 0;
        const comfort = aiInsights?.comfort_analysis?.score ?? calculateComfortScore(temperature, windSpeed, humidity);

        // Use city's previous temperature for trend calculation if available
        const prevTemp = city.temp;
        const trend = calculateTrend(temperature, prevTemp);

        setCities(prev => prev.map((c, i) =>
          i === index
            ? {
              ...c,
              temp: Math.round(temperature),
              symbolCode,
              windSpeed,
              humidity,
              comfort,
              trend,
              loading: false,
              error: undefined,
              lastUpdated: new Date()
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
              error: 'Kunne ikke laste værdata'
            }
            : c
        ));
      }
    };

    // Fetch weather for all cities with staggered requests
    cities.forEach((city, index) => {
      if (city.loading && city.temp === undefined) {
        setTimeout(() => {
          fetchCityWeather(city, index);
        }, index * 300); // Stagger by 300ms
      }
    });
  }, [cities]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      handleRefreshAll();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    setLastGlobalRefresh(new Date());

    // Reset all cities to loading state
    setCities(prev => prev.map(city => ({
      ...city,
      loading: true,
      error: undefined
    })));

    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const handleCityClick = (index: number) => {
    setCities(prev => prev.map((city, i) => ({
      ...city,
      isActive: i === index
    })));

    const selectedCity = cities[index];
    if (onCitySelect && !selectedCity.loading && !selectedCity.error) {
      onCitySelect(selectedCity);
    }
  };

  const getTemperatureColor = (temp?: number, comfort?: number): string => {
    if (!temp) return 'rgba(255, 255, 255, 0.7)';

    // Use comfort score for more intelligent coloring
    if (comfort !== undefined) {
      if (comfort >= 80) return '#10b981'; // Excellent - green
      if (comfort >= 60) return '#3b82f6'; // Good - blue
      if (comfort >= 40) return '#f59e0b'; // Moderate - yellow
      if (comfort >= 20) return '#ef4444'; // Poor - red
      return '#8b5cf6'; // Very poor - purple
    }

    // Fallback to temperature-based coloring
    if (temp < -5) return '#60a5fa'; // Very cold - light blue
    if (temp < 5) return '#93c5fd'; // Cold - blue
    if (temp < 15) return '#fbbf24'; // Cool - yellow
    if (temp < 25) return '#34d399'; // Comfortable - green
    return '#f87171'; // Hot - red
  };

  const formatTimeAgo = (date?: Date): string => {
    if (!date) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'nå';
    if (diffMins < 60) return `${diffMins}m siden`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}t siden`;

    return date.toLocaleDateString('nb-NO');
  };

  return (
    <>
      <style>{`
        .city-temperatures-container {
          display: flex;
          gap: 1rem;
          padding-top: 0.5rem;
          align-items: flex-start;
        }

        .city-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-width: 120px;
          position: relative;
        }
        
        .city-location {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.4rem;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 300;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }

        .city-temp {
          font-size: 1rem;
          font-weight: 300;
          color: white;
          line-height: 1;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }
        
        .city-trend {
          position: absolute;
          top: 0;
          right: -8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.5rem;
        }

        .city-name {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.4rem;
          font-weight: 300;
          margin-bottom: 0.5rem;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }

        .city-indicator {
          height: 1.2px;
          width: 100%;
          min-width: 80px;
          border-radius: 1px;
          transition: all 0.3s ease;
        }

        .city-indicator.active {
          background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
        }

        .city-indicator.inactive {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .location-status {
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.5rem;
          margin-bottom: 0.3rem;
          font-style: italic;
        }

        @media (min-width: 1024px) {
          .city-temperatures-container {
            gap: 2rem;
          }

          .city-temp {
            font-size: 1.4rem;
          }

          .city-name {
            font-size: 0.45rem;
          }

          .city-item {
            min-width: 140px;
          }
        }

        @media (max-width: 768px) {
          .city-temperatures-container {
            gap: 1rem;
            padding-top: 0.5rem;
          }

          .city-temp {
            font-size: 0.9rem;
          }

          .city-name {
            font-size: 0.4rem;
            margin-bottom: 0.4rem;
          }

          .city-item {
            min-width: 65px;
          }

          .city-indicator {
            height: 1.5px;
            min-width: 45px;
          }
        }

        @media (max-width: 480px) {
          .city-temperatures-container {
            gap: 0.8rem;
          }

          .city-temp {
            font-size: 1.1rem;
          }

          .city-name {
            font-size: 0.4rem;
          }

          .city-item {
            min-width: 55px;
          }
        }
      `}</style>

      {locationError && (
        <div className="location-status">
          {locationError}. Viser standardbyer.
        </div>
      )}

      {!locationError && !userPosition && (
        <div className="location-status">
          Henter din posisjon...
        </div>
      )}

      <div className="city-temperatures-container">
        {cities.map((city, index) => (
          <div
            key={city.name}
            className="city-item"
            onClick={() => handleCityClick(index)}
          >
            {userPosition && (
              <div className="city-location">
                <MapPin size={8} style={{ display: 'inline', marginRight: '2px' }} />
                {city.distance ? `${Math.round(city.distance)} km` : ''}
              </div>
            )}
            <div className="city-temp">
              {city.loading ? (
                <span style={{ opacity: 0.5 }}>--</span>
              ) : city.error ? (
                <span style={{ opacity: 0.5, fontSize: '1rem' }}>!</span>
              ) : (
                `${city.temp}°`
              )}
              {city.trend && city.temp && !city.loading && !city.error && (
                <div className="city-trend">
                  {city.trend === 'up' && <TrendingUp size={12} color="#10b981" />}
                  {city.trend === 'down' && <TrendingDown size={12} color="#ef4444" />}
                </div>
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