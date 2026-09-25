import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { requireRole } from '../../common/middlewares/rbac.middleware';
import { ApiError } from '../../common/utils/ApiError';
import { z } from 'zod';
import { TransferStatus, Role, AuditAction } from '@prisma/client';

const router = Router();

router.use(authenticate);

// GET /api/v1/transfers
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { baseId, status, from, to } = req.query as any;

    const where: any = {};
    if (status) where.status = status;

    if (req.user?.role === Role.BASE_COMMANDER) {
      where.OR = [{ fromBaseId: req.user.baseId }, { toBaseId: req.user.baseId }];
    } else if (baseId) {
      where.OR = [{ fromBaseId: baseId }, { toBaseId: baseId }];
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const transfers = await prisma.transfer.findMany({
      where,
      include: {
        fromBase: true,
        toBase: true,
        equipmentType: true,
        initiatedBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        events: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: transfers });
  })
);

// POST /api/v1/transfers (Initiate)
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      fromBaseId: z.string().min(1),
      toBaseId: z.string().min(1),
      equipmentTypeId: z.string().min(1),
      quantity: z.number().int().positive(),
      notes: z.string().optional(),
    });

    const body = schema.parse(req.body);

    if (body.fromBaseId === body.toBaseId) {
      throw ApiError.badRequest('Source and destination bases cannot be identical');
    }

    // Check stock sufficiency at source base
    const sourceStock = await prisma.stockBalance.findUnique({
      where: {
        baseId_equipmentTypeId: {
          baseId: body.fromBaseId,
          equipmentTypeId: body.equipmentTypeId,
        },
      },
    });

    if (!sourceStock || sourceStock.quantity < body.quantity) {
      throw ApiError.badRequest(
        `Insufficient inventory balance at origin base. Available: ${sourceStock?.quantity || 0}`
      );
    }

    const transfer = await prisma.transfer.create({
      data: {
        fromBaseId: body.fromBaseId,
        toBaseId: body.toBaseId,
        equipmentTypeId: body.equipmentTypeId,
        quantity: body.quantity,
        status: TransferStatus.PENDING,
        notes: body.notes,
        initiatedById: req.user!.userId,
        events: {
          create: {
            status: TransferStatus.PENDING,
            note: 'Transfer request submitted',
            actorId: req.user!.userId,
          },
        },
      },
      include: { fromBase: true, toBase: true, equipmentType: true, events: true },
    });

    return res.status(201).json({ success: true, data: transfer });
  })
);

// PATCH /api/v1/transfers/:id/approve (Admin or Base Commander)
router.patch(
  '/:id/approve',
  requireRole(Role.ADMIN, Role.BASE_COMMANDER),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const existing = await prisma.transfer.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('Transfer record not found');
    if (existing.status !== TransferStatus.PENDING) {
      throw ApiError.badRequest(`Cannot approve transfer in ${existing.status} status`);
    }

    const updated = await prisma.transfer.update({
      where: { id },
      data: {
        status: TransferStatus.APPROVED,
        approvedById: req.user!.userId,
        events: {
          create: {
            status: TransferStatus.APPROVED,
            note: 'Transfer approved by commanding officer',
            actorId: req.user!.userId,
          },
        },
      },
      include: { events: true },
    });

    return res.status(200).json({ success: true, data: updated });
  })
);

// PATCH /api/v1/transfers/:id/complete (ATOMIC DEBIT/CREDIT IN TRANSACTION)
router.patch(
  '/:id/complete',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.findUnique({ where: { id } });
      if (!transfer) throw ApiError.notFound('Transfer record not found');
      if (transfer.status !== TransferStatus.APPROVED) {
        throw ApiError.badRequest('Only APPROVED transfers can be completed');
      }

      // 1. Debit from source base
      const source = await tx.stockBalance.findUnique({
        where: {
          baseId_equipmentTypeId: {
            baseId: transfer.fromBaseId,
            equipmentTypeId: transfer.equipmentTypeId,
          },
        },
      });

      if (!source || source.quantity < transfer.quantity) {
        throw ApiError.badRequest('Insufficient source stock at time of completion');
      }

      await tx.stockBalance.update({
        where: { id: source.id },
        data: { quantity: { decrement: transfer.quantity } },
      });

      // 2. Credit to destination base
      await tx.stockBalance.upsert({
        where: {
          baseId_equipmentTypeId: {
            baseId: transfer.toBaseId,
            equipmentTypeId: transfer.equipmentTypeId,
          },
        },
        update: { quantity: { increment: transfer.quantity } },
        create: {
          baseId: transfer.toBaseId,
          equipmentTypeId: transfer.equipmentTypeId,
          quantity: transfer.quantity,
        },
      });

      // 3. Update Transfer to COMPLETED
      const completed = await tx.transfer.update({
        where: { id },
        data: {
          status: TransferStatus.COMPLETED,
          completedAt: new Date(),
          events: {
            create: {
              status: TransferStatus.COMPLETED,
              note: 'Consignment verified and stock credited to destination base',
              actorId: req.user!.userId,
            },
          },
        },
        include: { fromBase: true, toBase: true, equipmentType: true, events: true },
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: AuditAction.UPDATE,
          entityType: 'TRANSFER',
          entityId: id,
          method: 'PATCH',
          path: `/api/v1/transfers/${id}/complete`,
          ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
          payloadAfter: { transferId: id, status: 'COMPLETED' },
        },
      });

      return completed;
    });

    return res.status(200).json({ success: true, data: result });
  })
);

// PATCH /api/v1/transfers/:id/cancel
router.patch(
  '/:id/cancel',
  requireRole(Role.ADMIN, Role.BASE_COMMANDER),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const existing = await prisma.transfer.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('Transfer not found');
    if (existing.status === TransferStatus.COMPLETED) {
      throw ApiError.badRequest('Completed transfers cannot be cancelled');
    }

    const updated = await prisma.transfer.update({
      where: { id },
      data: {
        status: TransferStatus.CANCELLED,
        events: {
          create: {
            status: TransferStatus.CANCELLED,
            note: 'Transfer cancelled by officer',
            actorId: req.user!.userId,
          },
        },
      },
      include: { events: true },
    });

    return res.status(200).json({ success: true, data: updated });
  })
);

export default router;
