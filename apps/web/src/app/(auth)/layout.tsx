// src/app/auth/layout.tsx
import type { ReactNode } from "react";
import "@/app/globals.css"; // Importer Tailwind + Væro-stiler

import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

function Header() {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: 20 }}>
      <h1>My App</h1>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </header>
  )
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="no">
      <ClerkProvider>
        <Header />
        <div className="relative min-h-screen bg-weather-primary flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <div className="weather-card p-8"></div>
              {children}
                </div>
            </div>
      </ClerkProvider>
    </html>
  );
}