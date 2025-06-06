import React from 'react';
import { Thermometer, Cloud, Sun, Snowflake, CloudRain, Wind, CloudSnow } from 'lucide-react';

interface MetricCardProps {
  location: string;
  state: string;
  value: string;
  unit?: string;
  icon?: React.ReactNode;
  className?: string;
}

const MetricCard = ({ location, state, value, unit = "°", icon, className = "" }: MetricCardProps) => {
  return (
    <div className={`metric-card ${className}`}>
      <div className="metric-card-content">
        <div className="metric-card-location">
          <div className="metric-card-city">{location}</div>
          <div className="metric-card-state">({state})</div>
        </div>
        <div className="metric-card-right">
          <div className="metric-card-value">
            {value}
            <span className="metric-card-unit">{unit}</span>
          </div>
          {icon && (
            <div className="metric-card-icon">
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const MetricsPanel = () => {
  const cities = [
    { location: "Pennsylvania", state: "PA", value: "18", icon: <Cloud className="w-4 h-4" /> },
    { location: "Massachusetts", state: "MA", value: "24", icon: <Sun className="w-4 h-4" /> },
    { location: "New York", state: "NY", value: "27", icon: <Sun className="w-4 h-4" /> },
    { location: "North Carolina", state: "NC", value: "-2", icon: <Snowflake className="w-4 h-4" /> },
    { location: "California", state: "CA", value: "32", icon: <Sun className="w-4 h-4" /> },
    { location: "Florida", state: "FL", value: "29", icon: <CloudRain className="w-4 h-4" /> },
    { location: "Texas", state: "TX", value: "35", icon: <Sun className="w-4 h-4" /> },
    { location: "Washington", state: "WA", value: "12", icon: <CloudSnow className="w-4 h-4" /> },
    { location: "Colorado", state: "CO", value: "8", icon: <Snowflake className="w-4 h-4" /> },
    { location: "Illinois", state: "IL", value: "15", icon: <Wind className="w-4 h-4" /> },
  ];

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

        .metric-card:hover .metric-card-icon {
          background: rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.9);
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
            <div className="metrics-header-value">9.8%</div>
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
                state={city.state}
                value={city.value} 
                icon={city.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};