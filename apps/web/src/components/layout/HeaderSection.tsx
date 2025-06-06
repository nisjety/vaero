// Description: A React component that displays a header section with a logo, navigation links,
// current time, date, and user actions. The header is styled with CSS for a modern look and responsive design.
//
// The component also includes a day/night toggle button that changes its appearance based on the time of day, 
// it checks if the when the sun rises based on the sity and changes based on that data.
// The time is displayed in a large font, with the current date and day of the week below it.
// The header includes action buttons for refreshing, viewing clock, adding items, settings, user profile, grid view, and more options.
// 

import React from 'react';
import { RefreshCw, Clock, Plus, Settings, User, Grid3X3, MoreHorizontal, Sun, Moon } from "lucide-react";

interface HeaderSectionProps {
  currentTime: Date;
}

export const HeaderSection = ({ currentTime }: HeaderSectionProps) => {
  const timeString = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  const [time, period] = timeString.split(' ');
  const hour = currentTime.getHours();
  const isNightTime = hour >= 18 || hour <= 6;

  const currentDate = currentTime.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long'
  });

  const currentDay = currentTime.toLocaleDateString('en-US', {
    weekday: 'long'
  });

  return (
    <>
      <style>{`
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 32px;
          background: transparent;
          height: 72px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .logo-nav-group {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-logo-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-logo {
          width: 28px;
          height: 28px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
          font-size: 14px;
          backdrop-filter: blur(10px);
        }

        .header-brand {
          color: white;
          font-weight: 400;
          font-size: 15px;
          opacity: 0.9;
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .nav-item {
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
          font-weight: 400;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .nav-item.active {
          color: white;
          font-weight: 500;
        }

        .nav-item:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        .header-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .time-main {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .time-value {
          font-size: 42px;
          font-weight: 300;
          color: white;
          line-height: 1;
        }

        .time-period-container {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .time-period {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 400;
        }

        .time-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: center;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .right-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.9);
        }

        .date-section {
          display: none;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 12px;
        }

        .user-name {
          color: white;
          font-size: 13px;
          font-weight: 400;
          opacity: 0.9;
        }

        .final-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .day-night-toggle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .day-night-toggle:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          transform: translateY(-1px);
        }

        .day-night-toggle.night {
          background: rgba(147, 197, 253, 0.2);
          color: #93c5fd;
        }

        .day-night-toggle.day {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
        }

        @media (max-width: 1200px) {
          .header-section {
            padding: 12px 20px;
          }
          
          .header-left {
            gap: 16px;
          }
          
          .logo-nav-group {
            gap: 16px;
          }
        }

        @media (max-width: 768px) {
          .header-nav {
            display: none;
          }
          
          .time-value {
            font-size: 32px;
          }
          
          .action-btn {
            width: 28px;
            height: 28px;
          }
          
          .final-actions {
            gap: 4px;
          }

          .day-night-toggle {
            width: 20px;
            height: 20px;
          }

          .time-period {
            font-size: 10px;
          }

          .time-main {
            gap: 6px;
          }
        }
      `}</style>
      
      <header className="header-section">
        {/* Left Side - Logo and Navigation */}
        <div className="header-left">
          <div className="logo-nav-group">
            <div className="header-logo-section">
              <div className="header-logo">C</div>
              <div className="header-brand">Weather Forecast</div>
            </div>
            
            <nav className="header-nav">
              <a href="#" className="nav-item active">Home</a>
              <a href="#" className="nav-item">Application</a>
            </nav>
          </div>
        </div>

        {/* Center - Time Display */}
        <div className="header-center">
          <div className="time-main">
            <span className="time-value">{time}</span>
            <div className="time-period-container">
              <span className="time-period">{period}</span>
              <button className={`day-night-toggle ${isNightTime ? 'night' : 'day'}`}>
                {isNightTime ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <span className="time-label">Today - {currentDay}, {currentDate}</span>
        </div>

        {/* Right Side - Actions, User, More Actions */}
        <div className="header-right">
          <div className="right-actions">
            <button className="action-btn">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button className="action-btn">
              <Clock className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="user-section">
            <div className="user-avatar">C</div>
            <span className="user-name">Christina</span>
          </div>
          
          <div className="final-actions">
            <button className="action-btn">
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button className="action-btn">
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button className="action-btn">
              <User className="w-3.5 h-3.5" />
            </button>
            <button className="action-btn">
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button className="action-btn">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};