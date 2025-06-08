// services/notification.service.ts - Optimized push notification service
import { env } from '../utils/env';
import { logger } from '../utils/logger';
import { redis } from '../utils/redis';

interface PushNotificationPayload {
  pushToken: string;
  platform: 'ios' | 'android' | 'web';
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  priority?: 'normal' | 'high';
}

interface NotificationTemplate {
  title: string;
  body: string;
  data: Record<string, any>;
  sound?: string;
  priority?: 'normal' | 'high';
}

class NotificationService {
  private readonly fcmEndpoint = 'https://fcm.googleapis.com/fcm/send';
  private readonly apnsEndpoint = 'https://api.push.apple.com/3/device';
  private readonly webPushEndpoint = 'https://fcm.googleapis.com/fcm/send';
  
  private stats = {
    sent: 0,
    failed: 0,
    rateLimit: 0
  };

  constructor() {
    // Initialize stats from Redis on startup
    this.loadStats();
  }

  /**
   * Send push notification with automatic platform detection and retries
   */
  async sendPushNotification(payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Check rate limiting
      if (await this.isRateLimited(payload.pushToken)) {
        this.stats.rateLimit++;
        logger.warn('Notification rate limited for token:', {
          token: payload.pushToken.substring(0, 10) + '...',
          platform: payload.platform
        });
        return false;
      }

      // Apply rate limiting
      await this.applyRateLimit(payload.pushToken);

      let success = false;

      switch (payload.platform) {
        case 'ios':
          success = await this.sendAPNS(payload);
          break;
        case 'android':
          success = await this.sendFCM(payload);
          break;
        case 'web':
          success = await this.sendWebPush(payload);
          break;
        default:
          throw new Error(`Unsupported platform: ${payload.platform}`);
      }

      if (success) {
        this.stats.sent++;
        await this.trackDelivery(payload.pushToken, 'success');
      } else {
        this.stats.failed++;
        await this.trackDelivery(payload.pushToken, 'failed');
      }

      // Update stats in Redis
      await this.saveStats();

      return success;
    } catch (error) {
      this.stats.failed++;
      logger.error('Push notification failed:', {
        error: error instanceof Error ? error.message : String(error),
        platform: payload.platform,
        token: payload.pushToken.substring(0, 10) + '...'
      });
      
      await this.trackDelivery(payload.pushToken, 'error');
      await this.saveStats();
      
      return false;
    }
  }

  /**
   * Send bulk notifications efficiently
   */
  async sendBulkNotifications(
    notifications: PushNotificationPayload[]
  ): Promise<{ successful: number; failed: number; rateLimited: number }> {
    const results = {
      successful: 0,
      failed: 0,
      rateLimited: 0
    };

    // Process in batches to avoid overwhelming the services
    const batchSize = 100;
    const batches = this.chunkArray(notifications, batchSize);

    for (const batch of batches) {
      const batchPromises = batch.map(async (notification) => {
        try {
          const success = await this.sendPushNotification(notification);
          if (success) {
            results.successful++;
          } else {
            // Could be failed or rate limited, check which one
            if (await this.isRateLimited(notification.pushToken)) {
              results.rateLimited++;
            } else {
              results.failed++;
            }
          }
        } catch (error) {
          results.failed++;
        }
      });

      await Promise.allSettled(batchPromises);
      
      // Small delay between batches to avoid rate limiting
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    logger.info('Bulk notifications completed:', results);
    return results;
  }

  /**
   * Generate weather alert notifications
   */
  generateWeatherAlerts(
    weatherData: any,
    userPrefs: any,
    lastWeather?: any
  ): NotificationTemplate[] {
    const alerts: NotificationTemplate[] = [];
    const current = weatherData.current || weatherData;

    // Temperature alerts
    if (userPrefs.notifTempBelow && current.temperature < userPrefs.notifTempBelow) {
      if (!lastWeather || lastWeather.temperature >= userPrefs.notifTempBelow) {
        alerts.push({
          title: '🥶 Cold Weather Alert',
          body: `Temperature dropped to ${Math.round(current.temperature)}°C. Bundle up!`,
          data: {
            type: 'temperature_alert',
            temperature: current.temperature,
            threshold: userPrefs.notifTempBelow,
            action: 'check_clothing'
          },
          priority: 'high',
          sound: 'weather_alert.mp3'
        });
      }
    }

    if (userPrefs.notifTempAbove && current.temperature > userPrefs.notifTempAbove) {
      if (!lastWeather || lastWeather.temperature <= userPrefs.notifTempAbove) {
        alerts.push({
          title: '🌡️ Hot Weather Alert',
          body: `Temperature rose to ${Math.round(current.temperature)}°C. Stay cool and hydrated!`,
          data: {
            type: 'temperature_alert',
            temperature: current.temperature,
            threshold: userPrefs.notifTempAbove,
            action: 'stay_cool'
          },
          priority: 'normal',
          sound: 'default'
        });
      }
    }

    // Rain alerts
    const rainProb = current.precip_prob || current.precipitation_probability || 0;
    if (userPrefs.notifRainProb && rainProb > userPrefs.notifRainProb) {
      if (!lastWeather || (lastWeather.precip_prob || 0) <= userPrefs.notifRainProb) {
        const intensity = rainProb > 80 ? 'heavy' : rainProb > 60 ? 'moderate' : 'light';
        alerts.push({
          title: '🌧️ Rain Alert',
          body: `${rainProb}% chance of ${intensity} rain. ${intensity === 'heavy' ? 'Consider staying indoors!' : 'Don\'t forget your umbrella!'}`,
          data: {
            type: 'rain_alert',
            probability: rainProb,
            intensity,
            threshold: userPrefs.notifRainProb,
            action: 'take_umbrella'
          },
          priority: intensity === 'heavy' ? 'high' : 'normal',
          sound: 'rain_alert.mp3'
        });
      }
    }

    // Wind alerts
    const windSpeed = current.wind_speed || 0;
    if (windSpeed > 15) {
      alerts.push({
        title: '💨 Strong Wind Alert',
        body: `Strong winds of ${Math.round(windSpeed)} m/s. Be cautious outdoors!`,
        data: {
          type: 'wind_alert',
          windSpeed,
          action: 'be_cautious'
        },
        priority: windSpeed > 20 ? 'high' : 'normal',
        sound: 'default'
      });
    }

    // Severe weather alerts
    const symbolCode = current.symbol_code || '';
    if (symbolCode.includes('thunder')) {
      alerts.push({
        title: '⛈️ Thunderstorm Warning',
        body: 'Thunderstorms expected. Stay safe indoors!',
        data: {
          type: 'severe_weather',
          condition: 'thunderstorm',
          action: 'stay_indoors'
        },
        priority: 'high',
        sound: 'severe_weather.mp3'
      });
    }

    return alerts;
  }

  /**
   * Generate daily summary notifications
   */
  generateDailySummary(weatherData: any): NotificationTemplate {
    const today = weatherData.daily?.[0] || weatherData;
    const tomorrow = weatherData.daily?.[1];
    
    let summary = `Today: ${Math.round(today.maxTemp || today.temperature)}°`;
    if (today.minTemp) summary += `/${Math.round(today.minTemp)}°`;
    
    const condition = this.translateCondition(today.symbol_code || '');
    if (condition) summary += `, ${condition}`;
    
    if (tomorrow) {
      summary += `. Tomorrow: ${Math.round(tomorrow.maxTemp)}°`;
      if (tomorrow.minTemp) summary += `/${Math.round(tomorrow.minTemp)}°`;
    }

    return {
      title: '🌤️ Daily Weather Summary',
      body: summary,
      data: {
        type: 'daily_summary',
        today: today,
        tomorrow: tomorrow || null
      },
      sound: 'default'
    };
  }

  /**
   * Get notification statistics
   */
  async getStats(): Promise<any> {
    return {
      ...this.stats,
      deliveryRate: this.stats.sent + this.stats.failed > 0 ? 
        (this.stats.sent / (this.stats.sent + this.stats.failed) * 100).toFixed(2) : 0,
      timestamp: new Date().toISOString()
    };
  }

  // Private methods

  private async sendFCM(payload: PushNotificationPayload): Promise<boolean> {
    const fcmPayload = {
      to: payload.pushToken,
      priority: payload.priority === 'high' ? 'high' : 'normal',
      notification: {
        title: payload.title,
        body: payload.body,
        sound: payload.sound || 'default',
        badge: payload.badge
      },
      data: payload.data || {}
    };

    try {
      const response = await fetch(this.fcmEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `key=${env.FCM_SERVER_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fcmPayload)
      });

      const result = await response.json() as { success?: number; failure?: number; };
      
      if (response.ok && result.success === 1) {
        return true;
      } else {
        logger.error('FCM notification failed:', result);
        return false;
      }
    } catch (error) {
      logger.error('FCM request failed:', error);
      return false;
    }
  }

  private async sendAPNS(payload: PushNotificationPayload): Promise<boolean> {
    const apnsPayload = {
      aps: {
        alert: {
          title: payload.title,
          body: payload.body
        },
        badge: payload.badge,
        sound: payload.sound || 'default',
        'content-available': 1
      },
      data: payload.data || {}
    };

    try {
      const response = await fetch(`${this.apnsEndpoint}/${payload.pushToken}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.APNS_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
          'apns-topic': env.APNS_BUNDLE_ID || 'com.vaero.weather',
          'apns-priority': payload.priority === 'high' ? '10' : '5'
        },
        body: JSON.stringify(apnsPayload)
      });

      return response.ok;
    } catch (error) {
      logger.error('APNS request failed:', error);
      return false;
    }
  }

  private async sendWebPush(payload: PushNotificationPayload): Promise<boolean> {
    // Web push implementation would go here
    // For now, we'll use FCM for web push as well
    return this.sendFCM(payload);
  }

  private async isRateLimited(pushToken: string): Promise<boolean> {
    const key = `rate_limit:notification:${pushToken}`;
    const count = await redis.get(key);
    
    // Allow 10 notifications per hour per device
    return count ? parseInt(count) >= 10 : false;
  }

  private async applyRateLimit(pushToken: string): Promise<void> {
    const key = `rate_limit:notification:${pushToken}`;
    const current = await redis.get(key);
    
    if (current) {
      await redis.set(key, (parseInt(current) + 1).toString(), 'EX', 3600);
    } else {
      await redis.set(key, '1', 'EX', 3600);
    }
  }

  private async trackDelivery(pushToken: string, status: 'success' | 'failed' | 'error'): Promise<void> {
    const key = `delivery:${pushToken.substring(0, 8)}:${new Date().toISOString().split('T')[0]}`;
    await redis.set(key, status, 'EX', 86400 * 7); // Keep for 7 days
  }

  private async loadStats(): Promise<void> {
    try {
      const statsKey = 'notification_stats';
      const cached = await redis.get(statsKey);
      if (cached) {
        const savedStats = JSON.parse(cached);
        this.stats = { ...this.stats, ...savedStats };
      }
    } catch (error) {
      logger.warn('Failed to load notification stats:', error);
    }
  }

  private async saveStats(): Promise<void> {
    try {
      const statsKey = 'notification_stats';
      await redis.set(statsKey, JSON.stringify(this.stats), 'EX', 86400);
    } catch (error) {
      logger.warn('Failed to save notification stats:', error);
    }
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private translateCondition(symbolCode: string): string {
    const translations: Record<string, string> = {
      'clearsky': 'clear skies',
      'fair': 'fair weather',
      'partlycloudy': 'partly cloudy',
      'cloudy': 'cloudy',
      'lightrainshowers': 'light showers',
      'rainshowers': 'rain showers',
      'heavyrainshowers': 'heavy showers',
      'lightrain': 'light rain',
      'rain': 'rain',
      'heavyrain': 'heavy rain',
      'snow': 'snow',
      'fog': 'fog',
      'thunderstorm': 'thunderstorms'
    };

    const baseCode = symbolCode.replace(/_day|_night|_polartwilight/g, '');
    return translations[baseCode] || '';
  }
}

export default new NotificationService();

