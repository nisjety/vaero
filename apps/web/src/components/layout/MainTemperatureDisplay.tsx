import React, { useState } from 'react';

export const MainTemperatureDisplay = () => {
  const [temperature, setTemperature] = useState(27);

  const increaseTemp = () => {
    setTemperature(prev => prev + 1);
  };

  const decreaseTemp = () => {
    setTemperature(prev => prev - 1);
  };

  return (
    <>
      <style>{`
        /* =====================================================
           6. MAIN TEMPERATURE DISPLAY COMPONENT
           ===================================================== */
        .main-temp-display {
          text-align: right;
          color: white;
        }

        .main-temp-container {
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          gap: 1rem;
        }

        .main-temp-value {
          font-size: 10rem;
          font-weight: 300;
          line-height: 0.8;
          letter-spacing: -0.05em;
          text-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
          margin: 0;
        }

        @media (min-width: 1280px) {
          .main-temp-value {
            font-size: 12rem;
          }
        }

        @media (min-width: 1536px) {
          .main-temp-value {
            font-size: 14rem;
          }
        }

        .main-temp-controls {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 2rem;
        }

        .main-temp-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 2.5rem;
          font-weight: 300;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          width: 3.5rem;
          height: 3.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          user-select: none;
          position: relative;
        }

        .main-temp-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .main-temp-btn:active {
          transform: scale(0.95);
          background: rgba(255, 255, 255, 0.2);
        }

        .main-temp-btn:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 768px) {
          .main-temp-container {
            gap: 0.5rem;
          }
          
          .main-temp-controls {
            margin-top: 1rem;
          }
          
          .main-temp-btn {
            font-size: 2rem;
            width: 3rem;
            height: 3rem;
          }
        }

        .main-temp-wind {
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .main-temp-uv {
          font-size: 0.75rem;
          margin-top: 0.25rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .main-temp-location {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 0.25rem;
          color: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 640px) {
          .main-temp-wind {
            font-size: 0.75rem;
          }
          
          .main-temp-uv,
          .main-temp-location {
            font-size: 0.625rem;
          }
        }
      `}</style>
      
      <div className="main-temp-display">
        <div className="main-temp-container">
          <div className="main-temp-value">
            {temperature}°
          </div>
          <div className="main-temp-controls">
            <button 
              className="main-temp-btn"
              onClick={increaseTemp}
              aria-label="Increase temperature"
            >
              +
            </button>
            <button 
              className="main-temp-btn"
              onClick={decreaseTemp}
              aria-label="Decrease temperature"
            >
              −
            </button>
          </div>
        </div>
        <div className="main-temp-wind">
          Wind: WSW 6 MPH
        </div>
        <div className="main-temp-uv">
          UV INDEX: 0 OF 10
        </div>
        <div className="main-temp-location">
          New York City
        </div>
      </div>
    </>
  );
};