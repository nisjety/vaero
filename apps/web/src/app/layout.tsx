// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import ThreeClouds from "../components/three/ThreeClouds";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weather Forecast Dashboard",
  description: "Beautiful weather dashboard with real-time forecasts and modern design.",
  keywords: ["weather", "forecast", "dashboard", "nextjs", "modern design"],
  authors: [{ name: "Weather Dashboard Team" }],
  openGraph: {
    title: "Weather Forecast Dashboard",
    description: "Beautiful weather dashboard with real-time forecasts and modern design.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Weather Forecast Dashboard",
    description: "Beautiful weather dashboard with real-time forecasts and modern design.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4A90E2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <body className="antialiased h-screen w-screen overflow-hidden">
          {/* 3D Clouds Background Layer */}
          <div className="fixed inset-0 z-0">
            <ThreeClouds />
          </div>
          
          {/* Main Content Layer */}
          <div className="relative z-10 h-full w-full">
            <Providers>{children}</Providers>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}