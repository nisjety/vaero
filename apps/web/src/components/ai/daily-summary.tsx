'use client';

import { BookOpen, Sparkles } from 'lucide-react';

interface DailySummaryProps {
  summary?: string;
  isLoading?: boolean;
}

export default function DailySummary({ summary, isLoading }: DailySummaryProps) {
  if (isLoading) {
    return (
      <div className="weather-card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-aurora-400" />
          Today's Weather Summary
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
      <div className="weather-card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-aurora-400" />
          Today's Weather Summary
        </h3>
        <div className="text-center text-mist-400 py-8">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>AI weather summary will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-card">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-aurora-400" />
        Today's Weather Summary
        <Sparkles className="h-4 w-4 text-aurora-300 ml-1" />
      </h3>
      
      <div className="p-4 bg-gradient-to-br from-aurora-500/10 to-dawn-500/10 rounded-xl border border-aurora-400/20">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-aurora-300 mt-0.5 flex-shrink-0" />
          <p className="text-mist-100 leading-relaxed">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
}
