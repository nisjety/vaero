import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import {
  getUserPrefs,
  updateUserPrefs,
  registerDevice,
  unregisterDevice,
  getUserDevices,
} from '../controllers/user.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// User preferences routes
router.get('/me/prefs', getUserPrefs);
router.put('/me/prefs', updateUserPrefs);

// Device management routes
router.get('/me/devices', getUserDevices);
router.post('/me/devices', registerDevice);
router.delete('/me/devices/:deviceId', unregisterDevice);

export default router;
