import { Job, Queue, Worker } from 'bullmq';
import { redisConnection, redis } from '../utils/redis';
import { logger } from '../utils/logger';
import { prisma } from '../utils/database';
import { YrService, yrService } from '../services/yr.service';
import notificationService from '../services/notification.service';

export interface NotificationJobData {
  type: 'weather_alert' | 'daily_summary';
  userId?: number;
}

// Create notification queue
export const notificationQueue = new Queue('notifications', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Weather alert check job
export class NotificationJob {
  static async scheduleWeatherAlerts(): Promise<void> {
    try {
      logger.info('Starting weather alert check job');

      // Get all users with notification preferences
      const users = await prisma.user.findMany({
        where: {
          prefs: {
            OR: [
              { notifTempBelow: { not: null } },
              { notifTempAbove: { not: null } },
              { notifRainProb: { not: null } },
            ],
          },
        },
        include: {
          prefs: true,
          devices: true,
          weatherSnapshot: true,
        },
      });

      logger.info(`Found ${users.length} users with notification preferences`);

      for (const user of users) {
        await this.checkUserWeatherAlerts(user);
      }

      logger.info('Weather alert check job completed');
    } catch (error) {
      logger.error('Error in weather alert check job:', error);
      throw error;
    }
  }

  private static async checkUserWeatherAlerts(user: any): Promise<void> {
    const { prefs, devices, weatherSnapshot } = user;
    
    if (!prefs || !prefs.defaultLat || !prefs.defaultLon) {
      return; // Skip users without location
    }

    try {
      // Get current weather
      const weather = await yrService.getWeather(prefs.defaultLat, prefs.defaultLon);
      const currentTemp = weather.current.temperature;
      const rainProb = weather.current.precip_prob ?? 0;

      // Check temperature alerts
      await this.checkTemperatureAlerts(user, currentTemp, weatherSnapshot?.currentTemp);
      
      // Check rain probability alerts
      await this.checkRainAlerts(user, rainProb, weatherSnapshot?.rawData?.precipitation_probability || 0);

      // Update weather snapshot
      await this.updateWeatherSnapshot(user.id, weather, prefs.defaultLat, prefs.defaultLon);

    } catch (error) {
      logger.error(`Error checking weather alerts for user ${user.id}:`, error);
    }
  }

  private static async checkTemperatureAlerts(
    user: any,
    currentTemp: number,
    lastTemp?: number
  ): Promise<void> {
    const { prefs, devices } = user;
    const today = new Date().toISOString().split('T')[0];

    // Check temperature below threshold
    if (prefs.notifTempBelow !== null && currentTemp < prefs.notifTempBelow) {
      if (!lastTemp || lastTemp >= prefs.notifTempBelow) {
        const alertKey = `alert:${user.id}:temp_below:${today}`;
        
        if (!(await redis.exists(alertKey))) {
          await redis.set(alertKey, 'sent', 'EX', 86400); // 1 day

          await this.sendNotificationToUserDevices(devices, {
            title: 'Cold Weather Alert',
            body: `Temperature dropped to ${Math.round(currentTemp)}°C. Stay warm!`,
            data: { type: 'temp_below', temperature: currentTemp.toString() },
          });

          logger.info(`Sent cold weather alert to user ${user.id}`);
        }
      }
    }

    // Check temperature above threshold
    if (prefs.notifTempAbove !== null && currentTemp > prefs.notifTempAbove) {
      if (!lastTemp || lastTemp <= prefs.notifTempAbove) {
        const alertKey = `alert:${user.id}:temp_above:${today}`;
        
        if (!(await redis.exists(alertKey))) {
          await redis.set(alertKey, 'sent', 'EX', 86400); // 1 day

          await this.sendNotificationToUserDevices(devices, {
            title: 'Hot Weather Alert',
            body: `Temperature rose to ${Math.round(currentTemp)}°C. Stay cool!`,
            data: { type: 'temp_above', temperature: currentTemp.toString() },
          });

          logger.info(`Sent hot weather alert to user ${user.id}`);
        }
      }
    }
  }

  private static async checkRainAlerts(
    user: any,
    rainProb: number,
    lastRainProb?: number
  ): Promise<void> {
    const { prefs, devices } = user;
    const today = new Date().toISOString().split('T')[0];

    if (prefs.notifRainProb !== null && rainProb > prefs.notifRainProb) {
      if (!lastRainProb || lastRainProb <= prefs.notifRainProb) {
        const alertKey = `alert:${user.id}:rain:${today}`;
        
        if (!(await redis.exists(alertKey))) {
          await redis.set(alertKey, 'sent', 'EX', 86400); // 1 day

          await this.sendNotificationToUserDevices(devices, {
            title: 'Rain Alert',
            body: `${rainProb}% chance of rain. Don't forget your umbrella!`,
            data: { type: 'rain', rainProbability: rainProb.toString() },
          });

          logger.info(`Sent rain alert to user ${user.id}`);
        }
      }
    }
  }

  private static async updateWeatherSnapshot(
    userId: number,
    weather: any,
    lat: number,
    lon: number
  ): Promise<void> {
    await prisma.weatherSnapshot.upsert({
      where: { userId },
      update: {
        timestamp: new Date(),
        lat,
        lon,
        currentTemp: weather.current.temperature,
        symbolCode: weather.current.symbol_code,
        rawData: weather.current,
      },
      create: {
        userId,
        timestamp: new Date(),
        lat,
        lon,
        currentTemp: weather.current.temperature,
        symbolCode: weather.current.symbol_code,
        rawData: weather.current,
      },
    });
  }

  private static async sendNotificationToUserDevices(
    devices: any[],
    notification: {
      title: string;
      body: string;
      data: Record<string, string>;
    }
  ): Promise<void> {
    for (const device of devices) {
      try {
        await notificationService.sendPushNotification({
          pushToken: device.pushToken,
          platform: device.platform,
          title: notification.title,
          body: notification.body,
          data: notification.data,
        });
      } catch (error) {
        logger.error(`Failed to send notification to device ${device.id}:`, error);
      }
    }
  }

  static async scheduleDailySummaries(): Promise<void> {
    try {
      logger.info('Starting daily summary job');

      // Get all users with devices (who want notifications)
      const users = await prisma.user.findMany({
        where: {
          devices: {
            some: {},
          },
        },
        include: {
          prefs: true,
          devices: true,
        },
      });

      for (const user of users) {
        if (user.prefs?.defaultLat && user.prefs?.defaultLon) {
          await notificationQueue.add(
            'daily_summary',
            { type: 'daily_summary', userId: user.id },
            { delay: Math.random() * 60000 } // Random delay up to 1 minute
          );
        }
      }

      logger.info(`Scheduled daily summaries for ${users.length} users`);
    } catch (error) {
      logger.error('Error in daily summary job:', error);
      throw error;
    }
  }
}

// Worker to process notification jobs
export const notificationWorker = new Worker(
  'notifications',
  async (job: Job<NotificationJobData>) => {
    logger.info(`Processing notification job: ${job.name}`, job.data);

    switch (job.data.type) {
      case 'weather_alert':
        await NotificationJob.scheduleWeatherAlerts();
        break;
        
      case 'daily_summary':
        if (job.data.userId) {
          await processDailySummaryForUser(job.data.userId);
        }
        break;
        
      default:
        logger.warn(`Unknown job type: ${job.data.type}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

async function processDailySummaryForUser(userId: number): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { prefs: true, devices: true },
    });

    if (!user || !user.prefs?.defaultLat || !user.prefs?.defaultLon) {
      return;
    }

    const weather = await yrService.getWeather(user.prefs.defaultLat, user.prefs.defaultLon);
    const today = weather.daily[0];
    const tomorrow = weather.daily[1];

    if (today && tomorrow) {
      const summary = `Today: ${Math.round(today.maxTemp)}°/${Math.round(today.minTemp)}°C, ${today.symbol_code.replace('_', ' ')}. Tomorrow: ${Math.round(tomorrow.maxTemp)}°/${Math.round(tomorrow.minTemp)}°C, ${tomorrow.symbol_code.replace('_', ' ')}.`;

      await NotificationJob['sendNotificationToUserDevices'](user.devices, {
        title: 'Daily Weather Summary',
        body: summary,
        data: { type: 'daily_summary' },
      });

      logger.info(`Sent daily summary to user ${userId}`);
    }
  } catch (error) {
    logger.error(`Error processing daily summary for user ${userId}:`, error);
    throw error;
  }
}

// Schedule recurring jobs
export function scheduleNotificationJobs(): void {
  // Weather alerts every hour
  notificationQueue.add(
    'weather_alert',
    { type: 'weather_alert' },
    {
      repeat: { pattern: '0 * * * *' }, // Every hour at minute 0
      jobId: 'weather_alert_job',
    }
  );

  // Daily summaries at 8 AM
  notificationQueue.add(
    'daily_summary',
    { type: 'daily_summary' },
    {
      repeat: { pattern: '0 8 * * *' }, // Every day at 8 AM
      jobId: 'daily_summary_job',
    }
  );

  logger.info('Notification jobs scheduled');
}

// Error handling
notificationWorker.on('failed', (job, err) => {
  logger.error(`Notification job failed: ${job?.id}`, err);
});

notificationWorker.on('completed', (job) => {
  logger.info(`Notification job completed: ${job.id}`);
});