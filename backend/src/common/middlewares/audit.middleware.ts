import { Request, Response, NextFunction } from 'express';
import { AuditAction } from '@prisma/client';
import prisma from '../../config/prisma';
import logger from '../../config/logger';

export const logAudit = (entityType: string, action: AuditAction) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Intercept finish event to ensure status code is 2xx before writing audit log
    const originalJson = res.json;

    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = body?.data?.id || req.params?.id || null;
        
        prisma.auditLog
          .create({
            data: {
              userId: req.user?.userId || null,
              action,
              entityType,
              entityId,
              method: req.method,
              path: req.originalUrl,
              ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
              userAgent: req.headers['user-agent'] || null,
              payloadAfter: req.body ? req.body : undefined,
            },
          })
          .catch((err) => {
            logger.error({ err }, 'Failed to write audit log');
          });
      }
      return originalJson.call(this, body);
    };

    next();
  };
};
