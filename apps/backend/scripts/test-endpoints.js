#!/usr/bin/env node
/**
 * Test script to verify public and authenticated endpoints.
 * 
 * Usage: 
 *   node scripts/test-endpoints.js
 * 
 * Note: Server should be running on http://localhost:4000
 */

const http = require('node:http');

const BASE_URL = 'http://localhost:4000';
const PUBLIC_ENDPOINTS = [
  '/health',
  '/api/weather/current?lat=59.91&lon=10.75'
];
const AUTH_ENDPOINTS = [
  '/api/weather?lat=59.91&lon=10.75',
  '/api/weather/uv?lat=59.91&lon=10.75',
  '/api/weather/pollen?lat=59.91&lon=10.75',
  '/api/weather/air-quality?lat=59.91&lon=10.75',
  '/api/weather/astro?lat=59.91&lon=10.75'
];
const UV_ENDPOINTS = [
  '/api/weather/uv?lat=59.91&lon=10.75',
  '/api/weather/pollen?lat=59.91&lon=10.75',
  '/api/weather/air-quality?lat=59.91&lon=10.75',
  '/api/weather/astro?lat=59.91&lon=10.75'
];

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.end();
  });
}

async function testPublicEndpoints() {
  console.log('✅ Testing public endpoints (should be accessible without auth)...');
  
  for (const endpoint of PUBLIC_ENDPOINTS) {
    try {
      const url = `${BASE_URL}${endpoint}`;
      console.log(`   Testing ${url}...`);
      const response = await makeRequest(url);
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log(`   ✅ SUCCESS: ${endpoint} returned ${response.statusCode}`);
      } else {
        console.log(`   ❌ FAIL: ${endpoint} returned ${response.statusCode}`);
      }
    } catch (error) {
      console.error(`   ❌ ERROR: ${endpoint} - ${error.message}`);
    }
  }
}

async function testAuthEndpoints() {
  console.log('\n✅ Testing protected endpoints (should require auth)...');
  
  for (const endpoint of AUTH_ENDPOINTS) {
    try {
      const url = `${BASE_URL}${endpoint}`;
      console.log(`   Testing ${url} without auth token...`);
      const response = await makeRequest(url);
      
      if (response.statusCode === 401) {
        console.log(`   ✅ SUCCESS: ${endpoint} correctly returned 401 Unauthorized`);
      } else {
        console.log(`   ❌ FAIL: ${endpoint} returned ${response.statusCode} (expected 401)`);
      }
    } catch (error) {
      console.error(`   ❌ ERROR: ${endpoint} - ${error.message}`);
    }
  }
}

