// API Connection Test Utility
import { api, checkApiHealth } from './api';

/**
 * Tests the backend API connection and returns detailed diagnostics
 */
export const testBackendConnection = async () => {
  console.log('🔍 Testing backend API connection...');

  try {
    // First check health endpoint
    console.log('1️⃣ Testing API health endpoint...');
    const health = await checkApiHealth();

    if (health.healthy) {
      console.log(`✅ Health check passed in ${health.responseTime}ms`);
    } else {
      console.error(`❌ Health check failed: ${health.error}`);
      return {
        success: false,
        message: `Health check failed: ${health.error}`,
        responseTime: health.responseTime,
        details: health
      };
    }

    // Check weather endpoints
    console.log('2️⃣ Testing weather endpoints...');
    try {
      const weatherStatus = await api.get('/weather/status');
      console.log('✅ Weather status API is available:', weatherStatus.data);
    } catch (error) {
      console.error('❌ Weather status API failed:', error);
      return {
        success: false,
        message: 'Weather status API unavailable',
        error
      };
    }

    // Test popular locations endpoint
    console.log('3️⃣ Testing popular locations endpoint...');
    try {
      const popularLocations = await api.get('/weather/popular-locations');
      console.log(`✅ Popular locations API returned ${popularLocations.data?.results?.length || 0} locations`);
    } catch (error) {
      console.error('❌ Popular locations API failed:', error);
      return {
        success: false,
        message: 'Popular locations API unavailable',
        error
      };
    }

    // Test AI enhanced weather
    console.log('4️⃣ Testing AI-enhanced weather endpoint...');
    try {
      const aiWeather = await api.get('/weather-ai/enhanced', {
        params: { lat: 59.9139, lon: 10.7522 } // Oslo coordinates
      });
      console.log('✅ AI-enhanced weather API is available');

      if (aiWeather.data?.ai_analysis) {
        console.log('✅ AI analysis is included in the response');
      } else {
        console.warn('⚠️ AI analysis is not included in the response');
      }
    } catch (error) {
      console.error('❌ AI-enhanced weather API failed:', error);
      return {
        success: false,
        message: 'AI-enhanced weather API unavailable',
        error
      };
    }

    // All tests passed
    return {
      success: true,
      message: 'All API connection tests passed',
      endpoints: {
        health: true,
        weatherStatus: true,
        popularLocations: true,
        aiWeather: true
      }
    };

  } catch (error) {
    console.error('❌ API connection test failed with unexpected error:', error);
    return {
      success: false,
      message: 'API connection test failed with unexpected error',
      error
    };
  }
};
