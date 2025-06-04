import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import webpush from 'web-push';
import { env } from '../utils/env';
import { logger } from '../utils/logger';

// Initialize Expo SDK
const expo = new Expo({
  accessToken: env.EXPO_ACCESS_TOKEN,
  useFcmV1: true,
});

// Configure web push (only if valid VAPID keys are provided)
if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT && 
    env.VAPID_PUBLIC_KEY !== 'placeholder-vapid-public-key' &&
    env.VAPID_PRIVATE_KEY !== 'placeholder-vapid-private-key') {
  try {
    webpush.setVapidDetails(
      env.VAPID_SUBJECT,
      env.VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY
    );
    logger.info('✅ Web push VAPID configured');
  } catch (error) {
    logger.warn('⚠️ Invalid VAPID keys provided, web push disabled:', error);
  }
} else {
  logger.info('ℹ️ No valid VAPID keys provided, web push disabled');
}

export interface PushNotificationData {
  pushToken: string;
  platform: 'ios' | 'android' | 'web';
  title: string;
  body: string;
  data?: Record<string, string>;
}

export const sendPushNotification = async ({
  pushToken,
  platform,
  title,
  body,
  data = {},
}: PushNotificationData): Promise<void> => {
  try {
    if (platform === 'web') {
      // Send web push notification
      await sendWebPushNotification(pushToken, title, body, data);
    } else {
      // Send Expo push notification (iOS/Android)
      await sendExpoPushNotification(pushToken, title, body, data);
    }

    logger.info({ platform, title }, 'Push notification sent successfully');
  } catch (error) {
    logger.error({ error, platform, title }, 'Failed to send push notification');
    throw error;
  }
};

const sendExpoPushNotification = async (
  pushToken: string,
  title: string,
  body: string,
  data: Record<string, string>
): Promise<void> => {
  // Check if the push token is valid
  if (!Expo.isExpoPushToken(pushToken)) {
    logger.error({ pushToken }, 'Invalid Expo push token');
    throw new Error('Invalid Expo push token');
  }

  const message: ExpoPushMessage = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
    badge: 1,
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    // Check for errors in tickets
    for (const ticket of tickets) {
      if (ticket.status === 'error') {
        logger.error(
          {
            error: ticket.message,
            details: ticket.details,
            pushToken,
          },
          'Expo push notification failed'
        );
        throw new Error(`Expo push notification failed: ${ticket.message}`);
      }
    }
  } catch (error) {
    logger.error({ error, pushToken }, 'Failed to send Expo push notification');
    throw error;
  }
};

const sendWebPushNotification = async (
  subscription: string,
  title: string,
  body: string,
  data: Record<string, string>
): Promise<void> => {
  try {
    const payload = JSON.stringify({
      title,
      body,
      data,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
    });

    // Parse the subscription string (should be JSON)
    const parsedSubscription = JSON.parse(subscription);

    await webpush.sendNotification(parsedSubscription, payload);
  } catch (error) {
    logger.error({ error, subscription }, 'Failed to send web push notification');
    throw error;
  }
};

export const sendBulkNotifications = async (
  notifications: PushNotificationData[]
): Promise<void> => {
  const promises = notifications.map((notification) =>
    sendPushNotification(notification).catch((error) => {
      logger.error(
        { error, pushToken: notification.pushToken, platform: notification.platform },
        'Failed to send notification in bulk'
      );
      // Don't throw to prevent stopping other notifications
      return null;
    })
  );

  await Promise.all(promises);
  logger.info({ count: notifications.length }, 'Bulk notifications processed');
};

export const validatePushToken = (token: string, platform: 'ios' | 'android' | 'web'): boolean => {
  if (platform === 'web') {
    try {
      JSON.parse(token);
      return true;
    } catch {
      return false;
    }
  }

  return Expo.isExpoPushToken(token);
};

// Default export for the notification service
const notificationService = {
  sendPushNotification,
  sendBulkNotifications,
  validatePushToken,
};

export default notificationService;
