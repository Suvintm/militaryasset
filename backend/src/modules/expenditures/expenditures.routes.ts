import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { requireRole, getScopedBaseId } from '../../common/middlewares/rbac.middleware';
import { z } from 'zod';
import { Role, AuditAction } from '@prisma/client';

const router = Router();

router.use(authenticate);

// GET /api/v1/expenditures
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { baseId, from, to } = req.query as any;
    const scopedBase = getScopedBaseId(req.user!, baseId);

    const where: any = {};
    if (scopedBase) where.baseId = scopedBase;
    if (from || to) {
      where.expendedAt = {};
      if (from) where.expendedAt.gte = new Date(from);
      if (to) where.expendedAt.lte = new Date(to);
    }

    const expenditures = await prisma.expenditure.findMany({
      where,
      include: {
        base: true,
        equipmentType: true,
        expendedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { expendedAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: expenditures });
  })
);

// POST /api/v1/expenditures
router.post(
  '/',
  requireRole(Role.ADMIN, Role.BASE_COMMANDER),
  asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      baseId: z.string().min(1),
      equipmentTypeId: z.string().min(1),
      quantity: z.number().int().positive(),
      reason: z.string().min(2),
    });

    const body = schema.parse(req.body);
    const targetBaseId = getScopedBaseId(req.user!, body.baseId)!;

    const expenditure = await prisma.expenditure.create({
      data: {
        baseId: targetBaseId,
        equipmentTypeId: body.equipmentTypeId,
        quantity: body.quantity,
        reason: body.reason,
        expendedById: req.user!.userId,
      },
      include: { base: true, equipmentType: true },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: AuditAction.CREATE,
        entityType: 'EXPENDITURE',
        entityId: expenditure.id,
        method: 'POST',
        path: '/api/v1/expenditures',
        ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
        payloadAfter: body,
      },
    });

    return res.status(201).json({ success: true, data: expenditure });
  })
);

export default router;
