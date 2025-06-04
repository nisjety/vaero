'use client';

import { useState, useEffect } from 'react';
import { MapPin, Loader2, Search, Navigation } from 'lucide-react';

interface LocationSelectorProps {
  onLocationChange: (location: { lat: number; lon: number; name?: string }) => void;
  defaultLocation?: { lat: number; lon: number; name?: string };
}

export default function LocationSelector({ onLocationChange, defaultLocation }: LocationSelectorProps) {
  const [isLoadingGeolocation, setIsLoadingGeolocation] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState(defaultLocation);

  // Get user's current location
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingGeolocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          name: 'Current Location'
        };
        setCurrentLocation(location);
        onLocationChange(location);
        setIsLoadingGeolocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please search for a location manually.');
        setIsLoadingGeolocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Search for locations using Nominatim (OpenStreetMap)
  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}&countrycodes=no,se,dk,fi`
      );
      const results = await response.json();
      
      setSearchResults(results.map((result: any) => ({
        name: result.display_name,
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
      })));
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchLocations(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const selectLocation = (location: { lat: number; lon: number; name: string }) => {
    setCurrentLocation(location);
    onLocationChange(location);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="weather-card">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-aurora-400" />
        Location
      </h3>
      
      <div className="space-y-4">
        {/* Current location display */}
        {currentLocation && (
          <div className="p-3 bg-aurora-500/20 rounded-xl border border-aurora-400/30">
            <div className="flex items-center gap-2 text-aurora-300 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              <span>Current: {currentLocation.name || `${currentLocation.lat.toFixed(2)}, ${currentLocation.lon.toFixed(2)}`}</span>
            </div>
          </div>
        )}

        {/* Get current location button */}
        <button
          onClick={getCurrentLocation}
          disabled={isLoadingGeolocation}
          className="w-full flex items-center justify-center gap-2 p-3 bg-storm-600 hover:bg-storm-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
        >
          {isLoadingGeolocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          {isLoadingGeolocation ? 'Getting location...' : 'Use current location'}
        </button>

        {/* Location search */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mist-400" />
            <input
              type="text"
              placeholder="Search for a city in Norway..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-mist-400 focus:outline-none focus:ring-2 focus:ring-aurora-400 focus:border-transparent"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-mist-400" />
            )}
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/20 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => selectLocation(result)}
                  className="w-full text-left p-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                >
                  <div className="text-white text-sm font-medium truncate">
                    {result.name}
                  </div>
                  <div className="text-mist-400 text-xs">
                    {result.lat.toFixed(2)}, {result.lon.toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