async function testWeatherEndpoint() {
  console.log('\n🌤️  Testing Weather Endpoint with Oslo coordinates...');
  const osloCoords = { lat: 59.9139, lon: 10.7522 };

  try {
    // Test the public current weather endpoint first
    console.log('\nTesting public current weather endpoint:');
    const currentResponse = await fetch(`http://localhost:4000/weather/current?lat=${osloCoords.lat}&lon=${osloCoords.lon}`);
    
    if (!currentResponse.ok) {
      throw new Error(`HTTP error! status: ${currentResponse.status}`);
    }
    
    const currentData = await currentResponse.json();
    console.log('✅ Public endpoint response:', {
      temperature: currentData.temperature,
      symbol: currentData.symbol_code,
    });

    // Now test the endpoint with full weather data using the test route
    console.log('\nTesting complete weather data endpoint:');
    const response = await fetch(`http://localhost:4000/weather/test?lat=${osloCoords.lat}&lon=${osloCoords.lon}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate basic weather data
    console.log('\n📌 Basic Weather Data:');
    if (data.current) {
      console.log('✅ Current weather:', {
        temperature: data.current.temperature,
        symbol: data.current.symbol_code,
        uv_index: data.current.uv_index,
        humidity: data.current.humidity,
        pressure: data.current.pressure,
        wind: {
          speed: data.current.wind_speed,
          direction: data.current.wind_direction
        }
      });
    } else {
      console.log('❌ Missing current weather data');
    }

    // Validate Pollen Data
    console.log('\n🌺 Pollen Data:');
    if (data.pollen) {
      console.log('✅ Today\'s pollen levels:', data.pollen.today.map(p => 
        `${p.type}: ${p.level}`
      ));
      console.log('✅ Tomorrow\'s pollen levels:', data.pollen.tomorrow.map(p => 
        `${p.type}: ${p.level}`
      ));
    } else {
      console.log('❌ Missing pollen data');
    }

    // Validate Air Quality
    console.log('\n💨 Air Quality:');
    if (data.airQuality) {
      console.log('✅ Current air quality:', {
        level: data.airQuality.level,
        description: data.airQuality.description
      });
      console.log('✅ Air quality forecast available:', 
        data.airQuality.forecast.length > 0);
    } else {
      console.log('❌ Missing air quality data');
    }

    // Validate Astronomical Data
    console.log('\n☀️ Sun Data:');
    if (data.sun) {
      console.log('✅ Sun information:', {
        sunrise: data.sun.sunrise,
        sunset: data.sun.sunset,
        daylightHours: `${data.sun.daylightHours}h ${data.sun.daylightMinutes}m`,
        solarAltitude: `${data.sun.altitude}°`
      });
    } else {
      console.log('❌ Missing sun data');
    }

    console.log('\n🌙 Moon Data:');
    if (data.moon) {
      console.log('✅ Moon information:', {
        phase: data.moon.phase.description,
        moonrise: data.moon.moonrise,
        moonset: data.moon.moonset,
        altitude: `${data.moon.altitude}°`,
        direction: data.moon.azimuth
      });
    } else {
      console.log('❌ Missing moon data');
    }

    // Test response time
    const startTime = process.hrtime();
    await fetch(`http://localhost:4000/weather?lat=${osloCoords.lat}&lon=${osloCoords.lon}`);
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;
    
    console.log('\n⚡ Performance:');
    console.log(`✅ Second request (cached) response time: ${milliseconds.toFixed(2)}ms`);

    return true;
  } catch (error) {
    console.error('❌ Error testing weather endpoint:', error.message);
    return false;
  }
}

async function validateWeatherData(data, type) {
  switch (type) {
    case 'uv':
      return data && typeof data.uvIndex === 'number';
    case 'pollen':
      return data && Array.isArray(data.types) && data.types.length > 0;
    case 'air-quality':
      return data && typeof data.aqi === 'number';
    case 'astro':
      return data && data.sunrise && data.sunset && data.moonPhase;
    default:
      return false;
  }
}

async function getTestAuthToken() {
  // In development, we'll use a test token. In production, you would use Clerk's auth flow
  return 'test-token';
}

async function testEnhancedWeatherData() {
  console.log('\n🌡️ Testing Enhanced Weather Data Endpoints...');
  const authToken = await getTestAuthToken();
  
  for (const endpoint of UV_ENDPOINTS) {
    try {
      const url = `${BASE_URL}${endpoint}`;
      console.log(`\nTesting ${url}...`);
      
      // Add auth token to the request
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const type = endpoint.split('/').pop().split('?')[0];
      const isValid = await validateWeatherData(data, type);
      
      if (isValid) {
        console.log(`✅ SUCCESS: ${type} data validated successfully`);
        console.log('Sample data:', JSON.stringify(data, null, 2));
      } else {
        console.log(`❌ FAIL: ${type} data validation failed`);
        console.log('Received:', data);
      }
    } catch (error) {
      console.error(`❌ ERROR: ${endpoint} - ${error.message}`);
    }
  }
}

// Add weather test to main function
async function main() {
  console.log('🧪 Testing Væro API authentication configuration\n');
  
  try {
    await testPublicEndpoints();
    await testAuthEndpoints();
    await testWeatherEndpoint();
    await testEnhancedWeatherData();
    
    console.log('\n✅ Tests complete!');
    console.log('Note: You should manually verify that authenticated endpoints work with a valid token.');
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
    process.exit(1);
  }
}

main();
