import React, { useState } from 'react';
import Image from 'next/image';
import { useCurrentWeather, useUVData, useAstronomicalData, useAirQuality, usePollenData } from '../../hooks/api';
import { useUser } from '@clerk/nextjs';
import { Sun, Moon, Users, Plus, Star, Eye, Shield, AlertTriangle, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

// Norwegian utility functions
const formatTimeNorwegian = (timeString: string | null | undefined): string => {
  if (!timeString) return '--:--';
  const date = new Date(timeString);
  return date.toLocaleTimeString('nb-NO', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Europe/Oslo'
  });
};

const getMoonPhaseNorwegian = (phase: string): string => {
  const phases: Record<string, string> = {
    'new': 'Nymåne',
    'waxing_crescent': 'Tiltagende månesigd',
    'first_quarter': 'Første kvart',
    'waxing_gibbous': 'Tiltagende måne',
    'full': 'Fullmåne',
    'waning_gibbous': 'Avtagende måne',
    'last_quarter': 'Siste kvart',
    'waning_crescent': 'Avtagende månesigd'
  };
  return phases[phase] || phase;
};

const getUVRiskNorwegian = (uvIndex: number) => {
  if (uvIndex <= 2) return { 
    level: 'Lav', 
    color: '#10b981', 
    description: 'Lav risiko',
    warning: null,
    advice: 'Ingen beskyttelse nødvendig'
  };
  if (uvIndex <= 5) return { 
    level: 'Moderat', 
    color: '#f59e0b', 
    description: 'Moderat risiko',
    warning: null,
    advice: 'Bruk solkrem og solbriller'
  };
  if (uvIndex <= 7) return { 
    level: 'Høy', 
    color: '#ef4444', 
    description: 'Høy risiko',
    warning: 'Advarsel: Høy UV-stråling',
    advice: 'Bruk solkrem SPF 30+, hatt og solbriller'
  };
  if (uvIndex <= 10) return { 
    level: 'Svært høy', 
    color: '#dc2626', 
    description: 'Svært høy risiko',
    warning: 'Advarsel: Svært høy UV-stråling',
    advice: 'Unngå sol mellom 10-16. Bruk høy solkrem og dekke til'
  };
  return { 
    level: 'Ekstrem', 
    color: '#7c2d12', 
    description: 'Ekstrem risiko',
    warning: 'FAREVARSEL: Ekstrem UV-stråling',
    advice: 'Unngå all sol. Bruk maksimal beskyttelse'
  };
};

// Helper function to get air quality color based on level
const getAirQualityColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'god':
    case 'lav':
    case 'low':
      return '#10b981';
    case 'moderat':
    case 'moderate':
      return '#f59e0b';
    case 'usunne for sensitive':
    case 'unhealthy for sensitive groups':
    case 'høy':
    case 'high':
      return '#ef4444';
    case 'usunne':
    case 'unhealthy':
    case 'meget høy':
    case 'very high':
      return '#dc2626';
    case 'farlig':
    case 'hazardous':
    case 'ekstrem':
    case 'extreme':
      return '#7c2d12';
    default:
      return '#6b7280';
  }
};

const getPollenLevelNorwegian = (level: number) => {
  if (level <= 1) return { level: 'Lavt', color: '#10b981' };
  if (level <= 3) return { level: 'Moderat', color: '#f59e0b' };
  if (level <= 5) return { level: 'Høyt', color: '#ef4444' };
  return { level: 'Svært høyt', color: '#dc2626' };
};

