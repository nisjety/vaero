'use client';

import { useUser, UserButton } from '@clerk/nextjs';
import { MapPin, Settings, Menu } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface HeaderProps {
  location?: {
    name?: string;
    lat: number;
    lon: number;
  };
}

export default function Header({ location }: HeaderProps) {
  const { user, isLoaded } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-aurora-400 to-storm-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-white font-semibold text-xl hidden sm:block">Væro</span>
            </Link>
            
            {/* Location indicator */}
            {location && (
              <div className="hidden md:flex items-center gap-2 text-mist-300 text-sm">
                <MapPin className="h-4 w-4" />
                <span>
                  {location.name || `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`}
                </span>
              </div>
            )}
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/forecast" 
              className="text-mist-300 hover:text-white transition-colors text-sm font-medium"
            >
              Extended Forecast
            </Link>
            <Link 
              href="/ai" 
              className="text-mist-300 hover:text-white transition-colors text-sm font-medium"
            >
              AI Features
            </Link>
            <Link 
              href="/settings" 
              className="text-mist-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-1"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>

          {/* User section */}
          <div className="flex items-center gap-4">
            {isLoaded && user && (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-mist-300 text-sm">
                  Welcome, {user.firstName || user.username}
                </span>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8',
                      userButtonPopoverCard: 'bg-slate-800 border border-white/10',
                      userButtonPopoverText: 'text-white',
                    }
                  }}
                />
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-mist-300 hover:text-white transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <nav className="space-y-3">
              <Link 
                href="/forecast" 
                className="block text-mist-300 hover:text-white transition-colors text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Extended Forecast
              </Link>
              <Link 
                href="/ai" 
                className="block text-mist-300 hover:text-white transition-colors text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                AI Features
              </Link>
              <Link 
                href="/settings" 
                className="block text-mist-300 hover:text-white transition-colors text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Settings
              </Link>
              
              {isLoaded && user && (
                <div className="pt-3 border-t border-white/10 flex items-center gap-3">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: 'w-8 h-8',
                        userButtonPopoverCard: 'bg-slate-800 border border-white/10',
                        userButtonPopoverText: 'text-white',
                      }
                    }}
                  />
                  <span className="text-mist-300 text-sm">
                    {user.firstName || user.username}
                  </span>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
