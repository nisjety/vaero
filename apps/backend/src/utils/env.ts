// utils/env.ts - Environment configuration with validation
import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  
  // Database
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  
  // Redis
  REDIS_URL: z.string().min(1, 'Redis URL is required'),
  
  // YR API
  YR_USER_AGENT: z.string().min(1, 'YR User Agent is required'),
  YR_FROM_EMAIL: z.string().email('YR From Email must be valid email'),
  
  // Clerk Authentication
  CLERK_PUBLISHABLE_KEY: z.string().min(1, 'Clerk publishable key is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'Clerk secret key is required'),
  
  // OpenAI (Premium features)
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  
  // Push Notifications
  EXPO_ACCESS_TOKEN: z.string().optional(),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),
  FCM_SERVER_KEY: z.string().optional(),
  APNS_AUTH_TOKEN: z.string().optional(),
  APNS_BUNDLE_ID: z.string().optional(),
  
  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3001'),
  
  // AI Models (Optional)
  AI_ONNX_MODEL_PATH: z.string().optional(),
  AI_ENABLE_BACKGROUND_PROCESSING: z.string().default('true'),
  
  // Rate Limiting
  RATE_LIMIT_FREE: z.coerce.number().default(200),
  RATE_LIMIT_PREMIUM: z.coerce.number().default(100),
  RATE_LIMIT_AI: z.coerce.number().default(10),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const env = parseEnv();