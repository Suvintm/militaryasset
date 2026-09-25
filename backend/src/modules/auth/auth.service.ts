import prisma from '../../config/prisma';
import { comparePassword, hashPassword } from '../../common/utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../common/utils/jwt';
import { ApiError } from '../../common/utils/ApiError';
import { AuditAction } from '@prisma/client';

export class AuthService {
  static async login(email: string, password: string, ip?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        base: {
          select: { id: true, name: true, location: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Invalid email or password credentials');
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized('Invalid email or password credentials');
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      baseId: user.baseId,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token hash
    const tokenHash = await hashPassword(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Record login audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: AuditAction.LOGIN,
        entityType: 'AUTH',
        entityId: user.id,
        method: 'POST',
        path: '/api/v1/auth/login',
        ip: ip || '127.0.0.1',
        userAgent: userAgent || null,
      },
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      baseId: user.baseId,
      base: user.base,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    return { user: safeUser, accessToken, refreshToken };
  }

  static async refresh(refreshTokenString: string) {
    try {
      const decoded = verifyRefreshToken(refreshTokenString);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        throw ApiError.unauthorized('User not found or account is deactivated');
      }

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        baseId: user.baseId,
      };

      const accessToken = generateAccessToken(tokenPayload);

      return { accessToken };
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  }

  static async logout(userId: string, ip?: string, userAgent?: string) {
    // Revoke all refresh tokens for this user
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: AuditAction.LOGOUT,
        entityType: 'AUTH',
        entityId: userId,
        method: 'POST',
        path: '/api/v1/auth/logout',
        ip: ip || '127.0.0.1',
        userAgent: userAgent || null,
      },
    });

    return { message: 'Logged out successfully' };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        baseId: true,
        isActive: true,
        createdAt: true,
        base: {
          select: { id: true, name: true, location: true },
        },
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }
}
