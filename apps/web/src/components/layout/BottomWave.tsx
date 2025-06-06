import React, { useState, useEffect } from 'react';

export const BottomWave = ({ currentTemp = 27 }: { currentTemp?: number }) => {
  const [hourlyTemps, setHourlyTemps] = useState([
    { temp: 23, label: "HIGH 23.0 °C" },
    { temp: 20, label: "HIGH 20 °C" },
    { temp: 18, label: "LOW 18 °C" },
    { temp: 15, label: "LOW 15 °C" },
    { temp: 10, label: "LOW 10 °C" },
    { temp: 4, label: "LOW 4 °C" },
    { temp: 14, label: "HIGH 14 °C" },
    { temp: 11, label: "HIGH 11 °C" },
    { temp: 19, label: "LOW 19 °C" },
    { temp: 24, label: "HIGH 24 °C" }
  ]);

  // Calculate wave height based on temperature difference from current temp
  const getWaveHeight = (temp: number): number => {
    const baseline = 60; // Center line moved to accommodate new height
    const maxVariation = 25; // More variation for waviness
    const tempDiff = temp - currentTemp;
    // Scale: each degree difference = 2 pixels for more dramatic waves
    const heightOffset = (tempDiff * 2);
    return Math.max(15, Math.min(105, baseline - heightOffset));
  };

  // Generate ultra-smooth wave path with cubic bezier curves
  const generateWavePath = (): string => {
    const width = 1920;
    const segmentWidth = width / (hourlyTemps.length - 1);
    
    const points = hourlyTemps.map((temp, i) => ({
      x: i * segmentWidth,
      y: getWaveHeight(temp.temp)
    }));

    if (points.length < 2) return '';

    let path = `M${points[0].x},${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      const prevPrev = points[i - 2];
      
      // Calculate smooth control points for cubic bezier
      const tension = 0.3;
      const cp1x = prev.x + (curr.x - (prevPrev?.x || prev.x - segmentWidth)) * tension;
      const cp1y = prev.y + (curr.y - (prevPrev?.y || prev.y)) * tension;
      
      const cp2x = curr.x - (((next?.x || curr.x + segmentWidth) - prev.x) * tension);
      const cp2y = curr.y - (((next?.y || curr.y) - prev.y) * tension);
      
      path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
    }
    
    return path;
  };

  // Auto-update temperatures every hour (simulated)
  useEffect(() => {
    const interval = setInterval(() => {
      setHourlyTemps(prev => {
        const newTemps = [...prev.slice(1)];
        const newTemp = Math.floor(Math.random() * 30) + 5; // Random temp between 5-35°C
        const isHigh = newTemp > currentTemp;
        newTemps.push({
          temp: newTemp,
          label: `${isHigh ? 'HIGH' : 'LOW'} ${newTemp} °C`
        });
        return newTemps;
      });
    }, 5000); // Update every 5 seconds for demo

    return () => clearInterval(interval);
  }, [currentTemp]);

  return (
    <>
      <style>{`
        .temperature-wave {
          position: absolute;
          bottom: 0px;
          left: 0;
          right: 0;
          height: 120px;
          pointer-events: none;
          overflow: hidden;
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
        }

        .wave-path {
          fill: none;
          stroke: rgba(255, 255, 255, 0.8);
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
          filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.3));
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .wave-area {
          fill: rgba(255, 255, 255, 0.04);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
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
        }

        .temp-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 11px;
          font-weight: 300;
          text-align: center;
          white-space: nowrap;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          animation: fadeInUp 0.5s ease;
          letter-spacing: 0.3px;
        }

        .temp-label.high {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 400;
        }

        .temp-label.low {
          color: rgba(255, 255, 255, 0.6);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        @media (max-width: 768px) {
          .temperature-wave {
            height: 100px;
            bottom: 40px;
          }

          .temp-label {
            font-size: 9px;
          }

          .temperature-labels {
            padding: 6px 12px 0;
          }

          .baseline-indicator {
            top: 50px;
          }
        }

        @media (max-width: 480px) {
          .temp-label {
            font-size: 8px;
          }

          .temperature-labels {
            padding: 4px 8px 0;
          }
        }
      `}</style>

      <div className="temperature-wave">
        <div className="wave-container">
          {/* Baseline indicator */}
          <div className="baseline-indicator"></div>
          
          {/* SVG Wave */}
          <svg className="wave-svg" viewBox="0 0 1920 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
              </linearGradient>
            </defs>
            
            {/* Wave area fill */}
            <path 
              className="wave-area"
              d={`${generateWavePath()} L1920,120 L0,120 Z`}
              fill="url(#waveGradient)"
            />
            
            {/* Wave line */}
            <path 
              className="wave-path"
              d={generateWavePath()}
            />
          </svg>

          {/* Temperature labels */}
          <div className="temperature-labels">
            {hourlyTemps.map((reading, index) => (
              <span 
                key={index} 
                className={`temp-label ${reading.temp > currentTemp ? 'high' : 'low'}`}
                style={{
                  transform: `translateY(${reading.temp > currentTemp ? '-2px' : '2px'})`
                }}
              >
                {reading.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};