import app from './app';
import env from './config/env';
import logger from './config/logger';
import prisma from './config/prisma';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`MAMS Backend Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`API Base URL: http://localhost:${PORT}/api/v1`);
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Database connections closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