const forecastDashboardStyles = `
  .forecast-dashboard {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 15px;
    color: white;
    height: 170px;
    box-sizing: border-box;
  }

  .dashboard-content {
    position: relative;
    display: flex;
    align-items: stretch;
    gap: 15px;
    height: 100%;
    width: 100%;
  }

  .card-container {
    flex: 1;
    display: flex;
    justify-content: center;
    height: 100%;
    min-width: 0;
    overflow: hidden;
  }

  .info-card {
    width: 100%;
    max-width: 900px;
    min-width: 300px;
    height: 100%;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    transition: all 0.3s ease;
    transform: translateX(0);
    opacity: 1;
  }

  .info-card.slide-in-right {
    animation: slideInRight 0.3s ease-out;
  }

  .info-card.slide-in-left {
    animation: slideInLeft 0.3s ease-out;
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInLeft {
    from {
      transform: translateX(-100px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .nav-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    backdrop-filter: blur(10px);
  }

  .nav-button:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .nav-button.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    height: 24px;
    flex-shrink: 0;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    font-weight: 600;
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .plus-button {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 12px;
  }

  .plus-button:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.05);
  }

  .current-time {
    color: #f59e0b;
    font-size: 12px;
    font-weight: 600;
  }

  /* User Card Styles */
  .user-card-content {
    flex: 1;
    display: flex;
    gap: 16px;
    height: calc(100% - 32px);
    min-height: 0;
    overflow: hidden;
  }

  .user-profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 70px;
    flex-shrink: 0;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .user-avatar-initials {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 14px;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .user-name {
    color: white;
    font-size: 10px;
    font-weight: 500;
    text-align: center;
    max-width: 70px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .friends-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 0;
    overflow: hidden;
  }

  .location-info {
    display: flex;
    align-items: center;
    gap: 4px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 10px;
    flex-shrink: 0;
  }

  .friends-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(55px, 1fr));
    gap: 6px;
    height: 100%;
    overflow: hidden;
    flex: 1;
  }

  .friend-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 4px 3px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    transition: all 0.2s ease;
    cursor: pointer;
    height: fit-content;
    max-height: 100%;
    box-sizing: border-box;
  }

  .friend-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  .friend-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 9px;
    font-weight: 600;
  }

  .friend-name {
    color: white;
    font-size: 9px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  /* Solar Card Styles */
  .solar-content {
    flex: 1;
    display: flex;
    gap: 16px;
    height: calc(100% - 32px);
    min-height: 0;
    overflow: hidden;
  }

  .sun-path-mini {
    flex: 1;
    position: relative;
    height: 100%;
    min-width: 160px;
  }

  .sun-path-arc-mini {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 60px;
    border: 2px dashed rgba(245, 158, 11, 0.4);
    border-bottom: none;
    border-radius: 60px 60px 0 0;
  }

  .sun-icon-mini {
    position: absolute;
    width: 16px;
    height: 16px;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 9px;
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 2;
    will-change: transform;
  }

  .horizon-line-mini {
    position: absolute;
    bottom: 16px;
    left: 20%;
    right: 20%;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
  }

  .time-markers-mini {
    position: absolute;
    bottom: 2px;
    left: 12px;
    right: 12px;
    display: flex;
    justify-content: space-between;
    padding: 0 6px;
  }

  .time-marker-mini {
    color: rgba(255, 255, 255, 0.5);
    font-size: 8px;
  }

  .solar-data-compact {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 100px;
    justify-content: center;
    flex-shrink: 0;
  }

  .solar-item-mini {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    padding: 1px 0;
  }

  .solar-label-mini {
    color: rgba(255, 255, 255, 0.7);
  }

  .solar-value-mini {
    color: white;
    font-weight: 500;
  }

  .solar-value-mini.highlight {
    color: #f59e0b;
  }

  .time-control-mini {
    position: absolute;
    bottom: 18px;
    left: 25px;
    right: 25px;
  }

  .time-slider-mini {
    width: 100%;
    height: 3px;
    border-radius: 2px;
    background: linear-gradient(90deg, #1e3a8a 0%, #3b82f6 25%, #f59e0b 50%, #dc2626 75%, #1e3a8a 100%);
    outline: none;
    cursor: pointer;
    appearance: none;
  }

  .time-slider-mini::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    border: 2px solid #f59e0b;
  }

  .time-slider-mini::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    border: 2px solid #f59e0b;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  }

  .elevation-display-mini {
    position: absolute;
    top: 6px;
    right: 6px;
    color: #f59e0b;
    font-size: 10px;
    font-weight: 600;
    background: rgba(0, 0, 0, 0.4);
    padding: 2px 6px;
    border-radius: 6px;
    backdrop-filter: blur(10px);
  }

  /* Moon Card Styles */
  .moon-content {
    flex: 1;
    display: flex;
    gap: 16px;
    height: calc(100% - 32px);
    min-height: 0;
    overflow: hidden;
  }

  .moon-visual {
    flex: 1;
    position: relative;
    height: 100%;
    min-width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .moon-phase-display {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%);
    position: relative;
    overflow: hidden;
    box-shadow: 0 3px 15px rgba(156, 163, 175, 0.3);
  }

  .moon-shadow {
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 100%;
    background: #1f2937;
    border-radius: 0 50% 50% 0;
    transition: all 0.3s ease;
  }

  .moon-data-compact {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 100px;
    justify-content: center;
    flex-shrink: 0;
  }

  .moon-item-mini {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    padding: 1px 0;
  }

  .moon-label-mini {
    color: rgba(255, 255, 255, 0.7);
  }

  .moon-value-mini {
    color: white;
    font-weight: 500;
  }

  .moon-value-mini.highlight {
    color: #e5e7eb;
  }

  /* UV Card Styles */
  .uv-content {
    flex: 1;
    display: flex;
    gap: 16px;
    height: calc(100% - 32px);
    min-height: 0;
    overflow: hidden;
  }

  .uv-gauge {
    flex: 1;
    position: relative;
    height: 100%;
    min-width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .uv-meter {
    width: 80px;
    height: 40px;
    position: relative;
  }

  .uv-arc {
    width: 80px;
    height: 40px;
    border: 5px solid transparent;
    border-bottom: none;
    border-radius: 40px 40px 0 0;
    background: linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: exclude;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
  }

  .uv-needle {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 2px;
    height: 28px;
    background: white;
    transform-origin: bottom center;
    transform: translateX(-50%) rotate(-45deg);
    transition: transform 0.3s ease;
  }

  .uv-value-display {
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 14px;
    font-weight: 700;
  }

  .uv-data-compact {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 100px;
    justify-content: center;
    flex-shrink: 0;
  }

  .uv-item-mini {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    padding: 1px 0;
  }

  .uv-label-mini {
    color: rgba(255, 255, 255, 0.7);
  }

  .uv-value-mini {
    color: white;
    font-weight: 500;
  }

  .uv-warning-mini {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 4px;
    padding: 3px 4px;
    margin-top: 2px;
    color: #fecaca;
    font-size: 8px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 2px;
  }

  /* Air Quality Card Styles */
  .air-quality-content {
    flex: 1;
    display: flex;
    gap: 16px;
    height: calc(100% - 32px);
    min-height: 0;
    overflow: hidden;
  }

  .air-quality-visual {
    flex: 1;
    position: relative;
    height: 100%;
    min-width: 130px;
  }

  .aqi-display-mini {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .aqi-value-large {
    font-size: 18px;
    font-weight: 700;
  }

  .aqi-level-text {
    font-size: 11px;
    font-weight: 500;
  }

  .pollutants-mini {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 3px;
    height: calc(100% - 30px);
    overflow: hidden;
  }

  .pollutant-bar {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 2px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
    min-height: 0;
  }

  .pollutant-label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 7px;
    text-align: center;
  }

  .pollutant-bar-visual {
    height: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
  }

  .pollutant-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .pollutant-value {
    color: white;
    font-size: 6px;
    text-align: center;
    margin-top: 1px;
  }

  .air-quality-data-compact {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 100px;
    justify-content: center;
    flex-shrink: 0;
  }

  /* Pollen Card Styles */
  .pollen-content {
    flex: 1;
    display: flex;
    gap: 16px;
    height: calc(100% - 32px);
    min-height: 0;
    overflow: hidden;
  }

  .pollen-visual {
    flex: 1;
    position: relative;
    height: 100%;
    min-width: 130px;
  }

  .pollen-level-display {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .pollen-value-large {
    font-size: 18px;
    font-weight: 700;
  }

  .pollen-level-text {
    font-size: 11px;
    font-weight: 500;
  }

  .pollen-types-mini {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3px;
    height: calc(100% - 30px);
    overflow: hidden;
  }

  .pollen-type-item-mini {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    padding: 2px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
    justify-content: center;
    min-height: 0;
  }

  .pollen-type-name-mini {
    color: rgba(255, 255, 255, 0.7);
    font-size: 7px;
    text-align: center;
  }

  .pollen-type-level-mini {
    color: white;
    font-size: 8px;
    font-weight: 500;
  }

  .pollen-data-compact {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 100px;
    justify-content: center;
    flex-shrink: 0;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
  }

  .modal {
    background: rgba(30, 30, 30, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    width: 90%;
    max-width: 400px;
    color: white;
    animation: modalSlideIn 0.3s ease-out;
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .modal-title {
    color: white;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }

  .form-group label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    font-weight: 500;
  }

  .form-group input {
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 14px;
  }

  .form-group input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
  }

  .form-group input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .modal-actions button {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
  }

  .modal-actions button[type="button"] {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
  }

  .modal-actions button[type="button"]:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .modal-actions button[type="submit"] {
    background: #3b82f6;
    color: white;
  }

  .modal-actions button[type="submit"]:hover:not(:disabled) {
    background: #2563eb;
  }

  .modal-actions button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .loading-placeholder {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    animation: pulse 2s infinite;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 16px;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .card-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
  }

  .indicator-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .indicator-dot.active {
    background: white;
    transform: scale(1.3);
  }

  /* Responsive Design */
  @media (max-width: 1000px) {
    .forecast-dashboard {
      max-width: 100%;
      padding: 12px;
    }
    
    .info-card {
      max-width: 800px;
      min-width: 280px;
    }
    
    .dashboard-content {
      gap: 12px;
    }
    
    .nav-button {
      width: 36px;
      height: 36px;
    }
  }

  @media (max-width: 800px) {
    .forecast-dashboard {
      padding: 10px;
    }
    
    .dashboard-content {
      gap: 10px;
    }
    
    .info-card {
      max-width: 700px;
      min-width: 260px;
      padding: 14px;
    }
    
    .nav-button {
      width: 32px;
      height: 32px;
    }
    
    .card-title {
      font-size: 13px;
    }
    
    .user-card-content, .solar-content, .moon-content, .uv-content, .air-quality-content, .pollen-content {
      gap: 12px;
    }
    
    .friends-grid {
      grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    }
    
    .sun-path-mini, .moon-visual, .uv-gauge, .air-quality-visual, .pollen-visual {
      min-width: 120px;
    }
    
    .solar-data-compact, .moon-data-compact, .uv-data-compact, .air-quality-data-compact, .pollen-data-compact {
      min-width: 90px;
    }
  }

  @media (max-width: 600px) {
    .forecast-dashboard {
      padding: 8px;
    }
    
    .dashboard-content {
      gap: 8px;
    }
    
    .info-card {
      max-width: 500px;
      min-width: 240px;
      padding: 12px;
    }
    
    .nav-button {
      width: 28px;
      height: 28px;
    }
    
    .card-header {
      margin-bottom: 6px;
    }
    
    .user-card-content, .solar-content, .moon-content, .uv-content, .air-quality-content, .pollen-content {
      gap: 10px;
    }
    
    .friends-grid {
      grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
      gap: 4px;
    }
    
    .friend-item {
      padding: 3px;
    }
    
    .sun-path-mini, .moon-visual, .uv-gauge, .air-quality-visual, .pollen-visual {
      min-width: 100px;
    }
    
    .solar-data-compact, .moon-data-compact, .uv-data-compact, .air-quality-data-compact, .pollen-data-compact {
      min-width: 80px;
    }
  }

  @media (max-width: 480px) {
    .forecast-dashboard {
      padding: 6px;
    }
    
    .dashboard-content {
      gap: 6px;
    }
    
    .info-card {
      max-width: 400px;
      min-width: 220px;
      padding: 10px;
    }
    
    .nav-button {
      width: 24px;
      height: 24px;
    }
    
    .card-title {
      font-size: 12px;
    }
    
    .user-card-content, .solar-content, .moon-content, .uv-content, .air-quality-content, .pollen-content {
      gap: 8px;
    }
    
    .friends-grid {
      grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
      gap: 3px;
    }
    
    .sun-path-mini, .moon-visual, .uv-gauge, .air-quality-visual, .pollen-visual {
      min-width: 90px;
    }
    
    .solar-data-compact, .moon-data-compact, .uv-data-compact, .air-quality-data-compact, .pollen-data-compact {
      min-width: 70px;
    }
  }
`;

