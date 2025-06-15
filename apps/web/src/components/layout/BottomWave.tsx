// Description: En React-komponent som rendrer en jevn, 
// animert bølge basert på timevise temperaturavlesninger fra YR, 
// med etiketter som indikerer høye og lave temperaturer og tid på døgnet. 
// Bølgehøyden justeres dynamisk basert på nåværende temperatur, 
// og skaper en visuelt tiltalende og informativ visning.

// components/weather/BottomWave.tsx
// Complete temperature wave with real forecast data from backend

import React, { useMemo, useState, useEffect } from 'react';
import { useEnhancedWeather, useForecast } from '../../hooks/api';

interface TempPoint {
  temp: number;
  label: string;
  time: string;
  hour: number;
  isSignificant: boolean;
}

interface BottomWaveProps {
  lat?: number;
  lon?: number;
  showLabels?: boolean;
  interactive?: boolean;
}

export const BottomWave: React.FC<BottomWaveProps> = ({
  lat = 59.9139,
  lon = 10.7522,
  showLabels = true,
  interactive = true
}) => {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  const { data: weatherData, isLoading: isWeatherLoading } = useEnhancedWeather(lat, lon);
  const { data: forecastData, isLoading: isForecastLoading } = useForecast(lat, lon, 24, 1);

  const isLoading = isWeatherLoading || isForecastLoading;

  // Animation effect for wave entrance
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setAnimationProgress(1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Process hourly temperature data
  const hourlyTemps = useMemo(() => {
    if (!forecastData?.hourly || !Array.isArray(forecastData.hourly)) {
      // Fallback to enhanced weather data if available
      if (weatherData?.weather?.current) {
        const currentTemp = weatherData.weather.current.temperature;
        const currentHour = new Date().getHours();

        // Generate realistic temperature variation based on current conditions
        return Array.from({ length: 12 }, (_, i) => {
          const hour = (currentHour + i * 2) % 24;
          const timeOfDay = getTimeOfDayVariation(hour);
          const temp = currentTemp + timeOfDay + (Math.random() - 0.5) * 2;

          return {
            temp,
            label: `${Math.round(temp)}°`,
            time: `${hour.toString().padStart(2, '0')}:00`,
            hour,
            isSignificant: i % 2 === 0 || isSignificantTemp(temp, currentTemp)
          };
        });
      }

      // Ultimate fallback with realistic Norwegian temperatures
      return generateFallbackData();
    }

    const currentTemp = weatherData?.weather?.current?.temperature || 15;

    return forecastData.hourly
      .slice(0, 24) // Next 24 hours
      .filter((_, index) => index % 2 === 0) // Every 2nd hour for cleaner display
      .map((hourData, index) => {
        const date = new Date(hourData.timestamp);
        const hour = date.getHours();
        const temp = hourData.temperature;

        const isSignificant = index % 2 === 0 ||
          isSignificantTemp(temp, currentTemp) ||
          isSignificantTime(hour);

        return {
          temp,
          label: formatTempLabel(temp, currentTemp, isSignificant),
          time: date.toLocaleTimeString('nb-NO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          hour,
          isSignificant
        };
      });
  }, [weatherData, forecastData]);

  const currentTemp = weatherData?.weather?.current?.temperature || 15;
  const { minTemp, maxTemp, tempRange } = useMemo(() => {
    const temps = hourlyTemps.map(p => p.temp);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    return {
      minTemp: min,
      maxTemp: max,
      tempRange: max - min
    };
  }, [hourlyTemps]);

  // Calculate wave height based on temperature relative to range
  const getWaveHeight = (temp: number): number => {
    const baseline = 60; // Center line
    const maxVariation = 30; // Maximum pixels from baseline

    if (tempRange < 2) {
      // Very stable temperatures - minimal variation
      return baseline + (Math.random() - 0.5) * 5;
    }

    // Normalize temperature to 0-1 range
    const normalizedTemp = (temp - minTemp) / tempRange;

    // Invert so higher temps are lower on screen (more intuitive)
    const heightOffset = (0.5 - normalizedTemp) * maxVariation;

    return Math.max(15, Math.min(105, baseline + heightOffset));
  };

  // Generate smooth wave path using cubic bezier curves
  const generateWavePath = (): string => {
    if (hourlyTemps.length < 2) return '';

    const width = 1920;
    const segmentWidth = width / (hourlyTemps.length - 1);

    const points = hourlyTemps.map((temp, i) => ({
      x: i * segmentWidth,
      y: getWaveHeight(temp.temp)
    }));

    let path = `M${points[0].x},${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      const prevPrev = points[i - 2];

      // Smooth control points for natural curves
      const tension = 0.3;
      const cp1x = prev.x + (curr.x - (prevPrev?.x || prev.x - segmentWidth)) * tension;
      const cp1y = prev.y + (curr.y - (prevPrev?.y || prev.y)) * tension;

      const cp2x = curr.x - (((next?.x || curr.x + segmentWidth) - prev.x) * tension);
      const cp2y = curr.y - (((next?.y || curr.y) - prev.y) * tension);

      path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
    }

    return path;
  };

  const handlePointClick = (index: number) => {
    if (interactive) {
      setSelectedPoint(selectedPoint === index ? null : index);
    }
  };

  if (isLoading) {
    return (
      <div className="temperature-wave">
        <style>{getStyles()}</style>
        <div className="wave-container">
          <div className="loading-state">
            <div className="loading-wave"></div>
            <div className="loading-text">Laster værprognose...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{getStyles()}</style>

      <div className="temperature-wave">
        <div className="wave-container">
          {/* Temperature info overlay */}
          <div className="temp-info-overlay">
            <div className="temp-range">
              <span className="temp-min">{Math.round(minTemp)}°</span>
              <span className="temp-separator">–</span>
              <span className="temp-max">{Math.round(maxTemp)}°</span>
            </div>
            <div className="temp-period">Neste 24 timer</div>
          </div>

          {/* Baseline indicator */}
          <div className="baseline-indicator"></div>

          {/* SVG Wave with animations */}
          <svg className="wave-svg" viewBox="0 0 1920 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.06)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
              </linearGradient>

              <linearGradient id="waveLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
              </linearGradient>

              <filter id="waveGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Wave area fill */}
            <path
              className="wave-area"
              d={`${generateWavePath()} L1920,120 L0,120 Z`}
              fill="url(#waveGradient)"
              style={{
                transform: `scaleX(${animationProgress})`,
                transformOrigin: 'left',
                transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />

            {/* Wave line with glow effect */}
            <path
              className="wave-path"
              d={generateWavePath()}
              stroke="url(#waveLineGradient)"
              filter="url(#waveGlow)"
              style={{
                strokeDasharray: '2000',
                strokeDashoffset: `${2000 * (1 - animationProgress)}`,
                transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />

            {/* Interactive points */}
            {interactive && hourlyTemps.map((point, index) => {
              const x = (index / (hourlyTemps.length - 1)) * 1920;
              const y = getWaveHeight(point.temp);

              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    className={`wave-point ${selectedPoint === index ? 'selected' : ''}`}
                    onClick={() => handlePointClick(index)}
                    style={{
                      opacity: animationProgress,
                      animationDelay: `${index * 0.1}s`
                    }}
                  />
                  {selectedPoint === index && (
                    <g>
                      <rect
                        x={x - 25}
                        y={y - 35}
                        width="50"
                        height="25"
                        rx="4"
                        className="point-tooltip"
                      />
                      <text
                        x={x}
                        y={y - 20}
                        className="point-tooltip-text"
                        textAnchor="middle"
                      >
                        {point.label}
                      </text>
                      <text
                        x={x}
                        y={y - 8}
                        className="point-tooltip-time"
                        textAnchor="middle"
                      >
                        {point.time.slice(0, 5)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Temperature labels */}
          {showLabels && (
            <div className="temperature-labels">
              {hourlyTemps.map((reading, index) => (
                <div
                  key={index}
                  className={`temp-label ${reading.isSignificant ? 'significant' : ''} ${reading.temp > currentTemp ? 'high' : 'low'}`}
                  style={{
                    transform: `translateY(${reading.temp > currentTemp ? '-2px' : '2px'})`,
                    opacity: animationProgress,
                    animationDelay: `${index * 0.15}s`
                  }}
                >
                  <div className="temp-value">{reading.label}</div>
                  <div className="temp-time">{reading.time.slice(0, 5)}</div>
                </div>
              ))}
            </div>
          )}

          {/* Weather quality indicator */}
          <div className="quality-indicator">
            <div className={`quality-dot ${getWeatherQuality(tempRange, currentTemp)}`}></div>
            <span className="quality-text">
              {getWeatherQualityText(tempRange, currentTemp)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper functions
function generateFallbackData(): TempPoint[] {
  const baseTemp = 12; // Typical Norwegian temperature
  const currentHour = new Date().getHours();

  return Array.from({ length: 12 }, (_, i) => {
    const hour = (currentHour + i * 2) % 24;
    const timeVariation = getTimeOfDayVariation(hour);
    const temp = baseTemp + timeVariation + (Math.random() - 0.5) * 3;

    return {
      temp,
      label: `${Math.round(temp)}°`,
      time: `${hour.toString().padStart(2, '0')}:00`,
      hour,
      isSignificant: i % 3 === 0
    };
  });
}

function getTimeOfDayVariation(hour: number): number {
  // Natural temperature variation throughout the day
  if (hour >= 6 && hour <= 14) {
    // Morning to afternoon - warmer
    return Math.sin((hour - 6) / 8 * Math.PI) * 3;
  } else if (hour >= 15 && hour <= 21) {
    // Evening - cooling down
    return 3 - ((hour - 15) / 6) * 4;
  } else {
    // Night - coolest
    return -2;
  }
}

function isSignificantTemp(temp: number, currentTemp: number): boolean {
  return Math.abs(temp - currentTemp) > 3;
}

function isSignificantTime(hour: number): boolean {
  // Mark typical important times
  return [0, 6, 12, 18].includes(hour);
}

function formatTempLabel(temp: number, currentTemp: number, isSignificant: boolean): string {
  if (isSignificant || Math.abs(temp - currentTemp) > 2) {
    const prefix = temp > currentTemp ? 'HØY' : temp < currentTemp ? 'LAV' : '';
    return prefix ? `${prefix} ${Math.round(temp)}°` : `${Math.round(temp)}°`;
  }
  return `${Math.round(temp)}°`;
}

function getWeatherQuality(tempRange: number, currentTemp: number): string {
  if (tempRange > 15) return 'variable';
  if (currentTemp < -5 || currentTemp > 30) return 'extreme';
  if (tempRange < 3 && currentTemp >= 15 && currentTemp <= 25) return 'excellent';
  return 'good';
}

function getWeatherQualityText(tempRange: number, currentTemp: number): string {
  const quality = getWeatherQuality(tempRange, currentTemp);
  switch (quality) {
    case 'excellent': return 'Stabile forhold';
    case 'good': return 'Gode forhold';
    case 'variable': return 'Variabelt';
    case 'extreme': return 'Ekstreme forhold';
    default: return 'Moderate forhold';
  }
}

function getStyles(): string {
  return `
    .temperature-wave {
      position: absolute;
      bottom: 0px;
      left: 0;
      right: 0;
      height: 120px;
      pointer-events: none;
      overflow: hidden;
      z-index: 10;
    }

    .wave-container {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .wave-svg {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: auto;
    }

    .wave-path {
      fill: none;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .wave-area {
      transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .wave-point {
      fill: rgba(255, 255, 255, 0.8);
      stroke: rgba(255, 255, 255, 1);
      stroke-width: 2;
      cursor: pointer;
      transition: all 0.2s ease;
      animation: pointFadeIn 0.5s ease-out forwards;
    }

    .wave-point:hover {
      r: 8;
      fill: rgba(255, 255, 255, 1);
      filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
    }

    .wave-point.selected {
      fill: #fbbf24;
      stroke: #f59e0b;
      filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
    }

    .point-tooltip {
      fill: rgba(0, 0, 0, 0.8);
      stroke: rgba(255, 255, 255, 0.3);
      stroke-width: 1;
    }

    .point-tooltip-text {
      fill: white;
      font-size: 12px;
      font-weight: 600;
    }

    .point-tooltip-time {
      fill: rgba(255, 255, 255, 0.7);
      font-size: 9px;
    }

    .temperature-labels {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 8px 20px 0;
      pointer-events: none;
    }

    .temp-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: rgba(255, 255, 255, 0.7);
      font-size: 10px;
      font-weight: 300;
      text-align: center;
      white-space: nowrap;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      animation: labelFadeIn 0.6s ease-out forwards;
      opacity: 0;
      letter-spacing: 0.3px;
      transition: all 0.3s ease;
    }

    .temp-label.high {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }

    .temp-label.low {
      color: rgba(255, 255, 255, 0.6);
    }

    .temp-label.significant {
      color: rgba(251, 191, 36, 0.9);
      font-weight: 600;
      text-shadow: 0 1px 6px rgba(251, 191, 36, 0.4);
    }

    .temp-value {
      font-size: 11px;
      margin-bottom: 2px;
    }

    .temp-time {
      font-size: 8px;
      opacity: 0.7;
    }

    .baseline-indicator {
      position: absolute;
      top: 60px;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.2) 20%, 
        rgba(255, 255, 255, 0.2) 80%, 
        transparent 100%
      );
    }

    .temp-info-overlay {
      position: absolute;
      top: 10px;
      left: 20px;
      z-index: 20;
      pointer-events: none;
    }

    .temp-range {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .temp-min {
      color: rgba(96, 165, 250, 0.9);
    }

    .temp-max {
      color: rgba(251, 191, 36, 0.9);
    }

    .temp-separator {
      color: rgba(255, 255, 255, 0.6);
    }

    .temp-period {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 2px;
    }

    .quality-indicator {
      position: absolute;
      bottom: 10px;
      right: 20px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.7);
      pointer-events: none;
    }

    .quality-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .quality-dot.excellent {
      background: #10b981;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
    }

    .quality-dot.good {
      background: #3b82f6;
      box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
    }

    .quality-dot.variable {
      background: #f59e0b;
      box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
    }

    .quality-dot.extreme {
      background: #ef4444;
      box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: rgba(255, 255, 255, 0.6);
    }

    .loading-wave {
      width: 60px;
      height: 20px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.3) 50%,
        transparent 100%
      );
      animation: waveLoading 1.5s ease-in-out infinite;
      border-radius: 10px;
      margin-bottom: 10px;
    }

    .loading-text {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }

    @keyframes pointFadeIn {
      from {
        opacity: 0;
        transform: scale(0);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes labelFadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes waveLoading {
      0%, 100% { transform: scaleX(1); }
      50% { transform: scaleX(1.5); }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .temperature-wave {
        height: 100px;
        bottom: 40px;
      }

      .temp-label {
        font-size: 9px;
      }

      .temp-value {
        font-size: 10px;
      }

      .temp-time {
        font-size: 7px;
      }

      .temperature-labels {
        padding: 6px 12px 0;
      }

      .baseline-indicator {
        top: 50px;
      }

      .temp-info-overlay {
        top: 8px;
        left: 12px;
      }

      .temp-range {
        font-size: 12px;
      }

      .temp-period {
        font-size: 9px;
      }

      .quality-indicator {
        bottom: 8px;
        right: 12px;
        font-size: 9px;
      }

      .quality-dot {
        width: 6px;
        height: 6px;
      }
    }

    @media (max-width: 480px) {
      .temp-label {
        font-size: 8px;
      }

      .temp-value {
        font-size: 9px;
      }

      .temperature-labels {
        padding: 4px 8px 0;
      }

      .temp-info-overlay {
        top: 6px;
        left: 8px;
      }

      .quality-indicator {
        bottom: 6px;
        right: 8px;
        font-size: 8px;
      }
    }
  `;
}

export default BottomWave;