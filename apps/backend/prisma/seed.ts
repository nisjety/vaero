import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { clerkUserId: 'test_user_123' },
    update: {},
    create: {
      clerkUserId: 'test_user_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Created test user with ID: ${testUser.id}`);

  // Create user preferences
  const userPrefs = await prisma.userPrefs.upsert({
    where: { userId: testUser.id },
    update: {
      unit: 'metric',
      timeFormat: '24h',
      defaultLat: 59.91,
      defaultLon: 10.75,
      stylePreferences: {
        gender: 'unisex',
        style: 'casual',
        owns: ['jacket', 'umbrella', 'wool_sweater'],
      },
      notifTempBelow: 5.0,
      notifTempAbove: 25.0,
      notifRainProb: 60,
    },
    create: {
      userId: testUser.id,
      unit: 'metric',
      timeFormat: '24h',
      defaultLat: 59.91,
      defaultLon: 10.75,
      stylePreferences: {
        gender: 'unisex',
        style: 'casual',
        owns: ['jacket', 'umbrella', 'wool_sweater'],
      },
      notifTempBelow: 5.0,
      notifTempAbove: 25.0,
      notifRainProb: 60,
    },
  });

  console.log(`✅ Created user preferences for user ${testUser.id}`);

  // Create test device
  const testDevice = await prisma.device.upsert({
    where: { id: 1 },
    update: {
      platform: 'web',
      pushToken: JSON.stringify({
        endpoint: 'https://fcm.googleapis.com/fcm/send/test',
        keys: {
          p256dh: 'test_p256dh_key',
          auth: 'test_auth_key',
        },
      }),
      updatedAt: new Date(),
    },
    create: {
      userId: testUser.id,
      platform: 'web',
      pushToken: JSON.stringify({
        endpoint: 'https://fcm.googleapis.com/fcm/send/test',
        keys: {
          p256dh: 'test_p256dh_key',
          auth: 'test_auth_key',
        },
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Created test device with ID: ${testDevice.id}`);

  // Create AI history entry
  const aiHistory = await prisma.aIHistory.create({
    data: {
      userId: testUser.id,
      timestamp: new Date(),
      type: 'clothingSuggestion',
      promptInput: 'Current weather: 10°C, partly cloudy, 20% rain chance. Suggest clothing.',
      aiResponse: 'For 10°C with partly cloudy skies, I recommend layering with a light jacket or sweater.',
      metadata: {
        items: ['light_jacket', 'long_pants', 'comfortable_shoes'],
        temperature: 10,
        conditions: 'partly_cloudy',
        location: 'Oslo, Norway',
      },
    },
  });

  console.log(`✅ Created AI history entry with ID: ${aiHistory.id}`);

  // Create weather snapshot
  const weatherSnapshot = await prisma.weatherSnapshot.upsert({
    where: { userId: testUser.id },
    update: {
      timestamp: new Date(),
      lat: 59.91,
      lon: 10.75,
      currentTemp: 12.5,
      symbolCode: 'partly_cloudy_day',
      rawData: {
        time: new Date().toISOString(),
        temperature: 12.5,
        symbol_code: 'partly_cloudy_day',
        wind_speed: 3.2,
        precipitation_probability: 20,
        humidity: 65,
        pressure: 1013.2,
      },
    },
    create: {
      userId: testUser.id,
      timestamp: new Date(),
      lat: 59.91,
      lon: 10.75,
      currentTemp: 12.5,
      symbolCode: 'partly_cloudy_day',
      rawData: {
        time: new Date().toISOString(),
        temperature: 12.5,
        symbol_code: 'partly_cloudy_day',
        wind_speed: 3.2,
        precipitation_probability: 20,
        humidity: 65,
        pressure: 1013.2,
      },
    },
  });

  console.log(`✅ Created weather snapshot for user ${testUser.id}`);

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📊 Seed Summary:');
  console.log(`   - Users: 1`);
  console.log(`   - User Preferences: 1`);
  console.log(`   - Devices: 1`);
  console.log(`   - AI History Entries: 1`);
  console.log(`   - Weather Snapshots: 1`);
  console.log('\n🔗 Test user details:');
  console.log(`   - Clerk User ID: test_user_123`);
  console.log(`   - Default Location: Oslo (59.91, 10.75)`);
  console.log(`   - Temperature Alerts: < 5°C, > 25°C`);
  console.log(`   - Rain Alert: > 60%`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
