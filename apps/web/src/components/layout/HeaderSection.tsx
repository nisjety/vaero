// Description: Væro weather app header with Norwegian localization, Clerk authentication,
// YR astronomical data for accurate sun/moon toggle, and Norwegian time/date formatting.

import React from 'react';
import Link from 'next/link';
import { RefreshCw, Clock, Plus, Settings, User, Grid3X3, MoreHorizontal, Sun, Moon, LogIn, LogOut } from "lucide-react";
import { useUser, useClerk, SignInButton } from '@clerk/nextjs';
import { useAstronomicalData } from '../../hooks/api';

interface HeaderSectionProps {
  currentTime: Date;
  lat?: number;
  lon?: number;
}

export const HeaderSection = ({ currentTime, lat = 59.9139, lon = 10.7522 }: HeaderSectionProps) => {
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut } = useClerk();
  const { data: astroData } = useAstronomicalData(lat, lon);

  // Norwegian time formatting (24-hour format)
  const timeString = currentTime.toLocaleTimeString('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  // Norwegian date formatting
  const currentDate = currentTime.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long'
  });

  const currentDay = currentTime.toLocaleDateString('nb-NO', {
    weekday: 'long'
  });

  // Determine day/night based on actual sunrise/sunset data
  const isNightTime = React.useMemo(() => {
    if (!astroData?.astronomical?.sun) {
      // Fallback to simple hour check if no astronomical data
      const hour = currentTime.getHours();
      return hour >= 20 || hour <= 6;
    }

    const now = currentTime.getTime();
    const sunrise = new Date(astroData.astronomical.sun.sunrise).getTime();
    const sunset = new Date(astroData.astronomical.sun.sunset).getTime();

    return now < sunrise || now > sunset;
  }, [currentTime, astroData]);

  // Get user initials for avatar fallback
  const _getUserInitials = () => {
    if (!user) return 'G'; // Guest
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase() || 'U';
  };

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

        .auth-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .auth-button:hover {
          background: rgba(255, 255, 255, 0.12);
          color: white;
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .auth-button.sign-out:hover {
          background: rgba(255, 107, 107, 0.1);
          color: #ff6b6b;
          border-color: rgba(255, 107, 107, 0.2);
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 8px;
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
              <div className="header-logo">V</div>
              <div className="header-brand">Væro</div>
            </div>

            <nav className="header-nav">
              <Link href="/" className="nav-item active">Hjem</Link>
              <Link href="/dashboard" className="nav-item">Dashboard</Link>
              <Link href="/about" className="nav-item">Om</Link>
            </nav>
          </div>
        </div>

        {/* Center - Time Display */}
        <div className="header-center">
          <div className="time-main">
            <span className="time-value">{timeString}</span>
            <div className="time-period-container">
              <button className={`day-night-toggle ${isNightTime ? 'night' : 'day'}`}>
                {isNightTime ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <span className="time-label">I dag - {currentDay}, {currentDate}</span>
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
            {userLoaded && user ? (
              // User is signed in - show user name and sign out button
              <>
                <span className="user-name">
                  {user.firstName || user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Bruker'}
                </span>
                <button
                  className="auth-button sign-out"
                  onClick={() => signOut()}
                  title="Logg ut"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logg ut</span>
                </button>
              </>
            ) : (
              // User is not signed in - show sign in button
              <SignInButton mode="modal">
                <button className="auth-button" title="Logg inn">
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Logg inn</span>
                </button>
              </SignInButton>
            )}
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