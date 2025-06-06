import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: { outer: 'w-6 h-6', inner: 'w-3 h-3' },
    md: { outer: 'w-12 h-12', inner: 'w-6 h-6' },
    lg: { outer: 'w-16 h-16', inner: 'w-8 h-8' }
  };

  const { outer, inner } = sizeClasses[size];

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative">
        <div className={cn(outer, "border-4 border-white/20 border-t-white rounded-full animate-spin")}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className={cn(inner, "bg-white/10 rounded-full animate-pulse")}></div>
        </div>
      </div>
    </div>
  );
};