'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/layout/header';
import { LocationSelector } from '@/components/layout/location-selector';
import { WeatherCard } from '@/components/weather/weather-card';
import { HourlyForecast } from '@/components/weather/hourly-forecast';
import { DailyForecast } from '@/components/weather/daily-forecast';
import { ClothingSuggestion } from '@/components/ai/clothing-suggestion';
import { DailySummary } from '@/components/ai/daily-summary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useWeatherWithAI, useDailySummary } from '@/hooks/api';
import { MapPin } from 'lucide-react';

interface Location {
  lat: number;
  lon: number;
  name?: string;
}

export default function Home() {
  const { user, isLoaded: userLoaded } = useUser();
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Auto-detect location on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            name: 'Current Location'
          });
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Oslo if geolocation fails
          setLocation({
            lat: 59.9139,
            lon: 10.7522,
            name: 'Oslo, Norway'
          });
          setLocationError('Location access denied. Showing weather for Oslo.');
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      // Fallback to Oslo
      setLocation({
        lat: 59.9139,
        lon: 10.7522,
        name: 'Oslo, Norway'
      });
    }
  }, []);

  // Fetch weather data
  const {
    data: weatherData,
    isLoading: weatherLoading,
    error: weatherError,
    refetch: refetchWeather
  } = useWeatherWithAI(
    location?.lat || 59.9139,
    location?.lon || 10.7522,
    {
      enabled: !!location,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Fetch daily summary
  const {
    data: dailySummary,
    isLoading: summaryLoading,
    error: summaryError
  } = useDailySummary(
    location?.lat || 59.9139,
    location?.lon || 10.7522,
    {
      enabled: !!location,
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
    }
  );

  // Handle location change
  const handleLocationChange = (newLocation: Location) => {
    setLocation(newLocation);
    setLocationError(null);
    // Refetch weather data for new location
    refetchWeather();
  };

  // Show loading state while user data is loading
  if (!userLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fjord-blue-400 via-fjord-blue-500 to-arctic-blue-600 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-fjord-blue-400 via-fjord-blue-500 to-arctic-blue-600">
        <Header />
        
        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Welcome Section */}
          <div className="text-center text-white mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Velkommen{user?.firstName ? `, ${user.firstName}` : ''}!
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-6">
              Din personlige værprofil med AI-drevne anbefalinger
            </p>
            
            {/* Location Selector */}
            <div className="max-w-md mx-auto">
              <LocationSelector
                currentLocation={location}
                onLocationChange={handleLocationChange}
                isLoading={isGettingLocation}
              />
              
              {locationError && (
                <div className="mt-2 text-sm text-amber-100 bg-amber-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {locationError}
                </div>
              )}
            </div>
          </div>

          {/* Weather Content */}
          {location && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Weather Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Weather */}
                {weatherLoading ? (
                  <div className="glass-card p-6 flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : weatherError ? (
                  <div className="glass-card p-6 text-center text-red-100">
                    <p>Kunne ikke laste værdata. Prøv igjen senere.</p>
                    <button
                      onClick={() => refetchWeather()}
                      className="mt-2 text-sm underline hover:no-underline"
                    >
                      Prøv igjen
                    </button>
                  </div>
                ) : weatherData ? (
                  <>
                    <WeatherCard weather={weatherData.current} location={location} />
                    <HourlyForecast hourly={weatherData.hourly} />
                    <DailyForecast daily={weatherData.daily} />
                  </>
                ) : null}
              </div>

              {/* AI Features Sidebar */}
              <div className="space-y-6">
                {/* Daily Summary */}
                {summaryLoading ? (
                  <div className="glass-card p-6 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : summaryError ? (
                  <div className="glass-card p-6 text-center text-red-100">
                    <p className="text-sm">Kunne ikke laste sammendrag</p>
                  </div>
                ) : dailySummary ? (
                  <DailySummary summary={dailySummary} />
                ) : null}

                {/* Clothing Suggestion */}
                {weatherData?.clothingSuggestion && (
                  <ClothingSuggestion suggestion={weatherData.clothingSuggestion} />
                )}

                {/* Quick Stats */}
                {weatherData && (
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Hurtige fakta
                    </h3>
                    <div className="space-y-3 text-sm text-white/80">
                      <div className="flex justify-between">
                        <span>Vindstyrke:</span>
                        <span>{weatherData.current.wind_speed} m/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nedbørssannsynlighet:</span>
                        <span>{weatherData.current.precipitation_probability}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dagens høyeste:</span>
                        <span>{weatherData.daily[0]?.maxTemp}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dagens laveste:</span>
                        <span>{weatherData.daily[0]?.minTemp}°</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Location State */}
          {!location && !isGettingLocation && (
            <div className="text-center text-white/80 py-12">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-white/60" />
              <p className="text-lg mb-2">Velkommen til Væro!</p>
              <p>Velg en lokasjon for å se værmeldingen</p>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
