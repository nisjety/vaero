// utils/routeAccess.ts - Updated route access configuration
// Free tier routes (no authentication required)
const freeRoutes = [
  '/api/health',
  '/api/',
  
  // Free YR weather data
  '/api/weather/current',
  '/api/weather/detailed', 
  '/api/weather/forecast',
  '/api/weather/uv',
  '/api/weather/pollen',
  '/api/weather/air-quality',
  '/api/weather/astronomical',
  '/api/weather/popular',
  '/api/weather/multi',
  
  // Free AI-enhanced weather
  '/api/weather-ai/enhanced',
  '/api/weather-ai/insights',
  '/api/weather-ai/oslo',
  '/api/weather-ai/clothing/basic',
  '/api/weather-ai/activity/basic',
  '/api/weather-ai/models',
  '/api/weather-ai/cache',
  '/api/weather-ai/health'
];

// Premium tier routes (authentication required)
const premiumRoutes = [
  // OpenAI-powered features
  '/api/ai/',
  
  // User management
  '/api/users/'
];

// Development only routes
const devRoutes = [
  '/api/test',
  '/api/dev'
];

/**
 * Check if a route is in the free tier (no auth required)
 */
export const isFreeRoute = (path: string): boolean => {
  return freeRoutes.some(route => path.startsWith(route));
};

/**
 * Check if a route is in the premium tier (auth required)
 */
export const isPremiumRoute = (path: string): boolean => {
  return premiumRoutes.some(route => path.startsWith(route));
};

/**
 * Check if a route is development only
 */
export const isDevRoute = (path: string): boolean => {
  return devRoutes.some(route => path.startsWith(route));
};

/**
 * Get route tier information
 */
export const getRouteTier = (path: string): { tier: string; authRequired: boolean; description: string } => {
  if (isFreeRoute(path)) {
    return {
      tier: 'free',
      authRequired: false,
      description: 'Free weather data and basic AI features'
    };
  }
  
  if (isPremiumRoute(path)) {
    return {
      tier: 'premium',
      authRequired: true,
      description: 'Premium OpenAI-powered personalized features'
    };
  }
  
  if (isDevRoute(path)) {
    return {
      tier: 'development',
      authRequired: false,
      description: 'Development and testing endpoints'
    };
  }
  
  return {
    tier: 'unknown',
    authRequired: false,
    description: 'Unknown endpoint'
  };
};