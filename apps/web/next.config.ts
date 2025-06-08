// next.config.js eller next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  
  // Image configuration for external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.met.no',
        port: '',
        pathname: '/images/**',
      },
    ],
  },

  // Valgfri WebSocket-tilpasning (brukes i ditt tilfelle)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'ws', 'bufferutil', 'utf-8-validate'];
    }
    return config;
  },
};

export default nextConfig;
