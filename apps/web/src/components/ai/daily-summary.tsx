// src/components/ai/daily-summary.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { BookOpen, Sparkles } from "lucide-react";

interface DailySummaryProps {
  summary?: string;
  isLoading?: boolean;
}

export function DailySummary({
  summary,
  isLoading = false,
}: DailySummaryProps) {
  const { isSignedIn } = useAuth();

  // Auth is now handled at the page level
  if (!isSignedIn) return null;
  if (isLoading) {
    return (
      <div className="weather-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[var(--weather-dark)]" />
          Dagens sammendrag
        </h3>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-white/10 rounded w-full"></div>
          <div className="h-4 bg-white/10 rounded w-5/6"></div>
          <div className="h-4 bg-white/10 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="weather-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[var(--weather-dark)]" />
          Dagens sammendrag
        </h3>
        <div className="text-center text-[var(--text-secondary)] py-8">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>AI‐værssammendrag vil dukke opp her</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-[var(--weather-dark)]" />
        Dagens sammendrag
        <Sparkles className="h-4 w-4 text-[var(--weather-dark)] ml-1" />
      </h3>

      <div className="p-4 bg-[var(--weather-gradient)]/10 rounded-xl border border-[var(--weather-gradient)]/20">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-[var(--weather-dark)] mt-0.5 flex-shrink-0" />
          <p className="text-[var(--text-light)] text-sm leading-relaxed">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
}
