import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Prioritize NEON_DATABASE_URL if provided
const activeDatabaseUrl = 
  process.env.NEON_DATABASE_URL && process.env.NEON_DATABASE_URL.trim() !== ''
    ? process.env.NEON_DATABASE_URL.trim()
    : process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/mams_db?schema=public';

process.env.DATABASE_URL = activeDatabaseUrl;

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEON_DATABASE_URL: z.string().optional().default(''),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 chars'),
  JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET must be at least 10 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const _env = envSchema.safeParse({
  ...process.env,
  DATABASE_URL: activeDatabaseUrl,
});

if (!_env.success) {
  console.error('Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
export default env;
