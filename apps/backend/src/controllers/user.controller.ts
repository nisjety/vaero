import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';

const userPrefsSchema = z.object({
  unit: z.enum(['metric', 'imperial']).default('metric'),
  timeFormat: z.enum(['24h', '12h']).default('24h'),
  defaultLat: z.number().optional(),
  defaultLon: z.number().optional(),
  notifTempBelow: z.number().optional(),
  notifTempAbove: z.number().optional(),
  notifRainProb: z.number().min(0).max(100).optional(),
  stylePreferences: z
    .object({
      gender: z.string().optional(),
      style: z.string().optional(),
      owns: z.array(z.string()).optional(),
    })
    .optional(),
});

export const getUserPrefs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userPrefs = await prisma.userPrefs.findUnique({
      where: { userId: req.user.id },
    });

    res.json(userPrefs || {});
  } catch (error) {
    logger.error('Failed to get user preferences:', error);
    res.status(500).json({ error: 'Failed to get user preferences' });
  }
};

export const updateUserPrefs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = userPrefsSchema.parse(req.body);

    const userPrefs = await prisma.userPrefs.upsert({
      where: { userId: req.user.id },
      update: validatedData,
      create: {
        userId: req.user.id,
        ...validatedData,
      },
    });

    res.json(userPrefs);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid preferences data', details: error.errors });
    }
    logger.error('Failed to update user preferences:', error);
    res.status(500).json({ error: 'Failed to update user preferences' });
  }
};

const deviceSchema = z.object({
  platform: z.enum(['ios', 'android', 'web']),
  pushToken: z.string(),
});

export const registerDevice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = deviceSchema.parse(req.body);

    // Check if device already exists
    const existingDevice = await prisma.device.findFirst({
      where: {
        userId: req.user.id,
        pushToken: validatedData.pushToken,
      },
    });

    if (existingDevice) {
      return res.json(existingDevice);
    }

    const device = await prisma.device.create({
      data: {
        userId: req.user.id,
        ...validatedData,
      },
    });

    logger.info(`Device registered for user ${req.user.id}:`, {
      deviceId: device.id,
      platform: device.platform,
    });

    res.status(201).json(device);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid device data', details: error.errors });
    }
    logger.error('Failed to register device:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
};

export const unregisterDevice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deviceId = parseInt(req.params.deviceId);

    if (isNaN(deviceId)) {
      return res.status(400).json({ error: 'Invalid device ID' });
    }

    const device = await prisma.device.findFirst({
      where: {
        id: deviceId,
        userId: req.user.id,
      },
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    await prisma.device.delete({
      where: { id: deviceId },
    });

    logger.info(`Device unregistered for user ${req.user.id}:`, {
      deviceId: device.id,
      platform: device.platform,
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Failed to unregister device:', error);
    res.status(500).json({ error: 'Failed to unregister device' });
  }
};

export const getUserDevices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const devices = await prisma.device.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(devices);
  } catch (error) {
    logger.error('Failed to get user devices:', error);
    res.status(500).json({ error: 'Failed to get user devices' });
  }
};