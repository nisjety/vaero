"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { ErrorBoundary } from "../components/ui/error-boundary";
import { HeaderSection } from "../components/layout/HeaderSection";
import { WeatherDescription } from "../components/layout/WeatherDescription";
import { CityTemperatures } from "../components/layout/CityTemperatures";
import { MainTemperatureDisplay } from "../components/layout/MainTemperatureDisplay";
import { MetricsPanel } from "../components/layout/MetricsPanel";
import { ForecastDashboard } from "../components/layout/ForecastDashboard";
import { BottomWave } from "../components/layout/BottomWave";

const CloudIllustration = () => (
  <div className="flex items-center justify-center h-full">
    <div className="relative w-80 h-64">
    </div>
  </div>
);

export default function Home() {
  const { isLoaded } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-screen w-screen flex flex-col relative overflow-hidden top-3 relative">
        {/* Header */}
        <div className="flex-shrink-0 z-20">
          <HeaderSection currentTime={currentTime} />
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-12 gap-20 px-18 pt-4 pb-16 overflow-hidden max-h-[calc(100vh-130px)]">
          
          {/* Left Column - Weather Description & City Temps */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-0 h-full justify-center bottom-15 left-5 relative">
            <div className="flex-shrink-0">
              <WeatherDescription />
            </div>
            <div className="flex-shrink-0 relative right-10 bottom-8">
              <CityTemperatures />
            </div>
          </div>

          {/* Center Column - Cloud Illustration */}
          <div className="col-span-12 lg:col-span-4 flex items-center justify-center h-full py-12">
            <CloudIllustration />
          </div>

          {/* Right Column - Temperature & Metrics */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-16 h-full justify-center top-10 relative">
            {/* Main Temperature Display positioned at top */}
            <div className="flex-shrink-0">
              <MainTemperatureDisplay />
            </div>
            
            {/* Metrics Panel below with proper spacing */}
            <div className="relative flex-shrink-0 left-38 bottom-10">
              <MetricsPanel />
            </div>
          </div>
        </div>

        {/* Bottom Section - Forecast Dashboard */}
        <div className="absolute bottom-35 left-22 z-20">
          <div className="w-full">
            <ForecastDashboard />
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-2 left-0 right-0 z-10">
          <BottomWave />
        </div>
      </div>
    </ErrorBoundary>
  );
}