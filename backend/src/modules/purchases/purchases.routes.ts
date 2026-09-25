import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { getScopedBaseId } from '../../common/middlewares/rbac.middleware';
import { z } from 'zod';
import { AuditAction } from '@prisma/client';

const router = Router();

router.use(authenticate);

// GET /api/v1/purchases
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { baseId, equipmentTypeId, from, to } = req.query as any;
    const scopedBaseId = getScopedBaseId(req.user!, baseId);

    const where: any = {};
    if (scopedBaseId) where.baseId = scopedBaseId;
    if (equipmentTypeId) where.equipmentTypeId = equipmentTypeId;
    if (from || to) {
      where.purchaseDate = {};
      if (from) where.purchaseDate.gte = new Date(from);
      if (to) where.purchaseDate.lte = new Date(to);
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        base: true,
        equipmentType: true,
        recordedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { purchaseDate: 'desc' },
    });

    return res.status(200).json({ success: true, data: purchases });
  })
);

// POST /api/v1/purchases (Atomic Transaction: create purchase + increment stock_balances)
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      baseId: z.string().min(1),
      equipmentTypeId: z.string().min(1),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
      supplier: z.string().min(1),
      purchaseDate: z.string().or(z.date()),
      notes: z.string().optional(),
    });

    const body = schema.parse(req.body);
    const targetBaseId = getScopedBaseId(req.user!, body.baseId)!;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Purchase
      const purchase = await tx.purchase.create({
        data: {
          baseId: targetBaseId,
          equipmentTypeId: body.equipmentTypeId,
          quantity: body.quantity,
          unitPrice: body.unitPrice,
          supplier: body.supplier,
          purchaseDate: new Date(body.purchaseDate),
          notes: body.notes,
          recordedById: req.user!.userId,
        },
        include: { base: true, equipmentType: true },
      });

      // 2. Atomic Stock Balance Upsert
      await tx.stockBalance.upsert({
        where: {
          baseId_equipmentTypeId: {
            baseId: targetBaseId,
            equipmentTypeId: body.equipmentTypeId,
          },
        },
        update: {
          quantity: { increment: body.quantity },
        },
        create: {
          baseId: targetBaseId,
          equipmentTypeId: body.equipmentTypeId,
          quantity: body.quantity,
        },
      });

      // 3. System Audit Log
      await tx.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: AuditAction.CREATE,
          entityType: 'PURCHASE',
          entityId: purchase.id,
          method: 'POST',
          path: '/api/v1/purchases',
          ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
          payloadAfter: body,
        },
      });

      return purchase;
    });

    return res.status(201).json({ success: true, data: result });
  })
);

export default router;