export const ForecastDashboard = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedHour, setSelectedHour] = useState(12);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const { user } = useUser();
  
  const { isLoading } = useCurrentWeather(59.9139, 10.7522);
  const { data: uvData } = useUVData(59.9139, 10.7522);
  const { data: astroData } = useAstronomicalData(59.9139, 10.7522);
  const { data: airQuality } = useAirQuality(59.9139, 10.7522);
  const { data: pollenData } = usePollenData(59.9139, 10.7522);

  // Mock friends data
  const mockFriends = [
    { id: 1, name: 'Anna', initials: 'AN', city: 'Oslo, Norge' },
    { id: 2, name: 'Erik', initials: 'ER', city: 'Oslo, Norge' },
    { id: 3, name: 'Maja', initials: 'MA', city: 'Oslo, Norge' },
    { id: 4, name: 'Ole', initials: 'OL', city: 'Oslo, Norge' },
    { id: 5, name: 'Sara', initials: 'SA', city: 'Bergen, Norge' },
    { id: 6, name: 'Lars', initials: 'LA', city: 'Oslo, Norge' }
  ];

  const friendsInCity = mockFriends.filter(friend => friend.city === 'Oslo, Norge');

  // Define precise arc path positions that match the CSS arc exactly
  // These positions correspond to the visual arc: 120px wide, 60px high, centered
  const arcPathPositions = [
    // Sunrise (left edge of arc)
    { x: 25, y: 13 },   // 0% progress
    { x: 30, y: 20 },   // 10% progress
    { x: 35, y: 28 },   // 20% progress
    { x: 40, y: 36 },   // 30% progress
    { x: 45, y: 43 },   // 40% progress
    { x: 50, y: 50 },   // 50% progress - Solar noon (top of arc)
    { x: 55, y: 43 },   // 60% progress
    { x: 60, y: 36 },   // 70% progress
    { x: 65, y: 28 },   // 80% progress
    { x: 70, y: 20 },   // 90% progress
    { x: 75, y: 13 }    // 100% progress - Sunset (right edge of arc)
  ];

  // Calculate sun position by interpolating between predefined arc positions
  const calculateSunPosition = (hour: number) => {
    // Use actual sunrise/sunset times if available, otherwise fallback to defaults
    const sunriseHour = astroData?.sun?.sunrise ? 
      new Date(astroData.sun.sunrise).getHours() + new Date(astroData.sun.sunrise).getMinutes()/60 : 6;
    const sunsetHour = astroData?.sun?.sunset ? 
      new Date(astroData.sun.sunset).getHours() + new Date(astroData.sun.sunset).getMinutes()/60 : 20;
    
    const dayLength = sunsetHour - sunriseHour;
    
    if (hour < sunriseHour || hour > sunsetHour) {
      return { x: 50, y: 100, elevation: 0, isVisible: false };
    }
    
    // Calculate progress from 0 (sunrise) to 1 (sunset)
    const progress = (hour - sunriseHour) / dayLength;
    
    // Find the exact position along the predefined arc path
    const exactIndex = progress * (arcPathPositions.length - 1);
    const lowerIndex = Math.floor(exactIndex);
    const upperIndex = Math.min(lowerIndex + 1, arcPathPositions.length - 1);
    const interpolationFactor = exactIndex - lowerIndex;
    
    // Interpolate between the two nearest arc positions for smooth movement
    const lowerPos = arcPathPositions[lowerIndex];
    const upperPos = arcPathPositions[upperIndex];
    
    const x = lowerPos.x + (upperPos.x - lowerPos.x) * interpolationFactor;
    const y = lowerPos.y + (upperPos.y - lowerPos.y) * interpolationFactor;
    
    // Calculate realistic elevation based on arc position
    const maxElevation = 65;
    const elevationProgress = Math.sin(Math.PI * progress);
    const elevation = elevationProgress * maxElevation;
    
    return { 
      x: Math.round(x * 10) / 10, // Round to 1 decimal for smooth animation
      y: Math.round(y * 10) / 10,
      elevation: Math.round(elevation), 
      isVisible: true 
    };
  };

  const getSolarDataForTime = (hour: number) => {
    const sunPos = calculateSunPosition(hour);
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      elevation: sunPos.elevation,
      isVisible: sunPos.isVisible,
      position: sunPos
    };
  };

  // Get max pollen level
  const getMaxPollenLevel = () => {
    if (!pollenData?.pollen?.today) return 0;
    
    // Convert level strings to numbers for comparison
    const levelToNumber = (level: string): number => {
      switch (level.toLowerCase()) {
        case 'none': return 0;
        case 'low': return 1;
        case 'moderate': return 2;
        case 'high': return 3;
        case 'very_high': return 4;
        default: return 0;
      }
    };
    
    return Math.max(...pollenData.pollen.today.map(item => levelToNumber(item.level)));
  };

  const getHighestPollenInfo = () => {
    if (!pollenData?.pollen?.today || pollenData.pollen.today.length === 0) {
      return { type: 'Ukjent', level: 'Laster...', color: '#6b7280' };
    }
    
    // Convert level strings to numbers for comparison
    const levelToNumber = (level: string): number => {
      switch (level.toLowerCase()) {
        case 'none': return 0;
        case 'low': return 1;
        case 'moderate': return 2;
        case 'high': return 3;
        case 'very_high': return 4;
        default: return 0;
      }
    };

    // Get color for pollen level
    const getPollenColor = (level: number): string => {
      switch (level) {
        case 0: return '#6b7280'; // Gray
        case 1: return '#10b981'; // Green
        case 2: return '#f59e0b'; // Yellow
        case 3: return '#ef4444'; // Red
        case 4: return '#7c2d12'; // Dark red
        default: return '#6b7280';
      }
    };
    
    // Find the pollen type with highest level
    const highest = pollenData.pollen.today.reduce((max, current) => {
      return levelToNumber(current.level) > levelToNumber(max.level) ? current : max;
    });
    
    return {
      type: highest.type,
      level: highest.level,
      color: getPollenColor(levelToNumber(highest.level))
    };
  };

  const getUserDisplayInfo = () => {
    if (!user) {
      return {
        name: 'Bruker',
        avatar: null,
        initials: 'B'
      };
    }
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Bruker';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'B';
    
    return {
      name: fullName,
      avatar: user.imageUrl || null,
      initials
    };
  };

  const userInfo = getUserDisplayInfo();
  const currentSolarData = getSolarDataForTime(selectedHour);
  const uvInfo = uvData?.uv_index ? getUVRiskNorwegian(uvData.uv_index) : null;
  const airQualityInfo = airQuality?.airQuality ? {
    level: airQuality.airQuality.level,
    description: airQuality.airQuality.description,
    color: getAirQualityColor(airQuality.airQuality.level)
  } : null;
  const pollenInfo = pollenData ? getPollenLevelNorwegian(getMaxPollenLevel()) : null;

  // Card definitions
  const cards = [
    // User/Friends Card
    {
      id: 'user',
      title: 'Venner',
      icon: Users,
      content: (
        <div className="user-card-content">
          <div className="user-profile">
            {userInfo.avatar ? (
              <Image 
                src={userInfo.avatar} 
                alt={userInfo.name} 
                width={40}
                height={40}
                className="user-avatar"
              />
            ) : (
              <div className="user-avatar-initials">{userInfo.initials}</div>
            )}
            <div className="user-name">{userInfo.name}</div>
          </div>
          
          <div className="friends-section">
            <div className="location-info">
              <MapPin size={8} />
              <span>Oslo, Norge</span>
            </div>
            
            <div className="friends-grid">
              {friendsInCity.map(friend => (
                <div key={friend.id} className="friend-item">
                  <div className="friend-avatar">
                    {friend.initials}
                  </div>
                  <div className="friend-name">{friend.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      actions: (
        <button 
          className="plus-button" 
          title="Legg til nye venner"
          onClick={() => setShowInviteModal(true)}
        >
          <Plus size={12} />
        </button>
      )
    },
    
    // Solar Card
    {
      id: 'solar',
      title: 'Sol',
      icon: Sun,
      content: (
        <div className="solar-content">
          <div className="sun-path-mini">
            {currentSolarData.isVisible && (
              <div className="elevation-display-mini">
                {currentSolarData.elevation}°
              </div>
            )}
            
            <div className="sun-path-arc-mini"></div>
            
            {currentSolarData.isVisible && (
              <div 
                className="sun-icon-mini"
                style={{
                  left: `${currentSolarData.position.x}%`,
                  bottom: `${currentSolarData.position.y}%`,
                  transform: 'translate(-50%, 50%)'
                }}
              >
                ☀
              </div>
            )}
            
            <div className="horizon-line-mini"></div>
            
            <div className="time-markers-mini">
              <div className="time-marker-mini">Oppgang</div>
              <div className="time-marker-mini">Høyest</div>
              <div className="time-marker-mini">Nedgang</div>
            </div>
            
            <div className="time-control-mini">
              <input
                type="range"
                min="0"
                max="23"
                value={selectedHour}
                onChange={(e) => setSelectedHour(Number(e.target.value))}
                className="time-slider-mini"
              />
            </div>
          </div>

          <div className="solar-data-compact">
            <div className="solar-item-mini">
              <span className="solar-label-mini">Oppgang:</span>
              <span className="solar-value-mini">
                {astroData?.sun?.sunrise ? formatTimeNorwegian(astroData.sun.sunrise) : '06:00'}
              </span>
            </div>
            
            <div className="solar-item-mini">
              <span className="solar-label-mini">Nedgang:</span>
              <span className="solar-value-mini">
                {astroData?.sun?.sunset ? formatTimeNorwegian(astroData.sun.sunset) : '20:00'}
              </span>
            </div>
            
            <div className="solar-item-mini">
              <span className="solar-label-mini">Høyest:</span>
              <span className="solar-value-mini highlight">
                {astroData?.sun?.solarNoon ? formatTimeNorwegian(astroData.sun.solarNoon) : '13:00'}
              </span>
            </div>
            
            <div className="solar-item-mini">
              <span className="solar-label-mini">Høyde:</span>
              <span className="solar-value-mini highlight">
                {currentSolarData.elevation}°
              </span>
            </div>
          </div>
        </div>
      ),
      time: currentSolarData.time
    },

    // Moon Card
    {
      id: 'moon',
      title: 'Måne',
      icon: Moon,
      content: (
        <div className="moon-content">
          {astroData?.moon ? (
            <>
              <div className="moon-visual">
                <div className="moon-phase-display">
                  <div 
                    className="moon-shadow"
                    style={{
                      transform: `scaleX(${astroData.moon.phase.percentage < 0.5 ? 1 - (astroData.moon.phase.percentage * 2) : (astroData.moon.phase.percentage - 0.5) * 2})`
                    }}
                  ></div>
                </div>
              </div>

              <div className="moon-data-compact">
                <div className="moon-item-mini">
                  <span className="moon-label-mini">Fase:</span>
                  <span className="moon-value-mini highlight">
                    {getMoonPhaseNorwegian(astroData.moon.phase.description)}
                  </span>
                </div>
                
                <div className="moon-item-mini">
                  <span className="moon-label-mini">Belysning:</span>
                  <span className="moon-value-mini">
                    {Math.round(astroData.moon.phase.percentage * 100)}%
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="loading-placeholder">
              Laster månedata...
            </div>
          )}
        </div>
      )
    },

    // UV Card
    {
      id: 'uv',
      title: 'UV-indeks',
      icon: Shield,
      content: (
        <div className="uv-content">
          {uvData ? (
            <>
              <div className="uv-gauge">
                <div className="uv-meter">
                  <div className="uv-arc"></div>
                  <div 
                    className="uv-needle"
                    style={{
                      transform: `translateX(-50%) rotate(${-90 + ((uvData.uv_index || 0) / 11) * 180}deg)`
                    }}
                  ></div>
                  <div className="uv-value-display" style={{ color: uvInfo?.color }}>
                    {uvData.uv_index ?? 'N/A'}
                  </div>
                </div>
              </div>

              <div className="uv-data-compact">
                <div className="uv-item-mini">
                  <span className="uv-label-mini">Nivå:</span>
                  <span className="uv-value-mini" style={{ color: uvInfo?.color }}>
                    {uvInfo?.level}
                  </span>
                </div>
                
                <div className="uv-item-mini">
                  <span className="uv-label-mini">Risiko:</span>
                  <span className="uv-value-mini">
                    {uvInfo?.description}
                  </span>
                </div>
                
                {uvInfo?.advice && (
                  <div className="uv-item-mini">
                    <span className="uv-label-mini">Råd:</span>
                    <span className="uv-value-mini">
                      {uvInfo.advice}
                    </span>
                  </div>
                )}
                
                {uvInfo?.warning && (
                  <div className="uv-warning-mini">
                    <AlertTriangle size={6} />
                    {uvInfo.warning}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="loading-placeholder">
              Laster UV-data...
            </div>
          )}
        </div>
      )
    },

    // Air Quality Card
    {
      id: 'air-quality',
      title: 'Luftkvalitet',
      icon: Eye,
      content: (
        <div className="air-quality-content">
          {airQuality ? (
            <>
              <div className="air-quality-visual">
                <div className="aqi-display-mini">
                  <div className="aqi-value-large" style={{ color: airQualityInfo?.color }}>
                    {airQualityInfo?.level}
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.7)' }}>
                      {airQualityInfo?.description}
                    </div>
                  </div>
                </div>
              </div>

              <div className="air-quality-data-compact">
                <div className="uv-item-mini">
                  <span className="uv-label-mini">Status:</span>
                  <span className="uv-value-mini" style={{ color: airQualityInfo?.color }}>
                    {airQualityInfo?.level}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="loading-placeholder">
              Laster luftkvalitetsdata...
            </div>
          )}
        </div>
      )
    },

    // Pollen Card
    {
      id: 'pollen',
      title: 'Pollen',
      icon: Star,
      content: (
        <div className="pollen-content">
          {pollenData ? (
            <>
              <div className="pollen-visual">
                <div className="pollen-level-display">
                  <div className="pollen-value-large" style={{ color: pollenInfo?.color }}>
                    {getMaxPollenLevel()}
                  </div>
                  <div>
                    <div className="pollen-level-text" style={{ color: pollenInfo?.color }}>
                      {pollenInfo?.level}
                    </div>
                    <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.7)' }}>
                      Høyeste: {getHighestPollenInfo().type}
                    </div>
                  </div>
                </div>
                
                <div className="pollen-types-mini">
                  {[
                    { name: 'Bjørk', type: 'birch' },
                    { name: 'Gress', type: 'grass' },
                    { name: 'Burot', type: 'mugwort' },
                    { name: 'Oliven', type: 'olive' },
                    { name: 'Ragweed', type: 'ragweed' },
                    { name: 'Or', type: 'alder' }
                  ].map(({ name, type }) => {
                    const pollenItem = pollenData.pollen.today?.find(item => item.type.toLowerCase().includes(type.toLowerCase()));
                    return (
                      <div key={name} className="pollen-type-item-mini">
                        <div className="pollen-type-name-mini">{name}</div>
                        <div className="pollen-type-level-mini">{pollenItem?.level || 'N/A'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pollen-data-compact">
                <div className="uv-item-mini">
                  <span className="uv-label-mini">Nivå:</span>
                  <span className="uv-value-mini" style={{ color: pollenInfo?.color }}>
                    {pollenInfo?.level}
                  </span>
                </div>
                
                <div className="uv-item-mini">
                  <span className="uv-label-mini">Høyeste:</span>
                  <span className="uv-value-mini">
                    {getHighestPollenInfo().type}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="loading-placeholder">
              Laster pollendata...
            </div>
          )}
        </div>
      )
    }
  ];

  // Navigation functions
  const nextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setSlideDirection('right');
      setCurrentCardIndex(currentCardIndex + 1);
      setTimeout(() => setSlideDirection(null), 300);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setSlideDirection('left');
      setCurrentCardIndex(currentCardIndex - 1);
      setTimeout(() => setSlideDirection(null), 300);
    }
  };

  const goToCard = (index: number) => {
    if (index !== currentCardIndex && index >= 0 && index < cards.length) {
      setSlideDirection(index > currentCardIndex ? 'right' : 'left');
      setCurrentCardIndex(index);
      setTimeout(() => setSlideDirection(null), 300);
    }
  };

  // Handle invite friend modal
  const handleInviteFriend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email');
    
    console.log('Inviting friend:', email);
    setShowInviteModal(false);
  };

  if (isLoading) {
    return (
      <>
        <style>{forecastDashboardStyles}</style>
        <div className="forecast-dashboard">
          <div className="dashboard-content">
            <div className="nav-button disabled">
              <ChevronLeft size={14} />
            </div>
            
            <div className="card-container">
              <div className="loading-placeholder">
                Laster værdata...
              </div>
            </div>
            
            <div className="nav-button disabled">
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </>
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <>
      <style>{forecastDashboardStyles}</style>
      <div className="forecast-dashboard">
        <div className="dashboard-content">
          <button 
            className={`nav-button ${currentCardIndex === 0 ? 'disabled' : ''}`}
            onClick={prevCard}
            disabled={currentCardIndex === 0}
          >
            <ChevronLeft size={14} />
          </button>

          <div className="card-container">
            <div className={`info-card ${slideDirection ? `slide-in-${slideDirection}` : ''}`}>
              <div className="card-header">
                <div className="card-title">
                  <currentCard.icon size={14} />
                  <span>{currentCard.title}</span>
                </div>
                <div className="card-actions">
                  {currentCard.time && (
                    <div className="current-time">{currentCard.time}</div>
                  )}
                  {currentCard.actions}
                </div>
              </div>
              
              {currentCard.content}
            </div>
          </div>

          <button 
            className={`nav-button ${currentCardIndex === cards.length - 1 ? 'disabled' : ''}`}
            onClick={nextCard}
            disabled={currentCardIndex === cards.length - 1}
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {cards.length > 1 && (
          <div className="card-indicator">
            {cards.map((_, index) => (
              <div
                key={index}
                className={`indicator-dot ${index === currentCardIndex ? 'active' : ''}`}
                onClick={() => goToCard(index)}
              />
            ))}
          </div>
        )}

        {showInviteModal && (
          <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-title">
                <Users size={20} />
                Inviter venn
              </div>
              
              <form onSubmit={handleInviteFriend}>
                <div className="form-group">
                  <label htmlFor="email">E-postadresse</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="venn@example.com"
                    required
                  />
                </div>
                
                <div className="modal-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowInviteModal(false)}
                  >
                    Avbryt
                  </button>
                  <button type="submit">
                    Send invitasjon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ForecastDashboard;