import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { getScopedBaseId } from '../../common/middlewares/rbac.middleware';
import { TransferStatus, AssignmentStatus } from '@prisma/client';

const router = Router();

router.use(authenticate);

// GET /api/v1/dashboard/summary
router.get(
  '/summary',
  asyncHandler(async (req: Request, res: Response) => {
    const { baseId, equipmentTypeId, from, to } = req.query as any;
    const scopedBaseId = getScopedBaseId(req.user!, baseId);

    // Build filters for purchases, transfers, assignments, expenditures
    const purchaseWhere: any = {};
    if (scopedBaseId) purchaseWhere.baseId = scopedBaseId;
    if (equipmentTypeId) purchaseWhere.equipmentTypeId = equipmentTypeId;
    if (from || to) {
      purchaseWhere.purchaseDate = {};
      if (from) purchaseWhere.purchaseDate.gte = new Date(from);
      if (to) purchaseWhere.purchaseDate.lte = new Date(to);
    }

    const transferInWhere: any = { status: TransferStatus.COMPLETED };
    if (scopedBaseId) transferInWhere.toBaseId = scopedBaseId;
    if (equipmentTypeId) transferInWhere.equipmentTypeId = equipmentTypeId;
    if (from || to) {
      transferInWhere.completedAt = {};
      if (from) transferInWhere.completedAt.gte = new Date(from);
      if (to) transferInWhere.completedAt.lte = new Date(to);
    }

    const transferOutWhere: any = { status: TransferStatus.COMPLETED };
    if (scopedBaseId) transferOutWhere.fromBaseId = scopedBaseId;
    if (equipmentTypeId) transferOutWhere.equipmentTypeId = equipmentTypeId;
    if (from || to) {
      transferOutWhere.completedAt = {};
      if (from) transferOutWhere.completedAt.gte = new Date(from);
      if (to) transferOutWhere.completedAt.lte = new Date(to);
    }

    const assignWhere: any = { status: AssignmentStatus.ACTIVE };
    if (scopedBaseId) assignWhere.baseId = scopedBaseId;
    if (equipmentTypeId) assignWhere.equipmentTypeId = equipmentTypeId;
    if (from || to) {
      assignWhere.assignedAt = {};
      if (from) assignWhere.assignedAt.gte = new Date(from);
      if (to) assignWhere.assignedAt.lte = new Date(to);
    }

    const expendWhere: any = {};
    if (scopedBaseId) expendWhere.baseId = scopedBaseId;
    if (equipmentTypeId) expendWhere.equipmentTypeId = equipmentTypeId;
    if (from || to) {
      expendWhere.expendedAt = {};
      if (from) expendWhere.expendedAt.gte = new Date(from);
      if (to) expendWhere.expendedAt.lte = new Date(to);
    }

    // Execute aggregations in parallel
    const [
      purchasesAgg,
      transfersInAgg,
      transfersOutAgg,
      assignedAgg,
      expendedAgg,
      currentStockAgg,
    ] = await Promise.all([
      prisma.purchase.aggregate({
        where: purchaseWhere,
        _sum: { quantity: true },
      }),
      prisma.transfer.aggregate({
        where: transferInWhere,
        _sum: { quantity: true },
      }),
      prisma.transfer.aggregate({
        where: transferOutWhere,
        _sum: { quantity: true },
      }),
      prisma.assignment.aggregate({
        where: assignWhere,
        _sum: { quantity: true },
      }),
      prisma.expenditure.aggregate({
        where: expendWhere,
        _sum: { quantity: true },
      }),
      prisma.stockBalance.aggregate({
        where: {
          ...(scopedBaseId ? { baseId: scopedBaseId } : {}),
          ...(equipmentTypeId ? { equipmentTypeId } : {}),
        },
        _sum: { quantity: true },
      }),
    ]);

    const totalPurchases = purchasesAgg._sum.quantity || 0;
    const totalTransfersIn = transfersInAgg._sum.quantity || 0;
    const totalTransfersOut = transfersOutAgg._sum.quantity || 0;
    const totalAssigned = assignedAgg._sum.quantity || 0;
    const totalExpended = expendedAgg._sum.quantity || 0;

    const netMovement = totalPurchases + totalTransfersIn - totalTransfersOut;
    const currentStock = currentStockAgg._sum.quantity || 0;

    // Opening Balance = Current Stock - Net Movement during selected window
    const openingBalance = Math.max(0, currentStock - netMovement);
    const closingBalance = openingBalance + netMovement;

    return res.status(200).json({
      success: true,
      data: {
        openingBalance,
        closingBalance,
        netMovement,
        purchases: totalPurchases,
        transfersIn: totalTransfersIn,
        transfersOut: totalTransfersOut,
        assigned: totalAssigned,
        expended: totalExpended,
      },
    });
  })
);

// GET /api/v1/dashboard/net-movement/detail (for Bonus Modal)
router.get(
  '/net-movement/detail',
  asyncHandler(async (req: Request, res: Response) => {
    const { baseId, equipmentTypeId, from, to } = req.query as any;
    const scopedBaseId = getScopedBaseId(req.user!, baseId);

    const purchaseWhere: any = {};
    if (scopedBaseId) purchaseWhere.baseId = scopedBaseId;
    if (equipmentTypeId) purchaseWhere.equipmentTypeId = equipmentTypeId;
    if (from || to) {
      purchaseWhere.purchaseDate = {};
      if (from) purchaseWhere.purchaseDate.gte = new Date(from);
      if (to) purchaseWhere.purchaseDate.lte = new Date(to);
    }

    const transferInWhere: any = { status: TransferStatus.COMPLETED };
    if (scopedBaseId) transferInWhere.toBaseId = scopedBaseId;
    if (equipmentTypeId) transferInWhere.equipmentTypeId = equipmentTypeId;

    const transferOutWhere: any = { status: TransferStatus.COMPLETED };
    if (scopedBaseId) transferOutWhere.fromBaseId = scopedBaseId;
    if (equipmentTypeId) transferOutWhere.equipmentTypeId = equipmentTypeId;

    const [purchases, transfersIn, transfersOut] = await Promise.all([
      prisma.purchase.findMany({
        where: purchaseWhere,
        include: { base: true, equipmentType: true },
        orderBy: { purchaseDate: 'desc' },
        take: 50,
      }),
      prisma.transfer.findMany({
        where: transferInWhere,
        include: { fromBase: true, equipmentType: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.transfer.findMany({
        where: transferOutWhere,
        include: { toBase: true, equipmentType: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        purchases,
        transfersIn,
        transfersOut,
      },
    });
  })
);

export default router;
