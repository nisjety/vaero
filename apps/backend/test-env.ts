import 'dotenv/config';
import { env } from './src/utils/env.js';

console.log('Environment parsing successful:', {
  NODE_ENV: env.NODE_ENV,
  PORT: env.PORT,
  DATABASE_URL: env.DATABASE_URL ? 'PRESENT' : 'MISSING',
});
