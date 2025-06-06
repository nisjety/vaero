import React from 'react';

export const CityTemperatures = () => {
  const cities = [
    { name: "Washington D.C", temp: 12, isActive: false },
    { name: "Oklahoma City", temp: 17, isActive: true },
    { name: "Philadelphia", temp: 14, isActive: false },
  ];

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
        {cities.map((city) => (
          <div key={city.name} className="city-item">
            <div className="city-temp">
              {city.temp}°
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