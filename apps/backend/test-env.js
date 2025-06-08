require('dotenv/config');
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL ? 'PRESENT' : 'MISSING',
  REDIS_URL: process.env.REDIS_URL ? 'PRESENT' : 'MISSING',
  YR_USER_AGENT: process.env.YR_USER_AGENT ? 'PRESENT' : 'MISSING',
  YR_FROM_EMAIL: process.env.YR_FROM_EMAIL ? 'PRESENT' : 'MISSING',
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY ? 'PRESENT' : 'MISSING',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? 'PRESENT' : 'MISSING',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'PRESENT' : 'MISSING',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? 'PRESENT' : 'MISSING',
});
