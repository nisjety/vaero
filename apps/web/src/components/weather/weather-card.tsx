'use client';

import { Thermometer, Wind, Droplets, Eye } from 'lucide-react';
import { formatTemperature, formatTime, getWeatherDescription } from '@/lib/utils';
import { YrCurrent } from '@/hooks/api';

interface WeatherCardProps {
  current: YrCurrent;
  unit?: 'metric' | 'imperial';
  timeFormat?: '24h' | '12h';
}

export function WeatherCard({ 
  current, 
  unit = 'metric', 
  timeFormat = '24h' 
}: WeatherCardProps) {
  const iconUrl = `https://api.met.no/images/weathericons/png/128/${current.symbol_code}.png`;
  
  return (
    <div className="weather-card group">
      {/* Main temperature display */}
      <div className="flex items-center justify-between mb-6">
        <div className="temp-display">
          <span className="text-6xl sm:text-7xl font-light tracking-tight">
            {formatTemperature(current.temperature, unit)}
          </span>
          <div className="text-mist-300 text-sm mt-1">
            Feels like {formatTemperature(current.temperature, unit)}
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <img 
            src={iconUrl}
            alt={getWeatherDescription(current.symbol_code)}
            className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <span className="text-mist-300 text-sm text-center mt-2 max-w-[120px]">
            {getWeatherDescription(current.symbol_code)}
          </span>
        </div>
      </div>

      {/* Weather details grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm">
          <Wind className="h-5 w-5 text-sky-300" />
          <div>
            <div className="text-white font-medium">{current.wind_speed} m/s</div>
            <div className="text-mist-400 text-xs">Wind</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm">
          <Droplets className="h-5 w-5 text-blue-300" />
          <div>
            <div className="text-white font-medium">{current.precipitation_probability}%</div>
            <div className="text-mist-400 text-xs">Rain chance</div>
          </div>
        </div>

        {current.visibility && (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm col-span-2">
            <Eye className="h-5 w-5 text-slate-300" />
            <div>
              <div className="text-white font-medium">{current.visibility} km</div>
              <div className="text-mist-400 text-xs">Visibility</div>
            </div>
          </div>
        )}
      </div>

      {/* Last updated */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-mist-400 text-xs text-center">
          Updated {formatTime(current.time, timeFormat)}
        </div>
      </div>
    </div>
  );
}
