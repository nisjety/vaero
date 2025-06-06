// next.config.js eller next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',

  // Valgfri WebSocket-tilpasning (brukes i ditt tilfelle)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'ws', 'bufferutil', 'utf-8-validate'];
    }
    return config;
  },
};

export default nextConfig;
