import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

function cleanDatabaseUrl(raw?: string): string {
  if (!raw) return '';
  let str = raw.trim();
  // Handle multi-line strings if user accidentally pasted multiple variables into one input
  if (str.includes('\n')) {
    const lines = str.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const valid = lines.find((l) => l.includes('postgres://') || l.includes('postgresql://'));
    if (valid) {
      str = valid;
    }
  }
  // Strip any leading "DATABASE_URL=" or "NEON_DATABASE_URL=" if user pasted with key name
  str = str.replace(/^[A-Za-z0-9_]+=\s*/, '').trim();
  return str;
}

const cleanedNeon = cleanDatabaseUrl(process.env.NEON_DATABASE_URL);
const cleanedDb = cleanDatabaseUrl(process.env.DATABASE_URL);

// Prioritize NEON_DATABASE_URL if provided, else DATABASE_URL, else local fallback
const activeDatabaseUrl = 
  cleanedNeon !== ''
    ? cleanedNeon
    : cleanedDb !== ''
    ? cleanedDb
    : 'postgresql://postgres:postgrespassword@localhost:5432/mams_db?schema=public';

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
