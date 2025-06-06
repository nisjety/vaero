'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, MapPin, Thermometer, Clock, Palette, Bell } from 'lucide-react';
import { HeaderSection } from '@/components/layout/HeaderSection';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useUserPrefs, useUpdateUserPrefs } from '@/hooks/api';

const userPrefsSchema = z.object({
  unit: z.enum(['metric', 'imperial']),
  timeFormat: z.enum(['24h', '12h']),
  defaultLat: z.number().optional(),
  defaultLon: z.number().optional(),
  stylePreferences: z.object({
    gender: z.string().optional(),
    style: z.string().optional(),
    owns: z.array(z.string()).optional(),
  }).optional(),
  notifTempBelow: z.number().optional(),
  notifTempAbove: z.number().optional(),
  notifRainProb: z.number().min(0).max(100).optional(),
});

type UserPrefsFormData = z.infer<typeof userPrefsSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const { data: userPrefs, isLoading: prefsLoading, error: prefsError } = useUserPrefs();
  const updatePrefsMutation = useUpdateUserPrefs();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty, isValid }
  } = useForm<UserPrefsFormData>({
    resolver: zodResolver(userPrefsSchema),
    defaultValues: {
      unit: 'metric',
      timeFormat: '24h',
      stylePreferences: {
        gender: '',
        style: '',
      },
    },
  });

  // Update form values when user preferences are loaded
  useEffect(() => {
    if (userPrefs) {
      setValue('unit', userPrefs.unit || 'metric');
      setValue('timeFormat', userPrefs.timeFormat || '24h');
      setValue('defaultLat', userPrefs.defaultLat);
      setValue('defaultLon', userPrefs.defaultLon);
      setValue('stylePreferences', userPrefs.stylePreferences || { gender: '', style: '' });
      setValue('notifTempBelow', userPrefs.notifTempBelow);
      setValue('notifTempAbove', userPrefs.notifTempAbove);
      setValue('notifRainProb', userPrefs.notifRainProb);
    }
  }, [userPrefs, setValue]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const onSubmit = async (data: UserPrefsFormData) => {
    try {
      await updatePrefsMutation.mutateAsync(data);
      // Show success message or redirect
      router.push('/');
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setIsLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('defaultLat', position.coords.latitude);
        setValue('defaultLon', position.coords.longitude);
        setIsLocationLoading(false);
      },
      (_error) => {
        setLocationError('Failed to get your location. Please check your browser settings.');
        setIsLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  if (prefsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fjord-blue-400 via-fjord-blue-500 to-arctic-blue-600 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-fjord-blue-400 via-fjord-blue-500 to-arctic-blue-600">
        <HeaderSection currentTime={currentTime} />
        
        <main className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Innstillinger</h1>
              <p className="text-white/80">Personaliser din væropplevelse</p>
            </div>
          </div>

          {prefsError && (
            <div className="glass-card p-4 mb-6 bg-red-500/20 border border-red-400/30">
              <p className="text-red-100">Kunne ikke laste innstillinger. Prøv å last siden på nytt.</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Weather Units */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Thermometer className="h-5 w-5 text-white/80" />
                <h2 className="text-xl font-semibold text-white">Værenheter</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="metric"
                    {...register('unit')}
                    className="text-fjord-blue-500"
                  />
                  <span className="text-white">Metrisk (°C, m/s)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="imperial"
                    {...register('unit')}
                    className="text-fjord-blue-500"
                  />
                  <span className="text-white">Imperial (°F, mph)</span>
                </label>
              </div>
            </div>

            {/* Time Format */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-white/80" />
                <h2 className="text-xl font-semibold text-white">Tidsformat</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="24h"
                    {...register('timeFormat')}
                    className="text-fjord-blue-500"
                  />
                  <span className="text-white">24-timers (14:30)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="12h"
                    {...register('timeFormat')}
                    className="text-fjord-blue-500"
                  />
                  <span className="text-white">12-timers (2:30 PM)</span>
                </label>
              </div>
            </div>

            {/* Default Location */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-white/80" />
                <h2 className="text-xl font-semibold text-white">Standard lokasjon</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Breddegrad
                    </label>
                    <input
                      type="number"
                      step="any"
                      {...register('defaultLat', { valueAsNumber: true })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-aurora-green-400"
                      placeholder="59.9139"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Lengdegrad
                    </label>
                    <input
                      type="number"
                      step="any"
                      {...register('defaultLon', { valueAsNumber: true })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-aurora-green-400"
                      placeholder="10.7522"
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocationLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-aurora-green-500 text-white rounded-lg hover:bg-aurora-green-600 transition-colors disabled:opacity-50"
                >
                  {isLocationLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  Bruk nåværende lokasjon
                </button>
                
                {locationError && (
                  <p className="text-sm text-red-300">{locationError}</p>
                )}
              </div>
            </div>

            {/* Style Preferences */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="h-5 w-5 text-white/80" />
                <h2 className="text-xl font-semibold text-white">Stilpreferanser</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Kjønn
                  </label>
                  <select
                    {...register('stylePreferences.gender')}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-aurora-green-400"
                  >
                    <option value="">Velg kjønn</option>
                    <option value="male">Mann</option>
                    <option value="female">Kvinne</option>
                    <option value="non-binary">Ikke-binær</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Stilpreferanse
                  </label>
                  <select
                    {...register('stylePreferences.style')}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-aurora-green-400"
                  >
                    <option value="">Velg stil</option>
                    <option value="casual">Avslappet</option>
                    <option value="formal">Formell</option>
                    <option value="sporty">Sporty</option>
                    <option value="trendy">Trendy</option>
                    <option value="classic">Klassisk</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="h-5 w-5 text-white/80" />
                <h2 className="text-xl font-semibold text-white">Varsler</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Varsel når temperaturen er under (°C)
                  </label>
                  <input
                    type="number"
                    {...register('notifTempBelow', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-aurora-green-400"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Varsel når temperaturen er over (°C)
                  </label>
                  <input
                    type="number"
                    {...register('notifTempAbove', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-aurora-green-400"
                    placeholder="30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Varsel når nedbørssannsynlighet er over (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    {...register('notifRainProb', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-aurora-green-400"
                    placeholder="60"
                  />
                  {errors.notifRainProb && (
                    <p className="text-sm text-red-300 mt-1">Må være mellom 0 og 100</p>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={!isDirty || !isValid || updatePrefsMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-aurora-green-500 text-white rounded-lg hover:bg-aurora-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatePrefsMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                Lagre innstillinger
              </button>
            </div>

            {updatePrefsMutation.error && (
              <div className="glass-card p-4 bg-red-500/20 border border-red-400/30">
                <p className="text-red-100">Kunne ikke lagre innstillinger. Prøv igjen senere.</p>
              </div>
            )}
          </form>
        </main>
      </div>
    </ErrorBoundary>
  );
}
