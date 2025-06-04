import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  OPENAI_API_KEY: z.string(),
  YR_USER_AGENT: z.string(),
  YR_FROM_EMAIL: z.string().email(),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string().optional(),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().url().optional(),
  EXPO_ACCESS_TOKEN: z.string().optional(),
});

export type Environment = z.infer<typeof envSchema>;

let env: Environment;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment variables:', error);
  process.exit(1);
}

export { env };