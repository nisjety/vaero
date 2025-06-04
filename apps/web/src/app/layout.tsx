import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from './providers';
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
  title: "Væro - Norwegian Weather Intelligence",
  description: "AI-powered weather forecasting with personalized insights for Norway. Get clothing suggestions, activity recommendations, and detailed weather analysis.",
  keywords: ["weather", "norway", "AI", "forecast", "norwegian", "yr"],
  authors: [{ name: "Væro Team" }],
  openGraph: {
    title: "Væro - Norwegian Weather Intelligence",
    description: "AI-powered weather forecasting with personalized insights for Norway",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Væro - Norwegian Weather Intelligence",
    description: "AI-powered weather forecasting with personalized insights for Norway",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#5B46BF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <body className="antialiased">
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
