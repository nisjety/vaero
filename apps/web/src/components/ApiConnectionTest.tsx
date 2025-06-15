'use client';

import React, { useState, useEffect } from 'react';
import { useCurrentWeather, useDetailedWeather } from '@/hooks/api';
import { checkApiHealth } from '@/lib/api';

interface ApiConnectionTestProps {
  lat?: number;
  lon?: number;
}

export const ApiConnectionTest: React.FC<ApiConnectionTestProps> = ({
  lat = 59.9139, // Oslo coordinates  
  lon = 10.7522
}) => {
  const [healthStatus, setHealthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [healthData, setHealthData] = useState<any>(null);

  // Test API hooks
  const { data: currentWeather, isLoading: currentLoading, error: currentError } = useCurrentWeather(lat, lon);
  const { data: detailedWeather, isLoading: detailedLoading, error: detailedError } = useDetailedWeather(lat, lon);

  // Test health endpoint
  useEffect(() => {
    const testHealth = async () => {
      try {
        const health = await checkApiHealth();
        setHealthStatus(health.healthy ? 'success' : 'error');
        setHealthData(health);
      } catch (error) {
        setHealthStatus('error');
        setHealthData({ error: (error as Error).message });
      }
    };

    testHealth();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loading': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
      <h3 className="font-semibold mb-2 text-center">🔌 API Connection Test</h3>

      <div className="space-y-2">
        {/* Health Check */}
        <div className="flex items-center justify-between">
          <span>Health Check:</span>
          <span className={`${getStatusColor(healthStatus)} font-mono`}>
            {getStatusIcon(healthStatus)} {healthStatus}
          </span>
        </div>
        {healthData?.responseTime && (
          <div className="text-xs text-gray-300">
            Response time: {healthData.responseTime}ms
          </div>
        )}

        {/* Current Weather API */}
        <div className="flex items-center justify-between">
          <span>Current Weather:</span>
          <span className={`${getStatusColor(currentLoading ? 'loading' : currentError ? 'error' : 'success')} font-mono`}>
            {getStatusIcon(currentLoading ? 'loading' : currentError ? 'error' : 'success')}
            {currentLoading ? 'loading' : currentError ? 'error' : 'success'}
          </span>
        </div>
        {currentWeather && currentWeather.current?.temperature?.current && (
          <div className="text-xs text-gray-300">
            Oslo: {currentWeather.current.temperature.current}°C
          </div>
        )}

        {/* Detailed Weather API */}
        <div className="flex items-center justify-between">
          <span>Enhanced Weather:</span>
          <span className={`${getStatusColor(detailedLoading ? 'loading' : detailedError ? 'error' : 'success')} font-mono`}>
            {getStatusIcon(detailedLoading ? 'loading' : detailedError ? 'error' : 'success')}
            {detailedLoading ? 'loading' : detailedError ? 'error' : 'success'}
          </span>
        </div>
        {detailedWeather && (
          <div className="text-xs text-gray-300">
            AI Analysis: {detailedWeather.ai?.insights ? 'Available' : 'Not Available'}
          </div>
        )}

        {/* Error Details */}
        {(currentError || detailedError) && (
          <div className="mt-2 p-2 bg-red-900/30 rounded text-xs">
            <div className="font-semibold text-red-300">Error Details:</div>
            {currentError && <div className="text-red-200">Current: {currentError.message}</div>}
            {detailedError && <div className="text-red-200">Enhanced: {detailedError.message}</div>}
          </div>
        )}

        {/* Success Summary */}
        {!currentError && !detailedError && currentWeather && detailedWeather && (
          <div className="mt-2 p-2 bg-green-900/30 rounded text-xs">
            <div className="font-semibold text-green-300">✅ All APIs Working!</div>
            <div className="text-green-200">
              Backend: Connected<br />
              Weather: {currentWeather.success ? 'Active' : 'Inactive'}<br />
              AI Analysis: {detailedWeather.ai ? 'Active' : 'Inactive'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
