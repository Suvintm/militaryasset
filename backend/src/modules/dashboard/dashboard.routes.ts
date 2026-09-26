import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { getScopedBaseId } from '../../common/middlewares/rbac.middleware';
import { TransferStatus, AssignmentStatus } from '@prisma/client';

const router = Router();

router.use(authenticate);

// 1. GET /api/v1/dashboard/summary
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

// 2. GET /api/v1/dashboard/net-movement/detail (for Bonus Modal)
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

// 3. GET /api/v1/dashboard/trends (Dynamic Monthly Movements from real DB records)
router.get(
  '/trends',
  asyncHandler(async (req: Request, res: Response) => {
    const { baseId, equipmentTypeId } = req.query as any;
    const scopedBaseId = getScopedBaseId(req.user!, baseId);

    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Build array for past 12 months
    const monthlyData: any[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthLabel = months[d.getMonth()];

      const [purchases, transfersIn, transfersOut] = await Promise.all([
        prisma.purchase.aggregate({
          where: {
            ...(scopedBaseId ? { baseId: scopedBaseId } : {}),
            ...(equipmentTypeId ? { equipmentTypeId } : {}),
            purchaseDate: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { quantity: true },
        }),
        prisma.transfer.aggregate({
          where: {
            ...(scopedBaseId ? { toBaseId: scopedBaseId } : {}),
            ...(equipmentTypeId ? { equipmentTypeId } : {}),
            status: TransferStatus.COMPLETED,
            completedAt: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { quantity: true },
        }),
        prisma.transfer.aggregate({
          where: {
            ...(scopedBaseId ? { fromBaseId: scopedBaseId } : {}),
            ...(equipmentTypeId ? { equipmentTypeId } : {}),
            status: TransferStatus.COMPLETED,
            completedAt: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { quantity: true },
        }),
      ]);

      const pQty = purchases._sum.quantity || 0;
      const tinQty = transfersIn._sum.quantity || 0;
      const toutQty = transfersOut._sum.quantity || 0;
      const net = pQty + tinQty - toutQty;

      monthlyData.push({
        month: monthLabel,
        year: d.getFullYear(),
        purchases: pQty,
        transferIn: tinQty,
        transferOut: toutQty,
        netMovement: net,
      });
    }

    return res.status(200).json({
      success: true,
      data: monthlyData,
    });
  })
);

// 4. GET /api/v1/dashboard/category-distribution (Dynamic Category Breakdown from DB)
router.get(
  '/category-distribution',
  asyncHandler(async (req: Request, res: Response) => {
    const { baseId } = req.query as any;
    const scopedBaseId = getScopedBaseId(req.user!, baseId);

    // Get all equipment types with their stock balances
    const equipmentTypes = await prisma.equipmentType.findMany({
      include: {
        stocks: {
          where: scopedBaseId ? { baseId: scopedBaseId } : {},
        },
      },
    });

    const categoryMap: Record<string, number> = {
      WEAPON: 0,
      VEHICLE: 0,
      AMMUNITION: 0,
      SUPPLY: 0,
    };

    let totalStock = 0;
    equipmentTypes.forEach((eq) => {
      const cat = eq.category;
      const sum = eq.stocks.reduce((acc, sb) => acc + sb.quantity, 0);
      categoryMap[cat] = (categoryMap[cat] || 0) + sum;
      totalStock += sum;
    });

    const categoryMeta: Record<string, { label: string; color: string }> = {
      VEHICLE: { label: 'Vehicles', color: '#134e2c' },
      WEAPON: { label: 'Weapons', color: '#10b981' },
      AMMUNITION: { label: 'Ammunition', color: '#f59e0b' },
      SUPPLY: { label: 'Communication & Supply', color: '#3b82f6' },
    };

    const categories = Object.keys(categoryMap).map((catKey) => {
      const count = categoryMap[catKey] || 0;
      const meta = categoryMeta[catKey] || { label: catKey, color: '#94a3b8' };
      const rawPct = totalStock > 0 ? (count / totalStock) * 100 : 0;
      const percentage = rawPct === 0 ? 0 : rawPct < 0.1 ? 0.1 : Number(rawPct.toFixed(1));
      return {
        key: catKey,
        label: meta.label,
        count,
        percentage,
        color: meta.color,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalStock,
        categories,
      },
    });
  })
);

// 5. GET /api/v1/dashboard/recent-transactions (Dynamic Transaction Log from DB)
router.get(
  '/recent-transactions',
  asyncHandler(async (req: Request, res: Response) => {
    const { baseId } = req.query as any;
    const scopedBaseId = getScopedBaseId(req.user!, baseId);

    const [purchases, transfers, assignments] = await Promise.all([
      prisma.purchase.findMany({
        where: scopedBaseId ? { baseId: scopedBaseId } : {},
        include: { base: true, equipmentType: true, recordedBy: true },
        orderBy: { purchaseDate: 'desc' },
        take: 10,
      }),
      prisma.transfer.findMany({
        where: scopedBaseId
          ? { OR: [{ fromBaseId: scopedBaseId }, { toBaseId: scopedBaseId }] }
          : {},
        include: { fromBase: true, toBase: true, equipmentType: true, initiatedBy: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.assignment.findMany({
        where: scopedBaseId ? { baseId: scopedBaseId } : {},
        include: { base: true, equipmentType: true, assignedBy: true },
        orderBy: { assignedAt: 'desc' },
        take: 10,
      }),
    ]);

    // Format all into a unified transaction model
    const transactions: any[] = [];

    purchases.forEach((p) => {
      transactions.push({
        id: p.id,
        date: p.purchaseDate,
        type: 'PURCHASE',
        asset: p.equipmentType?.name || 'Asset',
        quantity: p.quantity,
        isPositive: true,
        from: p.supplier,
        to: p.base?.name || 'Base',
        createdBy: p.recordedBy?.name || 'Logistics Officer',
        status: 'COMPLETED',
      });
    });

    transfers.forEach((t) => {
      transactions.push({
        id: t.id,
        date: t.createdAt,
        type: 'TRANSFER',
        asset: t.equipmentType?.name || 'Asset',
        quantity: t.quantity,
        isPositive: false,
        from: t.fromBase?.name || 'Origin',
        to: t.toBase?.name || 'Destination',
        createdBy: t.initiatedBy?.name || 'Commander',
        status: t.status,
      });
    });

    assignments.forEach((a) => {
      transactions.push({
        id: a.id,
        date: a.assignedAt,
        type: 'ASSIGNMENT',
        asset: a.equipmentType?.name || 'Asset',
        quantity: a.quantity,
        isPositive: false,
        from: a.base?.name || 'Base HQ',
        to: a.personnelName || 'Personnel',
        createdBy: a.assignedBy?.name || 'Officer',
        status: a.status === 'ACTIVE' ? 'ACTIVE' : 'RETURNED',
      });
    });

    // Sort by date descending
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return res.status(200).json({
      success: true,
      data: transactions.slice(0, 10),
    });
  })
);

// 6. GET /api/v1/dashboard/base-summary (Dynamic Base Summary from DB)
router.get(
  '/base-summary',
  asyncHandler(async (req: Request, res: Response) => {
    const bases = await prisma.base.findMany({
      include: {
        stockBalances: true,
        purchases: true,
        transfersIn: { where: { status: TransferStatus.COMPLETED } },
        transfersOut: { where: { status: TransferStatus.COMPLETED } },
      },
      orderBy: { name: 'asc' },
    });

    let overallTotal = 0;
    let overallNet = 0;

    const baseRows = bases.map((b) => {
      const stockTotal = b.stockBalances.reduce((acc, sb) => acc + sb.quantity, 0);
      const pTotal = b.purchases.reduce((acc, p) => acc + p.quantity, 0);
      const tinTotal = b.transfersIn.reduce((acc, t) => acc + t.quantity, 0);
      const toutTotal = b.transfersOut.reduce((acc, t) => acc + t.quantity, 0);
      const net = pTotal + tinTotal - toutTotal;

      overallTotal += stockTotal;
      overallNet += net;

      return {
        id: b.id,
        name: b.name,
        location: b.location,
        total: stockTotal,
        netMovement: net,
        isPositive: net >= 0,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        overallTotal,
        overallNet,
        bases: baseRows,
      },
    });
  })
);

export default router;
