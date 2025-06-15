// src/components/ai/clothing-suggestion.tsx working on not tested
"use client";

import { Shirt, Sparkles } from "lucide-react";
import { categorizeClothingItems } from "@/lib/utils";

interface ClothingSuggestionProps {
  suggestion?: {
    items: string[];
    explanation: string;
  };
  isLoading?: boolean;
}

export function ClothingSuggestion({
  suggestion,
  isLoading = false,
}: ClothingSuggestionProps) {
  if (isLoading) {
    return (
      <div className="weather-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shirt className="h-5 w-5 text-[var(--weather-dark)]" />
          Klesanbefaling
        </h3>
        <div className="space-y-4 animate-pulse">
          <div className="flex flex-wrap gap-2 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-8 bg-white/10 rounded-full w-20"
              ></div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-white/10 rounded w-full"></div>
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="weather-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shirt className="h-5 w-5 text-[var(--weather-dark)]" />
          Klesanbefaling
        </h3>
        <div className="text-center text-[var(--text-secondary)] py-8">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>AI-klesforslag vil dukke opp her</p>
        </div>
      </div>
    );
  }

  const categorizedItems = categorizeClothingItems(suggestion.items);

  // Blåtoner for kategorier
  const categoryColors: Record<string, string> = {
    outerwear:
      "bg-[var(--weather-dark)]/20 text-[var(--weather-dark)] border border-[var(--weather-dark)]/30",
    tops:
      "bg-[var(--weather-light)]/20 text-[var(--weather-light)] border border-[var(--weather-light)]/30",
    bottoms:
      "bg-[var(--weather-gradient)]/20 text-[var(--weather-dark)] border border-[var(--weather-gradient)]/30",
    footwear:
      "bg-[var(--weather-dark)]/10 text-[var(--weather-dark)] border border-[var(--weather-dark)]/20",
    accessories:
      "bg-[var(--weather-gradient)]/10 text-[var(--weather-dark)] border border-[var(--weather-gradient)]/20",
    other:
      "bg-white/10 text-[var(--weather-dark)] border border-white/20",
  };

  return (
    <div className="weather-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Shirt className="h-5 w-5 text-[var(--weather-dark)]" />
        Klesanbefaling
        <Sparkles className="h-4 w-4 text-[var(--weather-dark)] ml-1" />
      </h3>

      <div className="space-y-4">
        {Object.entries(categorizedItems).map(
          ([category, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={category}>
                <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2 capitalize">
                  {category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {items.map((item, index) => (
                    <span
                      key={`${category}-${index}`}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
                        categoryColors[
                          category as keyof typeof categoryColors
                        ] || categoryColors["other"]
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          }
        )}

        <div className="mt-6 p-4 bg-[var(--weather-gradient)]/10 rounded-xl border border-[var(--weather-gradient)]/20">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-[var(--weather-dark)] mt-0.5 flex-shrink-0" />
            <p className="text-[var(--text-light)] text-sm leading-relaxed">
              {suggestion.explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
