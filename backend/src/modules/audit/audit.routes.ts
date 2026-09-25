import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { requireRole } from '../../common/middlewares/rbac.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, requireRole(Role.ADMIN));

// GET /api/v1/audit-logs
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { entityType, userId, from, to } = req.query as any;

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.status(200).json({ success: true, data: logs });
  })
);

export default router;
