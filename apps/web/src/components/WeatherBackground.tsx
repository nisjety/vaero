// src/components/WeatherBackground.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useWeatherWithAI } from "@/hooks/api";

// Dynamisk import av Three.js‐komponenten (ikke SSR)
const WeatherScene = dynamic(
  () =>
    import("@/components/three/WeatherScene").then(
      (mod) => mod.WeatherScene
    ),
  { ssr: false }
);

interface RainDrop {
  id: number;
  x: number;
  y: number;
  speed: number;
  opacity: number;
  size: number;
}

interface SnowFlake {
  id: number;
  x: number;
  y: number;
  speed: number;
  opacity: number;
  size: number;
  drift: number;
}

export function WeatherBackground() {
  const [currentHour, setCurrentHour] = useState<number>(
    new Date().getHours()
  );
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);
  const [snowFlakes, setSnowFlakes] = useState<SnowFlake[]>([]);
  const animationFrameRef = useRef<number>();

  // Oppdater currentHour hvert minutt
  useEffect(() => {
    const intervall = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60 * 1000);
    return () => clearInterval(intervall);
  }, []);

  // Hent værdata (bruker Oslo som default)
  const {
    data: weatherData,
    isLoading: weatherLoading,
    error: weatherError,
  } = useWeatherWithAI(59.9139, 10.7522, {
    enabled: true,
    staleTime: 10 * 60 * 1000,
  });

  // Bestem weatherCondition basert på symbol_code + tid
  const weatherCondition = (() => {
    if (!weatherData || weatherLoading || weatherError) {
      return "clear";
    }
    const symbol = weatherData.current.symbol_code.toLowerCase();
    if (symbol.includes("rain") || symbol.includes("storm")) return "rain";
    if (symbol.includes("snow")) return "snow";
    if (symbol.includes("cloud")) return "cloudy";
    if (currentHour >= 20 || currentHour < 6) return "night";
    return "clear";
  })() as "clear" | "cloudy" | "rain" | "snow" | "night";

  // Sett tema-klasse basert på været
  useEffect(() => {
    const body = document.body;
    body.className = body.className.replace(/theme-\w+/g, '');
    
    switch (weatherCondition) {
      case "rain":
        body.classList.add("theme-storm");
        break;
      case "snow":
        body.classList.add("theme-snow");
        break;
      case "cloudy":
        body.classList.add("theme-cloudy");
        break;
      case "night":
        body.classList.add("theme-night");
        break;
      default:
        body.classList.add("theme-clear");
    }
  }, [weatherCondition]);

  // Initialize raindrops
  useEffect(() => {
    if (weatherCondition === "rain") {
      const drops: RainDrop[] = [];
      for (let i = 0; i < 150; i++) {
        drops.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          speed: Math.random() * 10 + 5,
          opacity: Math.random() * 0.6 + 0.2,
          size: Math.random() * 3 + 1,
        });
      }
      setRainDrops(drops);
    } else {
      setRainDrops([]);
    }
  }, [weatherCondition]);

  // Initialize snowflakes
  useEffect(() => {
    if (weatherCondition === "snow") {
      const flakes: SnowFlake[] = [];
      for (let i = 0; i < 100; i++) {
        flakes.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          speed: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          size: Math.random() * 5 + 2,
          drift: Math.random() * 2 - 1,
        });
      }
      setSnowFlakes(flakes);
    } else {
      setSnowFlakes([]);
    }
  }, [weatherCondition]);

  // Animate raindrops
  useEffect(() => {
    if (rainDrops.length === 0) return;

    const animate = () => {
      setRainDrops(prevDrops => 
        prevDrops.map(drop => ({
          ...drop,
          y: drop.y + drop.speed,
          x: drop.x + Math.sin(drop.y * 0.01) * 0.5, // Slight wind effect
        })).map(drop => {
          // Reset position when off screen
          if (drop.y > window.innerHeight + 10) {
            return {
              ...drop,
              y: -10,
              x: Math.random() * window.innerWidth,
            };
          }
          if (drop.x < -10 || drop.x > window.innerWidth + 10) {
            return {
              ...drop,
              x: Math.random() * window.innerWidth,
            };
          }
          return drop;
        })
      );
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [rainDrops.length]);

  // Animate snowflakes
  useEffect(() => {
    if (snowFlakes.length === 0) return;

    const animate = () => {
      setSnowFlakes(prevFlakes => 
        prevFlakes.map(flake => ({
          ...flake,
          y: flake.y + flake.speed,
          x: flake.x + flake.drift,
        })).map(flake => {
          // Reset position when off screen
          if (flake.y > window.innerHeight + 10) {
            return {
              ...flake,
              y: -10,
              x: Math.random() * window.innerWidth,
            };
          }
          if (flake.x < -10) {
            return { ...flake, x: window.innerWidth + 10 };
          }
          if (flake.x > window.innerWidth + 10) {
            return { ...flake, x: -10 };
          }
          return flake;
        })
      );
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [snowFlakes.length]);

  return (
    <div className="fixed inset-0 z-0">
      {/* Three.js background scene */}
      <WeatherScene
        weatherCondition={weatherCondition}
        currentHour={currentHour}
      />

      {/* CSS-based weather overlays */}
      {weatherCondition === "rain" && (
        <>
          {/* Animated rain overlay */}
          <div className="rain-overlay" />
          
          {/* Individual raindrops */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {rainDrops.map(drop => (
              <div
                key={drop.id}
                className="absolute bg-white rounded-full"
                style={{
                  left: `${drop.x}px`,
                  top: `${drop.y}px`,
                  width: `${drop.size}px`,
                  height: `${drop.size * 4}px`,
                  opacity: drop.opacity,
                  transform: 'rotate(15deg)',
                }}
              />
            ))}
          </div>

          {/* Lightning effect (occasional) */}
          <div className="fixed inset-0 pointer-events-none">
            <div 
              className="w-full h-full bg-white opacity-0 animate-pulse-slow"
              style={{
                animation: 'lightning 8s infinite',
              }}
            />
          </div>
        </>
      )}

      {weatherCondition === "snow" && (
        <>
          {/* Snow overlay */}
          <div className="snow-overlay" />
          
          {/* Individual snowflakes */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {snowFlakes.map(flake => (
              <div
                key={flake.id}
                className="absolute bg-white rounded-full"
                style={{
                  left: `${flake.x}px`,
                  top: `${flake.y}px`,
                  width: `${flake.size}px`,
                  height: `${flake.size}px`,
                  opacity: flake.opacity,
                }}
              />
            ))}
          </div>
        </>
      )}

      {weatherCondition === "cloudy" && (
        <div className="cloud-overlay" />
      )}

      {weatherCondition === "night" && (
        <div className="fixed inset-0 pointer-events-none">
          {/* Stars */}
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse-slow"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                opacity: Math.random() * 0.8 + 0.2,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/30 pointer-events-none" style={{
        background: 'radial-gradient(circle at center, transparent 0%, transparent 60%, rgba(0,0,0,0.1) 100%)'
      }} />
    </div>
  );
}

// Add keyframes for lightning effect
const lightningKeyframes = `
  @keyframes lightning {
    0%, 94%, 96%, 100% { opacity: 0; }
    95% { opacity: 0.2; }
  }
`;

// Inject the keyframes into the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = lightningKeyframes;
  document.head.appendChild(style);
}