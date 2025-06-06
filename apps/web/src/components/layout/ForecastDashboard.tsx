// Description: A React Component that displays a forecast dashboard with a circular chart, 
// temperature information, a slider, and friends' avatars to illustrate the friend's weather data.
// The circular chart shows the current Pollenvarsel and luftforurensning,
// while the slider shows users Lite eller ingen risiko for helseeffekter.
// The temperature section displays the current UV-varsel and its status.
// The friends' avatars are displayed in a row, indicating the number of friends currently in the weather city.
// The component is styled with CSS for a modern look and responsive design.

import React, { useState } from 'react';
import { useCurrentWeather } from '../../hooks/api';

export const ForecastDashboard = () => {
  const [sliderValue, setSliderValue] = useState(65);
  
  // Get current weather data - using Oslo as default
  const { data: weather, isLoading, error } = useCurrentWeather(59.9139, 10.7522);
  
  const friends = [
    { id: 1, avatar: "👨‍💼", name: "Erik" },
    { id: 2, avatar: "👩‍💻", name: "Astrid" },
    { id: 3, avatar: "👨‍🎨", name: "Magnus" },
    { id: 4, avatar: "👩‍🔬", name: "Ingrid" }
  ];

  // Calculate air quality and pollen levels (simulated for now)
  const getAirQualityLevel = () => {
    if (!weather) return { level: 2, text: "Moderat" };
    
    // Simple simulation based on temperature and wind
    const temp = weather.temperature;
    const wind = weather.wind_speed;
    
    if (temp > 20 && wind < 3) return { level: 3, text: "Dårlig" };
    if (temp > 10 && wind < 5) return { level: 2, text: "Moderat" };
    return { level: 1, text: "God" };
  };

  // Calculate UV risk level
  const getUVRisk = () => {
    if (!weather) return { risk: 2, description: "Moderat risiko" };
    
    // Simple UV simulation based on time and temperature
    const temp = weather.temperature;
    const hour = new Date().getHours();
    
    if (temp > 15 && hour >= 11 && hour <= 15) return { risk: 3, description: "Høy risiko" };
    if (temp > 5 && hour >= 10 && hour <= 16) return { risk: 2, description: "Moderat risiko" };
    return { risk: 1, description: "Lav risiko" };
  };

  const airQuality = getAirQualityLevel();
  const uvRisk = getUVRisk();

  // Calculate risk percentage for slider
  const getRiskPercentage = () => {
    const baseRisk = uvRisk.risk * 20; // 1-3 * 20 = 20-60
    const tempFactor = weather ? Math.max(0, (weather.temperature - 5) * 2) : 0;
    return Math.min(90, Math.max(10, baseRisk + tempFactor));
  };

  React.useEffect(() => {
    if (weather) {
      setSliderValue(getRiskPercentage());
    }
  }, [weather]);

  return (
    <>
      <style>{`
        .forecast-dashboard {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          gap: 24px;
          transition: all 0.3s ease;
        }

        .forecast-dashboard:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-2px);
        }

        .chart-container {
          position: relative;
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }

        .chart-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: conic-gradient(
            from 180deg,
            #8b5cf6 0deg,
            #a855f7 120deg,
            #fbbf24 240deg,
            #10b981 360deg
          );
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .chart-inner {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .chart-plus {
          position: absolute;
          bottom: -8px;
          left: -8px;
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .chart-plus:hover {
          background: white;
          transform: scale(1.1);
        }

        .forecast-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .temp-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .temp-value {
          font-size: 24px;
          font-weight: 300;
          color: white;
          line-height: 1;
        }

        .temp-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .temp-label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
          font-weight: 400;
        }

        .temp-percentage {
          color: rgba(255, 255, 255, 0.6);
          font-size: 11px;
        }

        .slider-container {
          width: 100%;
          position: relative;
        }

        .slider {
          width: 100%;
          height: 6px;
          background: linear-gradient(90deg, 
            #06b6d4 0%, 
            #10b981 25%, 
            #fbbf24 50%, 
            #f59e0b 75%, 
            #ef4444 100%
          );
          border-radius: 3px;
          position: relative;
          cursor: pointer;
        }

        .slider-thumb {
          position: absolute;
          top: 50%;
          left: ${sliderValue}%;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slider-thumb:hover {
          transform: translate(-50%, -50%) scale(1.2);
        }

        .friends-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .friends-avatars {
          display: flex;
          align-items: center;
        }

        .friend-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          margin-left: -4px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .friend-avatar:first-child {
          margin-left: 0;
        }

        .friend-avatar:hover {
          transform: scale(1.1);
          z-index: 10;
          border-color: rgba(255, 255, 255, 0.5);
        }

        .friends-text {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          font-weight: 300;
          margin-left: 8px;
        }

        @media (max-width: 768px) {
          .forecast-dashboard {
            flex-direction: column;
            gap: 16px;
            padding: 20px;
          }

          .chart-container {
            width: 70px;
            height: 70px;
          }

          .chart-circle {
            width: 70px;
            height: 70px;
          }

          .chart-inner {
            width: 45px;
            height: 45px;
            font-size: 12px;
          }

          .temp-value {
            font-size: 20px;
          }

          .friends-section {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .forecast-dashboard {
            padding: 16px;
          }

          .chart-container {
            width: 60px;
            height: 60px;
          }

          .chart-circle {
            width: 60px;
            height: 60px;
          }

          .chart-inner {
            width: 40px;
            height: 40px;
            font-size: 11px;
          }

          .friend-avatar {
            width: 24px;
            height: 24px;
            font-size: 10px;
          }
        }
      `}</style>
      
      <div className="forecast-dashboard">
        {/* Circular Chart */}
        <div className="chart-container">
          <div className="chart-circle">
            <div className="chart-inner">
              {isLoading ? "--" : error ? "!" : `${Math.round(weather?.temperature || 0)}°`}
            </div>
          </div>
          <div className="chart-plus">+</div>
        </div>

        {/* Forecast Information */}
        <div className="forecast-info">
          {/* Temperature Section */}
          <div className="temp-section">
            <div className="temp-value">
              {isLoading ? "--°" : error ? "Feil" : `${Math.round(weather?.temperature || 0)}°`}
            </div>
            <div className="temp-status">
              <span className="temp-label">{uvRisk.description}</span>
              <span className="temp-percentage">{airQuality.text} luftkvalitet</span>
            </div>
          </div>

          {/* Slider */}
          <div className="slider-container">
            <div className="slider">
              <div className="slider-thumb"></div>
            </div>
          </div>

          {/* Friends Section */}
          <div className="friends-section">
            <div className="friends-avatars">
              {friends.map((friend) => (
                <div key={friend.id} className="friend-avatar">
                  {friend.avatar}
                </div>
              ))}
            </div>
            <span className="friends-text">+ Venner i Oslo</span>
          </div>
        </div>
      </div>
    </>
  );
};