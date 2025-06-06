// src/components/layout/location-selector.tsx
"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2, Search, Navigation } from "lucide-react";

interface LocationSelectorProps {
  onLocationChange: (location: {
    lat: number;
    lon: number;
    name?: string;
  }) => void;
  defaultLocation?: { lat: number; lon: number; name?: string };
  isLoading?: boolean;
  currentLocation?: { lat: number; lon: number; name?: string };
}

export function LocationSelector({
  onLocationChange,
  defaultLocation,
  currentLocation,
  isLoading: externalLoading = false,
}: LocationSelectorProps) {
  const [isLoadingGeolocation, setIsLoadingGeolocation] =
    useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [localCurrentLocation, setLocalCurrentLocation] =
    useState(defaultLocation);

  // Hent brukerens nåværende posisjon
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolokasjon støttes ikke av nettleseren din");
      return;
    }

    setIsLoadingGeolocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          name: "Nåværende posisjon",
        };
        setLocalCurrentLocation(location);
        onLocationChange(location);
        setIsLoadingGeolocation(false);
      },
      (error) => {
        console.error("Kunne ikke hente posisjon:", error);
        alert(
          "Kunne ikke hente din posisjon. Vennligst søk manuelt etter en lokasjon."
        );
        setIsLoadingGeolocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  // Søk etter byer i Norge m.m. (Nominatim)
  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
          query
        )}&countrycodes=no,se,dk,fi`
      );
      const results = await response.json();

      setSearchResults(
        results.map((result: any) => ({
          name: result.display_name,
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
        }))
      );
    } catch (error) {
      console.error("Feil ved søk etter lokasjon:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced‐søk
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

  const selectLocation = (location: {
    lat: number;
    lon: number;
    name: string;
  }) => {
    setLocalCurrentLocation(location);
    onLocationChange(location);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="weather-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-[var(--weather-dark)]" />
        Lokasjon
      </h3>

      <div className="space-y-4">
        {/* Viser nåværende lokasjon om tilgjengelig */}
        {(localCurrentLocation || currentLocation) && (
          <div className="p-3 bg-[var(--weather-gradient)]/20 rounded-xl border border-[var(--weather-gradient)]/30">
            <div className="flex items-center gap-2 text-[var(--weather-dark)] text-sm font-medium">
              <MapPin className="h-4 w-4" />
              <span>
                Nåværende:{" "}
                {localCurrentLocation?.name ||
                  currentLocation?.name ||
                  `${(localCurrentLocation?.lat ?? currentLocation?.lat)?.toFixed(
                    2
                  )}, ${(localCurrentLocation?.lon ??
                    currentLocation?.lon)?.toFixed(2)}`}
              </span>
            </div>
          </div>
        )}

        {/* Knapp for å hente nåværende posisjon */}
        <button
          onClick={getCurrentLocation}
          disabled={isLoadingGeolocation || externalLoading}
          className="w-full flex items-center justify-center gap-2 p-3 bg-[var(--weather-dark)] hover:bg-[var(--weather-light)] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
        >
          {isLoadingGeolocation || externalLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          {isLoadingGeolocation || externalLoading
            ? "Henter posisjon..."
            : "Bruk nåværende posisjon"}
        </button>

        {/* Søkefelt for å søke manuelt */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Søk etter by i Norge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--card-bg)] border border-white/25 rounded-xl text-white placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--weather-dark)] focus:border-transparent"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-[var(--text-secondary)]" />
            )}
          </div>

          {/* Viser søkeresultater i en dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--weather-dark)] border border-white/25 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => selectLocation(result)}
                  className="w-full text-left p-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                >
                  <div className="text-white text-sm font-medium truncate">
                    {result.name}
                  </div>
                  <div className="text-[var(--text-secondary)] text-xs">
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
