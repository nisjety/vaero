'use client';

import { useEffect, useState } from 'react';

export default function DebugApiUrl() {
  const [clientUrl, setClientUrl] = useState<string>('');
  const [serverUrl, setServerUrl] = useState<string>('');

  useEffect(() => {
    // Client-side URL detection
    const getClientApiUrl = () => {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    };

    setClientUrl(getClientApiUrl());

    // Also check what's actually in the environment
    console.log('🔍 Environment variables:', {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-lg z-50 text-xs">
      <div>🌐 Client API URL: {clientUrl}</div>
      <div>📍 NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL || 'undefined'}</div>
      <div>🏗️ NODE_ENV: {process.env.NODE_ENV}</div>
    </div>
  );
}
