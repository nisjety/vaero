// Description: A React component that shows a metrics panel with location-based temperature readings
// from different Norwegian cities, each with an icon representing the weather condition.
// The indicator color changes based on the temperature reading.
// It should be responsive and visually appealing, with a focus on user interaction and accessibility.
// It includes a header with a percentage and indicators.
// and a scrollable list of metric cards for each city.
// On hover, the card tells the user more info about the condition in that city.

import React, { useState, useEffect } from 'react';
import { Thermometer, Cloud, Sun, Snowflake, CloudRain } from 'lucide-react';
import { api } from '../../lib/api';
// Removed AI-related hooks since we're using free tier endpoints

interface MetricCardProps {
  location: string;
  region: string;
  value: string;
  unit?: string;
  icon?: React.ReactNode;
  className?: string;
  symbolCode?: string;
}

const MetricCard = ({ location, region, value, unit = "°", icon, className = "", symbolCode: _symbolCode }: MetricCardProps) => {
  return (
    <div className={`metric-card ${className}`}>
      <div className="metric-card-content">
        <div className="metric-card-location">
          <div className="metric-card-city">{location}</div>
          <div className="metric-card-state">({region})</div>
        </div>
        <div className="metric-card-right">
          <div className="metric-card-value">
            {value}
            <span className="metric-card-unit">{unit}</span>
          </div>
          <div className="metric-card-icons">
            {icon && (
              <div className="metric-card-icon">
                {icon}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface CityData {
  location: string;
  region: string;
  lat: number;
  lon: number;
  temp?: number;
  symbolCode?: string;
  loading: boolean;
  error?: string;
}

export const MetricsPanel = () => {
  
  const [cities, setCities] = useState<CityData[]>([
    { location: "Oslo", region: "Østlandet", lat: 59.9139, lon: 10.7522, loading: true },
    { location: "Bergen", region: "Vestlandet", lat: 60.3913, lon: 5.3221, loading: true },
    { location: "Trondheim", region: "Trøndelag", lat: 63.4305, lon: 10.3951, loading: true },
    { location: "Stavanger", region: "Vestlandet", lat: 58.9700, lon: 5.7331, loading: true },
    { location: "Kristiansand", region: "Sørlandet", lat: 58.1467, lon: 7.9956, loading: true },
    { location: "Fredrikstad", region: "Østlandet", lat: 59.2181, lon: 10.9298, loading: true },
    { location: "Drammen", region: "Østlandet", lat: 59.7439, lon: 10.2045, loading: true },
    { location: "Skien", region: "Østlandet", lat: 59.2086, lon: 9.6091, loading: true },
    { location: "Kristiansund", region: "Møre og Romsdal", lat: 63.1109, lon: 7.7289, loading: true },
    { location: "Ålesund", region: "Møre og Romsdal", lat: 62.4722, lon: 6.1494, loading: true },
  ]);

  useEffect(() => {
    const fetchCityWeather = async (city: CityData, index: number) => {
      try {
        // Use free tier current weather endpoint
        const response = await api.get(`/weather/current?lat=${city.lat}&lon=${city.lon}`);
        const weatherData = response.data;
        
        setCities(prev => prev.map((c, i) => 
          i === index 
            ? { 
                ...c, 
                temp: Math.round(weatherData.current.temperature),
                symbolCode: weatherData.current.symbol_code,
                loading: false,
                error: undefined
              }
            : c
        ));
      } catch (error) {
        console.error(`Error fetching weather for ${city.location}:`, error);
        setCities(prev => prev.map((c, i) => 
          i === index 
            ? { 
                ...c, 
                loading: false,
                error: 'Feil' 
              }
            : c
        ));
      }
    };

    cities.forEach((city, index) => {
      if (city.loading && city.temp === undefined) {
        fetchCityWeather(city, index);
      }
    });
  }, [cities]); // Add proper dependency

  // Get icon component based on symbol code
  const getIconComponent = (symbolCode?: string) => {
    if (!symbolCode) return <Thermometer className="w-4 h-4" />;
    
    if (symbolCode.includes('snow')) return <Snowflake className="w-4 h-4" />;
    if (symbolCode.includes('rain')) return <CloudRain className="w-4 h-4" />;
    if (symbolCode.includes('cloud')) return <Cloud className="w-4 h-4" />;
    if (symbolCode.includes('clear') || symbolCode.includes('fair')) return <Sun className="w-4 h-4" />;
    return <Thermometer className="w-4 h-4" />;
  };

  // Calculate average temperature
  const validTemps = cities.filter(city => city.temp !== undefined && !city.error).map(city => city.temp!);
  const avgTemp = validTemps.length > 0 ? Math.round(validTemps.reduce((a, b) => a + b, 0) / validTemps.length) : 0;

  return (
    <>
      <style>{`
        .metrics-panel {
          width: 100%;
          max-width: 280px;
        }

        .metrics-header {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 12px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s ease;
        }

        .metrics-header:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .metrics-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .metrics-header-icon {
          width: 20px;
          height: 20px;
          color: rgba(255, 255, 255, 0.8);
        }

        .metrics-header-value {
          color: white;
          font-size: 22px;
          font-weight: 300;
          line-height: 1;
        }

        .metrics-header-indicators {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .metrics-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .metrics-indicator:hover {
          transform: scale(1.3);
        }

        .indicator-purple {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .indicator-blue {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .indicator-yellow {
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        }

        .metrics-cards-container {
          height: 320px;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .metrics-cards-container::-webkit-scrollbar {
          display: none;
        }

        .metrics-cards {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-right: 4px;
        }

        .metric-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          padding: 12px 14px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .metric-card:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateX(4px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .metric-card-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .metric-card-location {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .metric-card-city {
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          font-weight: 400;
          line-height: 1.2;
        }

        .metric-card-state {
          color: rgba(255, 255, 255, 0.6);
          font-size: 10px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-card-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .metric-card-icons {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .metric-card-value {
          color: white;
          font-size: 18px;
          font-weight: 300;
          line-height: 1;
        }

        .metric-card-unit {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          margin-left: 1px;
        }

        .metric-card-icon {
          width: 28px;
          height: 28px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .metric-card-ai-indicator {
          width: 20px;
          height: 20px;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .metric-card-ai-insight {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
          padding: 2px 6px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(59, 130, 246, 0.2);
          max-width: 100%;
          overflow: hidden;
        }

        .metric-card-ai-insight span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 10px;
        }

        .metric-card:hover .metric-card-icon {
          background: rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.9);
        }

        .metric-card:hover .metric-card-ai-indicator {
          background: rgba(59, 130, 246, 0.3);
        }

        .metrics-header-ai-status {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: 8px;
        }

        .ai-status-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .ai-status-active {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
        }

        .ai-status-loading {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          animation: pulse 2s infinite;
        }

        .ai-status-inactive {
          background: rgba(255, 255, 255, 0.3);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Smooth scroll animation */
        .metrics-cards-container {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar for desktop */
        @media (min-width: 768px) {
          .metrics-cards-container {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
          }

          .metrics-cards-container::-webkit-scrollbar {
            display: block;
            width: 3px;
          }

          .metrics-cards-container::-webkit-scrollbar-track {
            background: transparent;
          }

          .metrics-cards-container::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 10px;
          }

          .metrics-cards-container::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }
        }

        @media (max-width: 640px) {
          .metrics-panel {
            max-width: 100%;
          }

          .metrics-header {
            padding: 10px 14px;
            margin-bottom: 10px;
          }

          .metrics-header-value {
            font-size: 20px;
          }

          .metrics-header-icon {
            width: 18px;
            height: 18px;
          }

          .metrics-cards-container {
            height: 280px;
          }

          .metric-card {
            padding: 10px 12px;
          }

          .metric-card-city {
            font-size: 12px;
          }

          .metric-card-value {
            font-size: 16px;
          }

          .metric-card-icon {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
      
      <div className="metrics-panel">
        {/* Header with percentage and indicators */}
        <div className="metrics-header">
          <div className="metrics-header-left">
            <Thermometer className="metrics-header-icon" />
            <div className="metrics-header-value">{avgTemp}°</div>
          </div>
          <div className="metrics-header-indicators">
            <div className="metrics-indicator indicator-purple"></div>
            <div className="metrics-indicator indicator-blue"></div>
            <div className="metrics-indicator indicator-yellow"></div>
          </div>
        </div>

        {/* Scrollable location-based temperature cards */}
        <div className="metrics-cards-container">
          <div className="metrics-cards">
            {cities.map((city, index) => (
              <MetricCard 
                key={index}
                location={city.location} 
                region={city.region}
                value={city.loading ? "--" : city.error ? "!" : city.temp?.toString() || "--"} 
                icon={getIconComponent(city.symbolCode)}
                symbolCode={city.symbolCode}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};