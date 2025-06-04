'use client';

import { Shirt, Sparkles } from 'lucide-react';
import { categorizeClothingItems } from '@/lib/utils';

interface ClothingSuggestionProps {
  suggestion?: {
    items: string[];
    explanation: string;
  };
  isLoading?: boolean;
}

export default function ClothingSuggestion({ suggestion, isLoading }: ClothingSuggestionProps) {
  if (isLoading) {
    return (
      <div className="weather-card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shirt className="h-5 w-5 text-aurora-400" />
          Clothing Suggestion
        </h3>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="flex flex-wrap gap-2 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-white/10 rounded-full w-20"></div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="weather-card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shirt className="h-5 w-5 text-aurora-400" />
          Clothing Suggestion
        </h3>
        <div className="text-center text-mist-400 py-8">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>AI clothing suggestions will appear here</p>
        </div>
      </div>
    );
  }

  const categorizedItems = categorizeClothingItems(suggestion.items);

  return (
    <div className="weather-card">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Shirt className="h-5 w-5 text-aurora-400" />
        Clothing Suggestion
        <Sparkles className="h-4 w-4 text-aurora-300 ml-1" />
      </h3>
      
      <div className="space-y-4">
        {/* Clothing items by category */}
        {Object.entries(categorizedItems).map(([category, items]) => {
          if (items.length === 0) return null;
          
          const categoryColors = {
            outerwear: 'bg-storm-500/20 text-storm-200 border-storm-400/30',
            tops: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
            bottoms: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
            footwear: 'bg-slate-500/20 text-slate-200 border-slate-400/30',
            accessories: 'bg-aurora-500/20 text-aurora-200 border-aurora-400/30',
            other: 'bg-mist-500/20 text-mist-200 border-mist-400/30',
          };
          
          return (
            <div key={category}>
              <h4 className="text-sm font-medium text-mist-300 mb-2 capitalize">
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {items.map((item, index) => (
                  <span
                    key={`${category}-${index}`}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 hover:scale-105 ${
                      categoryColors[category as keyof typeof categoryColors] || categoryColors.other
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
        
        {/* AI explanation */}
        <div className="mt-6 p-4 bg-gradient-to-br from-aurora-500/10 to-storm-500/10 rounded-xl border border-aurora-400/20">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-aurora-300 mt-0.5 flex-shrink-0" />
            <p className="text-mist-200 text-sm leading-relaxed">
              {suggestion.explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
