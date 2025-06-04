'use client';

import { formatTemperature, formatTime, getWeatherDescription } from '@/lib/utils';
import { YrHourly } from '@/hooks/api';

interface HourlyForecastProps {
  hourly: YrHourly[];
  unit?: 'metric' | 'imperial';
  timeFormat?: '24h' | '12h';
}

export function HourlyForecast({ 
  hourly, 
  unit = 'metric', 
  timeFormat = '24h' 
}: HourlyForecastProps) {
  // Show next 24 hours
  const next24Hours = hourly.slice(0, 24);

  return (
    <div className="weather-card">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-aurora-400 rounded-full"></span>
        24-Hour Forecast
      </h3>
      
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-2 min-w-max">
          {next24Hours.map((hour, index) => {
            const iconUrl = `https://api.met.no/images/weathericons/png/64/${hour.symbol_code}.png`;
            const isNow = index === 0;
            
            return (
              <div 
                key={hour.time}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 min-w-[80px] ${
                  isNow 
                    ? 'bg-aurora-500/20 border border-aurora-400/30' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className={`text-sm font-medium ${isNow ? 'text-aurora-300' : 'text-mist-300'}`}>
                  {isNow ? 'Now' : formatTime(hour.time, timeFormat, { hoursOnly: true })}
                </div>
                
                <img 
                  src={iconUrl}
                  alt={getWeatherDescription(hour.symbol_code)}
                  className="w-10 h-10 drop-shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                
                <div className="text-white font-semibold">
                  {formatTemperature(hour.temperature, unit, { showUnit: false })}°
                </div>
                
                {hour.precipitation_probability > 0 && (
                  <div className="text-xs text-blue-300 flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                    {hour.precipitation_probability}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
