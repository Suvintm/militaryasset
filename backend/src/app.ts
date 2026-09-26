import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import env from './config/env';
import apiRoutes from './routes';
import { errorHandler } from './common/middlewares/error.middleware';
import { ApiError } from './common/utils/ApiError';

export const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
const configuredOrigins = (env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        configuredOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting for API protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 1000,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Root endpoint - System Info & Status
app.get('/', (_req, res) => {
  res.status(200).json({
    system: 'Military Asset Management System (MAMS) - RESTful API',
    status: 'operational',
    version: '1.0.1',
    ministry: 'Ministry of Defence, Government of India',
    endpoints: {
      health: '/health',
      apiBase: '/api/v1',
      documentation: '/api/v1/docs',
    },
    frontendApp: 'https://militaryasset-three.vercel.app',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount API v1 routes
app.use('/api/v1', apiRoutes);

// Catch 404
app.use((_req, _res, next) => {
  next(ApiError.notFound('Requested API endpoint does not exist'));
});

// Global Error Handler
app.use(errorHandler);

export default app;
