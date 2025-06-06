// src/app/auth/layout.tsx
import { ReactNode } from "react";
import "@/app/globals.css"; // Importer Tailwind + Væro-stiler

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-weather-primary flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="weather-card p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
