import React from 'react';

export const WeatherDescription = () => {
  return (
    <>
      <style>{`
        .weather-description {
          margin-bottom: 3rem;
        }

        .weather-title-container {
          margin-bottom: 2rem;
        }

        .weather-main-title {
          font-size: 4.5rem;
          font-weight: 400;
          line-height: 0.9;
          color: white;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .weather-subtitle {
          font-size: 2.25rem;
          font-weight: 300;
          line-height: 1.1;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: -0.01em;
        }

        .weather-description-text {
          color: rgba(255, 255, 255, 0.75);
          font-size: 0.95rem;
          line-height: 1.6;
          max-width: 24rem;
          font-weight: 300;
          letter-spacing: 0.01em;
        }

        @media (min-width: 1024px) {
          .weather-main-title {
            font-size: 5.5rem;
          }

          .weather-subtitle {
            font-size: 2.75rem;
          }

          .weather-description-text {
            font-size: 1rem;
            max-width: 26rem;
          }
        }

        @media (min-width: 1280px) {
          .weather-main-title {
            font-size: 6rem;
          }

          .weather-subtitle {
            font-size: 3rem;
          }
        }

        @media (max-width: 640px) {
          .weather-main-title {
            font-size: 3.5rem;
          }

          .weather-subtitle {
            font-size: 1.75rem;
          }

          .weather-description-text {
            font-size: 0.875rem;
            max-width: 20rem;
          }

          .weather-description {
            margin-bottom: 2rem;
          }

          .weather-title-container {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
      
      <div className="weather-description">
        <div className="weather-title-container">
          <h1 className="weather-main-title">
            Stormy
          </h1>
          <h2 className="weather-subtitle">
            with Heavy Rain
          </h2>
        </div>
        
        <p className="weather-description-text">
          Variable clouds with snow showers. High 11°F. 
          Winds E at 10 to 20 mph. Chance of snow 50%. 
          Snow accumulations less than one inch.
        </p>
      </div>
    </>
  );
};