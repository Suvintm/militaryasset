import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { TokenPayload } from '../utils/jwt';

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Role ${req.user.role} does not have required permissions.`
        )
      );
    }

    next();
  };
};

/**
 * Validates and enforces base-level scoping according to user role.
 * - ADMIN can view/operate on any base.
 * - BASE_COMMANDER is strictly constrained to their assigned baseId.
 */
export const getScopedBaseId = (user: TokenPayload, requestedBaseId?: string): string | undefined => {
  if (user.role === Role.ADMIN) {
    return requestedBaseId || undefined;
  }

  if (user.role === Role.BASE_COMMANDER) {
    if (!user.baseId) {
      throw ApiError.forbidden('Base Commander is not assigned to any military base');
    }
    if (requestedBaseId && requestedBaseId !== user.baseId) {
      throw ApiError.forbidden('Base Commanders may only access data for their assigned base');
    }
    return user.baseId;
  }

  // Logistics Officer
  return requestedBaseId || user.baseId || undefined;
};
