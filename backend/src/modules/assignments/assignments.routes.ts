import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { requireRole, getScopedBaseId } from '../../common/middlewares/rbac.middleware';
import { ApiError } from '../../common/utils/ApiError';
import { z } from 'zod';
import { Role, AssignmentStatus, AuditAction } from '@prisma/client';

const router = Router();

router.use(authenticate);

// GET /api/v1/assignments
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { baseId, status } = req.query as any;
    const scopedBase = getScopedBaseId(req.user!, baseId);

    const where: any = {};
    if (scopedBase) where.baseId = scopedBase;
    if (status) where.status = status;

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        base: true,
        equipmentType: true,
        assignedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: assignments });
  })
);

// POST /api/v1/assignments (Admin or Base Commander)
router.post(
  '/',
  requireRole(Role.ADMIN, Role.BASE_COMMANDER),
  asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      baseId: z.string().min(1),
      equipmentTypeId: z.string().min(1),
      personnelName: z.string().min(2),
      personnelId: z.string().min(2),
      quantity: z.number().int().positive(),
      notes: z.string().optional(),
    });

    const body = schema.parse(req.body);
    const targetBaseId = getScopedBaseId(req.user!, body.baseId)!;

    const assignment = await prisma.assignment.create({
      data: {
        baseId: targetBaseId,
        equipmentTypeId: body.equipmentTypeId,
        personnelName: body.personnelName,
        personnelId: body.personnelId,
        quantity: body.quantity,
        status: AssignmentStatus.ACTIVE,
        notes: body.notes,
        assignedById: req.user!.userId,
      },
      include: { base: true, equipmentType: true },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: AuditAction.CREATE,
        entityType: 'ASSIGNMENT',
        entityId: assignment.id,
        method: 'POST',
        path: '/api/v1/assignments',
        ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
        payloadAfter: body,
      },
    });

    return res.status(201).json({ success: true, data: assignment });
  })
);

// PATCH /api/v1/assignments/:id/return
router.patch(
  '/:id/return',
  requireRole(Role.ADMIN, Role.BASE_COMMANDER),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const existing = await prisma.assignment.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('Assignment record not found');
    if (existing.status === AssignmentStatus.RETURNED) {
      throw ApiError.badRequest('Asset has already been marked as returned');
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        status: AssignmentStatus.RETURNED,
        returnedAt: new Date(),
      },
      include: { base: true, equipmentType: true },
    });

    return res.status(200).json({ success: true, data: updated });
  })
);

export default router;
