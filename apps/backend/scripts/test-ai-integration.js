#!/usr/bin/env node
/**
 * Test script for Weather AI integration
 * Tests the progressive model loading and response times
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000/api';

// Test data
const testWeatherData = {
  oslo: { lat: 59.9139, lon: 10.7522 },
  bergen: { lat: 60.3913, lon: 5.3221 },
  trondheim: { lat: 63.4305, lon: 10.3951 }
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAIStatus() {
  console.log('\n🔍 Testing API Status...');
  try {
    const response = await axios.get(`${API_BASE_URL}`);
    console.log('✅ API Status:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ API Status failed:', error.message);
    return null;
  }
}

async function testBasicWeather(location, coords) {
  console.log(`\n🌤️  Testing Basic Weather for ${location}...`);
  const startTime = Date.now();
  
  try {
    const response = await axios.get(`${API_BASE_URL}/weather/current`, {
      params: {
        lat: coords.lat,
        lon: coords.lon
      }
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ ${location} Basic Weather (${responseTime}ms):`);
    console.log(`   Temperature: ${response.data.current.temperature}°C`);
    console.log(`   Condition: ${response.data.current.symbol_code}`);
    console.log(`   Wind: ${response.data.current.wind_speed} m/s`);
    
    return { success: true, responseTime, data: response.data };
  } catch (error) {
    console.error(`❌ ${location} Basic Weather failed:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testWeatherAI(location, coords) {
  console.log(`\n🌤️  Testing Enhanced Weather for ${location}...`);
  const startTime = Date.now();
  
  try {
    // Test enhanced weather with AI (requires auth - will fail without token but shows structure)
    const response = await axios.get(`${API_BASE_URL}/weather`, {
      params: {
        lat: coords.lat,
        lon: coords.lon
      }
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ ${location} Enhanced Weather (${responseTime}ms):`);
    console.log(`   Has AI Analysis: ${!!response.data.clothingSuggestion}`);
    console.log(`   Temperature: ${response.data.current.temperature}°C`);
    console.log(`   Clothing Items: ${response.data.clothingSuggestion?.items?.length || 0}`);
    
    return { success: true, responseTime, data: response.data };
  } catch (error) {
    if (error.response?.status === 401) {
      console.log(`⚠️  ${location} Enhanced Weather requires authentication (expected)`);
      return { success: true, responseTime: Date.now() - startTime, authenticated: false };
    }
    console.error(`❌ ${location} Enhanced Weather failed:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testPerformance() {
  console.log('\n⚡ Performance Test - Multiple Requests...');
  
  const promises = [
    testBasicWeather('Oslo-1', testWeatherData.oslo),
    testBasicWeather('Oslo-2', testWeatherData.oslo), // Should hit cache
    testBasicWeather('Bergen', testWeatherData.bergen),
    testBasicWeather('Trondheim', testWeatherData.trondheim)
  ];
  
  const results = await Promise.all(promises);
  
  const successCount = results.filter(r => r.success).length;
  const avgResponseTime = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.responseTime, 0) / successCount;
  
  console.log(`\n📊 Performance Summary:`);
  console.log(`   Success Rate: ${successCount}/${results.length}`);
  console.log(`   Average Response Time: ${avgResponseTime.toFixed(1)}ms`);
  
  return results;
}

async function testProgressiveLoading() {
  console.log('\n🚀 Testing Progressive Model Loading...');
  
  // Test immediately (should use fallback)
  await testAIStatus();
  await testWeatherAI('Oslo (immediate)', testWeatherData.oslo);
  
  // Wait a bit for ONNX model to load
  console.log('\n⏳ Waiting 3 seconds for ONNX model...');
  await sleep(3000);
  await testAIStatus();
  await testWeatherAI('Oslo (after ONNX)', testWeatherData.oslo);
  
  // Wait more for Transformers.js model
  console.log('\n⏳ Waiting 10 seconds for Transformers.js model...');
  await sleep(10000);
  await testAIStatus();
  await testWeatherAI('Oslo (after Transformers)', testWeatherData.oslo);
}

async function main() {
  console.log('🧪 Weather AI Integration Test');
  console.log('================================');
  
  try {
    // Check if server is running
    console.log('\n🔗 Checking server connectivity...');
    await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Server is running');
    
    // Test API Status
    await testAIStatus();
    
    // Test basic weather
    await testBasicWeather('Oslo', testWeatherData.oslo);
    
    // Test enhanced weather (will show auth requirement)
    await testWeatherAI('Oslo', testWeatherData.oslo);
    
    // Test performance with basic endpoints
    await testPerformance();
    
    // Test additional weather endpoints
    console.log('\n🌍 Testing Additional Weather Endpoints...');
    await testAdditionalEndpoints();
    
    console.log('\n✅ All tests completed!');
    console.log('\n💡 Note: Enhanced weather with AI requires authentication');
    console.log('💡 The WeatherAI service exists but needs proper Express.js integration');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running: npm run dev');
    process.exit(1);
  }
}

async function testAdditionalEndpoints() {
  const endpoints = [
    { name: 'UV Index', path: '/weather/uv' },
    { name: 'Air Quality', path: '/weather/air-quality' },
    { name: 'Astronomical Data', path: '/weather/astro' }
  ];

  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await axios.get(`${API_BASE_URL}${endpoint.path}`, {
        params: { lat: testWeatherData.oslo.lat, lon: testWeatherData.oslo.lon }
      });
      const responseTime = Date.now() - startTime;
      console.log(`✅ ${endpoint.name} (${responseTime}ms): Available`);
    } catch (error) {
      console.log(`⚠️  ${endpoint.name}: ${error.response?.status || 'Error'}`);
    }
  }
}

// Handle CLI arguments
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testAIStatus, testWeatherAI, testPerformance };
