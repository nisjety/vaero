// Description: A React component that shows a metrics panel with location-based temperature readings
// from different Norwegian cities, each with an icon representing the weather condition.
// The indicator color changes based on the temperature reading.
// It should be responsive and visually appealing, with a focus on user interaction and accessibility.
// It includes a header with a percentage and indicators.
// and a scrollable list of metric cards for each city.
// On hover, the card tells the user more info about the condition in that city.

// components/weather/MetricsPanel.tsx
// Complete metrics panel with real weather data from Norwegian cities

import React, { useState, useEffect, useMemo } from 'react';
import { Thermometer, Cloud, Sun, Snowflake, CloudRain, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { api } from '../../lib/api';

interface MetricCardProps {
  location: string;
  region: string;
  value: string;
  unit?: string;
  icon?: React.ReactNode;
  className?: string;
  symbolCode?: string;
  trend?: 'up' | 'down' | 'stable';
  comfort?: 'excellent' | 'good' | 'moderate' | 'poor' | 'very_poor';
  onClick?: () => void;
  loading?: boolean;
  error?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  location,
  region,
  value,
  unit = "°",
  icon,
  className = "",
  symbolCode,
  trend,
  comfort,
  onClick,
  loading = false,
  error
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-red-400" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-blue-400" />;
    return null;
  };

  const getComfortColor = () => {
    switch (comfort) {
      case 'excellent': return 'border-l-green-400';
      case 'good': return 'border-l-blue-400';
      case 'moderate': return 'border-l-yellow-400';
      case 'poor': return 'border-l-orange-400';
      case 'very_poor': return 'border-l-red-400';
      default: return 'border-l-gray-400';
    }
  };

  return (
    <div
      className={`metric-card ${className} ${comfort ? getComfortColor() : ''} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="metric-card-content">
        <div className="metric-card-location">
          <div className="metric-card-city">{location}</div>
          <div className="metric-card-state">({region})</div>
        </div>
        <div className="metric-card-right">
          <div className="metric-card-value">
            {loading ? (
              <div className="loading-dots">...</div>
            ) : error ? (
              <span className="error-value">!</span>
            ) : (
              <>
                {value}
                <span className="metric-card-unit">{unit}</span>
                {getTrendIcon()}
              </>
            )}
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

      {/* Hover details */}
      <div className="metric-card-hover-details">
        <div className="detail-row">
          <span>Komfort:</span>
          <span className="comfort-badge">{comfort || 'Ukjent'}</span>
        </div>
        {symbolCode && (
          <div className="detail-row">
            <span>Forhold:</span>
            <span>{translateSymbolCode(symbolCode)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface CityMetric {
  name: string;
  region: string;
  lat: number;
  lon: number;
  temp?: number;
  symbolCode?: string;
  loading: boolean;
  error?: string;
  trend?: 'up' | 'down' | 'stable';
  comfort?: 'excellent' | 'good' | 'moderate' | 'poor' | 'very_poor';
  windSpeed?: number;
  humidity?: number;
  pressure?: number;
  lastUpdated?: Date;
}

interface MetricsPanelProps {
  onCitySelect?: (city: CityMetric) => void;
  showAI?: boolean;
  maxCities?: number;
  refreshInterval?: number;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({
  onCitySelect,
  showAI = false,
  maxCities = 10,
  refreshInterval = 10 * 60 * 1000 // 10 minutes
}) => {
  const [cities, setCities] = useState<CityMetric[]>([
    { name: "Oslo", region: "Østlandet", lat: 59.9139, lon: 10.7522, loading: true },
    { name: "Bergen", region: "Vestlandet", lat: 60.3913, lon: 5.3221, loading: true },
    { name: "Trondheim", region: "Trøndelag", lat: 63.4305, lon: 10.3951, loading: true },
    { name: "Stavanger", region: "Vestlandet", lat: 58.9700, lon: 5.7331, loading: true },
    { name: "Tromsø", region: "Nord-Norge", lat: 69.6496, lon: 18.9560, loading: true },
    { name: "Kristiansand", region: "Sørlandet", lat: 58.1599, lon: 7.9956, loading: true },
    { name: "Drammen", region: "Østlandet", lat: 59.7439, lon: 10.2045, loading: true },
    { name: "Fredrikstad", region: "Østlandet", lat: 59.2181, lon: 10.9298, loading: true },
    { name: "Ålesund", region: "Møre og Romsdal", lat: 62.4722, lon: 6.1494, loading: true },
    { name: "Bodø", region: "Nordland", lat: 67.2804, lon: 14.4049, loading: true },
  ].slice(0, maxCities));

  const [aiStatus, setAIStatus] = useState<{
    active: boolean;
    processing: boolean;
    model?: string;
  }>({
    active: false,
    processing: false
  });

  // Computed metrics
  const metrics = useMemo(() => {
    const validCities = cities.filter(city => city.temp !== undefined && !city.error);

    if (validCities.length === 0) {
      return {
        avgTemp: 0,
        minTemp: 0,
        maxTemp: 0,
        spread: 0,
        trend: 'stable' as const
      };
    }

    const temps = validCities.map(city => city.temp!);
    const avg = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
    const min = Math.min(...temps);
    const max = Math.max(...temps);

    // Simple trend analysis based on geographic pattern
    const northernCities = validCities.filter(city => city.lat > 65);
    const southernCities = validCities.filter(city => city.lat < 61);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (northernCities.length > 0 && southernCities.length > 0) {
      const northAvg = northernCities.reduce((sum, city) => sum + city.temp!, 0) / northernCities.length;
      const southAvg = southernCities.reduce((sum, city) => sum + city.temp!, 0) / southernCities.length;

      if (northAvg > southAvg + 2) trend = 'up'; // Unusual - warmer in north
      else if (southAvg > northAvg + 5) trend = 'down'; // Normal - warmer in south
    }

    return {
      avgTemp: Math.round(avg),
      minTemp: min,
      maxTemp: max,
      spread: max - min,
      trend
    };
  }, [cities]);

  useEffect(() => {
    fetchAllCitiesWeather();

    const interval = setInterval(fetchAllCitiesWeather, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (showAI) {
      checkAIStatus();
    }
  }, [showAI]);

  const fetchAllCitiesWeather = async () => {
    try {
      // Try popular locations endpoint first
      const response = await api.get('/weather/popular-locations');

      if (response.data.success && response.data.results) {
        updateCitiesFromPopularLocations(response.data.results);
      } else {
        // Fallback to individual requests
        await fetchIndividualCities();
      }
    } catch (error) {
      console.error('Error fetching popular locations:', error);
      await fetchIndividualCities();
    }
  };

  const updateCitiesFromPopularLocations = (popularData: Record<string, unknown>[]) => {
    setCities(prevCities =>
      prevCities.map(city => {
        const matchingData = popularData.find((pop: Record<string, unknown>) =>
          (pop.location as any)?.name?.toLowerCase() === city.name.toLowerCase()
        );

        if (matchingData && (matchingData as any).weather) {
          const weather = (matchingData as any).weather;
          const current = weather.current || weather.weather?.current;

          return {
            ...city,
            temp: Math.round(current.temperature?.current || current.temperature || 0),
            symbolCode: current.conditions?.symbol_code || current.symbol_code,
            windSpeed: current.wind?.speed || current.wind_speed,
            humidity: current.atmospheric?.humidity || current.humidity,
            pressure: current.atmospheric?.pressure || current.pressure,
            comfort: determineComfort(current.temperature?.current || current.temperature || 0),
            trend: determineTrend(city, current.temperature?.current || current.temperature || 0),
            loading: false,
            error: undefined,
            lastUpdated: new Date()
          };
        }

        return city;
      })
    );
  };

  const fetchIndividualCities = async () => {
    const promises = cities.map(async (city, index) => {
      try {
        const response = await api.get('/weather/current', {
          params: { lat: city.lat, lon: city.lon }
        });

        if (response.data.success) {
          const current = response.data.current;
          return {
            index,
            data: {
              temp: Math.round(current.temperature.current),
              symbolCode: current.conditions.symbol_code,
              windSpeed: current.wind.speed,
              humidity: current.atmospheric.humidity,
              pressure: current.atmospheric.pressure,
              comfort: determineComfort(current.temperature.current),
              trend: determineTrend(city, current.temperature.current),
              loading: false,
              error: undefined,
              lastUpdated: new Date()
            }
          };
        }

        return {
          index,
          data: { loading: false, error: 'API Error' }
        };
      } catch {
        return {
          index,
          data: { loading: false, error: 'Network Error' }
        };
      }
    });

    const results = await Promise.allSettled(promises);

    setCities(prevCities => {
      const newCities = [...prevCities];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const { index: cityIndex, data } = result.value;
          newCities[cityIndex] = { ...newCities[cityIndex], ...data };
        } else {
          newCities[index] = {
            ...newCities[index],
            loading: false,
            error: 'Failed to load'
          };
        }
      });

      return newCities;
    });
  };

  const checkAIStatus = async () => {
    try {
      setAIStatus(prev => ({ ...prev, processing: true }));

      const response = await api.get('/weather-ai/status');

      if (response.data.status === 'operational') {
        setAIStatus({
          active: true,
          processing: false,
          model: response.data.models?.primary || 'AI Active'
        });
      } else {
        setAIStatus({ active: false, processing: false });
      }
    } catch {
      setAIStatus({ active: false, processing: false });
    }
  };

  // Get icon component based on symbol code
  const getIconComponent = (symbolCode?: string) => {
    if (!symbolCode) return <Thermometer className="w-4 h-4" />;

    if (symbolCode.includes('snow')) return <Snowflake className="w-4 h-4" />;
    if (symbolCode.includes('rain')) return <CloudRain className="w-4 h-4" />;
    if (symbolCode.includes('cloud')) return <Cloud className="w-4 h-4" />;
    if (symbolCode.includes('clear') || symbolCode.includes('fair')) return <Sun className="w-4 h-4" />;
    return <Thermometer className="w-4 h-4" />;
  };

  const handleCityClick = (city: CityMetric) => {
    if (onCitySelect) {
      onCitySelect(city);
    }
  };

  return (
    <>
      <style>{getStyles()}</style>

      <div className="metrics-panel">
        {/* Header with aggregated metrics */}
        <div className="metrics-header">
          <div className="metrics-header-left">
            <Thermometer className="metrics-header-icon" />
            <div className="metrics-header-value">{metrics.avgTemp}°</div>
            <div className="metrics-header-range">
              <span className="range-min">{metrics.minTemp}°</span>
              <span className="range-separator">–</span>
              <span className="range-max">{metrics.maxTemp}°</span>
            </div>
          </div>
          <div className="metrics-header-indicators">
            <div className={`metrics-indicator indicator-spread-${metrics.spread > 10 ? 'high' : metrics.spread > 5 ? 'medium' : 'low'}`}></div>
            <div className={`metrics-indicator indicator-trend-${metrics.trend}`}></div>
            {showAI && (
              <div className={`ai-status-indicator ${aiStatus.active ? 'ai-active' : aiStatus.processing ? 'ai-loading' : 'ai-inactive'}`}></div>
            )}
          </div>
        </div>

        {/* Weather statistics summary */}
        <div className="weather-stats">
          <div className="stat-item">
            <Activity className="stat-icon" />
            <span className="stat-value">{metrics.spread.toFixed(1)}°</span>
            <span className="stat-label">Spredning</span>
          </div>
          <div className="stat-item">
            <TrendingUp className="stat-icon" />
            <span className="stat-value">{cities.filter(c => !c.loading && !c.error).length}</span>
            <span className="stat-label">Aktive</span>
          </div>
        </div>

        {/* Scrollable city cards */}
        <div className="metrics-cards-container">
          <div className="metrics-cards">
            {cities.map((city, _index) => (
              <MetricCard
                key={`${city.name}-${city.lat}-${city.lon}`}
                location={city.name}
                region={city.region}
                value={city.loading ? "--" : city.error ? "!" : city.temp?.toString() || "--"}
                icon={getIconComponent(city.symbolCode)}
                symbolCode={city.symbolCode}
                trend={city.trend}
                comfort={city.comfort}
                loading={city.loading}
                error={city.error}
                onClick={() => !city.loading && !city.error && handleCityClick(city)}
                className={city.error ? 'error-card' : ''}
              />
            ))}
          </div>
        </div>

        {/* AI Status footer */}
        {showAI && (
          <div className="ai-status-footer">
            <div className="ai-status-text">
              {aiStatus.processing ? (
                <span>🤖 Sjekker AI-status...</span>
              ) : aiStatus.active ? (
                <span>🤖 AI Aktiv ({aiStatus.model})</span>
              ) : (
                <span>🤖 AI Ikke tilgjengelig</span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Helper functions
function determineComfort(temp: number): 'excellent' | 'good' | 'moderate' | 'poor' | 'very_poor' {
  if (temp >= 18 && temp <= 24) return 'excellent';
  if (temp >= 15 && temp <= 27) return 'good';
  if (temp >= 10 && temp <= 30) return 'moderate';
  if (temp >= 0 && temp <= 35) return 'poor';
  return 'very_poor';
}

function determineTrend(city: CityMetric, newTemp: number): 'up' | 'down' | 'stable' {
  if (!city.temp) return 'stable';

  const diff = newTemp - city.temp;
  if (diff > 1) return 'up';
  if (diff < -1) return 'down';
  return 'stable';
}

function translateSymbolCode(symbolCode: string): string {
  const translations: { [key: string]: string } = {
    'clearsky': 'Klart',
    'fair': 'Lettskyet',
    'partlycloudy': 'Delvis skyet',
    'cloudy': 'Overskyet',
    'rain': 'Regn',
    'lightrain': 'Lett regn',
    'heavyrain': 'Kraftig regn',
    'snow': 'Snø',
    'lightsnow': 'Lett snø',
    'fog': 'Tåke'
  };

  const baseSymbol = symbolCode.replace(/_day|_night|_polartwilight/g, '');
  return translations[baseSymbol] || symbolCode;
}

function getStyles(): string {
  return `
    .metrics-panel {
      width: 100%;
      max-width: 320px;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: white;
      overflow: hidden;
    }

    .metrics-header {
      background: rgba(255, 255, 255, 0.1);
      padding: 1rem 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
      gap: 0.75rem;
    }

    .metrics-header-icon {
      width: 24px;
      height: 24px;
      color: rgba(255, 255, 255, 0.8);
    }

    .metrics-header-value {
      color: white;
      font-size: 1.75rem;
      font-weight: 300;
      line-height: 1;
    }

    .metrics-header-range {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .range-min {
      color: rgba(96, 165, 250, 0.9);
    }

    .range-max {
      color: rgba(251, 191, 36, 0.9);
    }

    .range-separator {
      color: rgba(255, 255, 255, 0.5);
    }

    .metrics-header-indicators {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .metrics-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .indicator-spread-low {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .indicator-spread-medium {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .indicator-spread-high {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .indicator-trend-up {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      animation: pulse 2s infinite;
    }

    .indicator-trend-down {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      animation: pulse 2s infinite;
    }

    .indicator-trend-stable {
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
    }

    .ai-status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .ai-active {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
    }

    .ai-loading {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      animation: pulse 2s infinite;
    }

    .ai-inactive {
      background: rgba(255, 255, 255, 0.3);
    }

    .weather-stats {
      display: flex;
      justify-content: space-around;
      padding: 0.75rem 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .stat-icon {
      width: 16px;
      height: 16px;
      color: rgba(255, 255, 255, 0.7);
    }

    .stat-value {
      font-size: 1.125rem;
      font-weight: 500;
      color: white;
    }

    .stat-label {
      font-size: 0.6875rem;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metrics-cards-container {
      height: 240px;
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
      gap: 0.5rem;
      padding: 0.75rem;
    }

    .metric-card {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      border-radius: 12px;
      padding: 0.875rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-left: 3px solid rgba(255, 255, 255, 0.3);
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }

    .metric-card:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateX(4px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .metric-card.error-card {
      background: rgba(239, 68, 68, 0.1);
      border-left-color: rgba(239, 68, 68, 0.5);
    }

    .metric-card.border-l-green-400 {
      border-left-color: #4ade80;
    }

    .metric-card.border-l-blue-400 {
      border-left-color: #60a5fa;
    }

    .metric-card.border-l-yellow-400 {
      border-left-color: #facc15;
    }

    .metric-card.border-l-orange-400 {
      border-left-color: #fb923c;
    }

    .metric-card.border-l-red-400 {
      border-left-color: #f87171;
    }

    .metric-card-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .metric-card-location {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .metric-card-city {
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.2;
    }

    .metric-card-state {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.6875rem;
      font-weight: 300;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-card-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .metric-card-value {
      color: white;
      font-size: 1.125rem;
      font-weight: 300;
      line-height: 1;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .metric-card-unit {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
      margin-left: 0.125rem;
    }

    .loading-dots {
      animation: loadingDots 1.5s infinite;
    }

    .error-value {
      color: rgba(239, 68, 68, 0.8);
    }

    .metric-card-icons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .metric-card-icon {
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.7);
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .metric-card:hover .metric-card-icon {
      background: rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.9);
    }

    .metric-card-hover-details {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.9);
      padding: 0.5rem 0.875rem;
      border-radius: 0 0 12px 12px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 10;
    }

    .metric-card:hover .metric-card-hover-details {
      opacity: 1;
      visibility: visible;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 0.25rem;
    }

    .detail-row:last-child {
      margin-bottom: 0;
    }

    .comfort-badge {
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-size: 0.625rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .ai-status-footer {
      padding: 0.75rem 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
    }

    .ai-status-text {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.7);
      text-align: center;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @keyframes loadingDots {
      0%, 20% { opacity: 0; }
      50% { opacity: 1; }
      80%, 100% { opacity: 0; }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .metrics-panel {
        max-width: 100%;
      }

      .metrics-header {
        padding: 0.875rem 1rem;
      }

      .metrics-header-value {
        font-size: 1.5rem;
      }

      .weather-stats {
        padding: 0.625rem 1rem;
      }

      .metrics-cards {
        padding: 0.625rem;
        gap: 0.375rem;
      }

      .metric-card {
        padding: 0.75rem;
      }

      .metric-card-city {
        font-size: 0.8125rem;
      }

      .metric-card-value {
        font-size: 1rem;
      }

      .metric-card-icon {
        width: 28px;
        height: 28px;
      }
    }

    @media (max-width: 640px) {
      .metrics-cards-container {
        height: 280px;
      }

      .metric-card-city {
        font-size: 0.75rem;
      }

      .metric-card-state {
        font-size: 0.625rem;
      }

      .metric-card-value {
        font-size: 0.875rem;
      }

      .metric-card-icon {
        width: 24px;
        height: 24px;
      }
    }
  `;
}

export default MetricsPanel;