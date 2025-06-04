'use client';

import { CalendarDays } from 'lucide-react';
import { formatTemperature, formatDate, getWeatherDescription } from '@/lib/utils';
import { YrDaily } from '@/hooks/api';

interface DailyForecastProps {
  daily: YrDaily[];
  unit?: 'metric' | 'imperial';
}

export function DailyForecast({ daily, unit = 'metric' }: DailyForecastProps) {
  // Show next 7 days
  const next7Days = daily.slice(0, 7);

  return (
    <div className="weather-card">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-aurora-400" />
        7-Day Forecast
      </h3>
      
      <div className="space-y-3">
        {next7Days.map((day, index) => {
          const iconUrl = `https://api.met.no/images/weathericons/png/64/${day.symbol_code}.png`;
          const isToday = index === 0;
          
          return (
            <div 
              key={day.date}
              className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                isToday 
                  ? 'bg-aurora-500/20 border border-aurora-400/30' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <img 
                  src={iconUrl}
                  alt={getWeatherDescription(day.symbol_code)}
                  className="w-12 h-12 drop-shadow-sm flex-shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${isToday ? 'text-aurora-300' : 'text-white'}`}>
                    {isToday ? 'Today' : formatDate(day.date, { format: 'weekday' })}
                  </div>
                  <div className="text-mist-400 text-sm truncate">
                    {getWeatherDescription(day.symbol_code)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-right">
                <div className="text-white font-semibold">
                  {formatTemperature(day.maxTemp, unit, { showUnit: false })}°
                </div>
                <div className="text-mist-400">
                  {formatTemperature(day.minTemp, unit, { showUnit: false })}°
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
