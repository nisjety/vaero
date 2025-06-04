'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
          <p className="text-mist-300 mb-4 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-storm-600 hover:bg-storm-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
