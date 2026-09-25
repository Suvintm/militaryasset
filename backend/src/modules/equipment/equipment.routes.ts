import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { requireRole } from '../../common/middlewares/rbac.middleware';
import { Role } from '@prisma/client';
import { z } from 'zod';

const router = Router();

// Public/Authenticated list of equipment types
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const items = await prisma.equipmentType.findMany({
      orderBy: { name: 'asc' },
    });
    return res.status(200).json({ success: true, data: items });
  })
);

// Admin-only create equipment type
router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN),
  asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      name: z.string().min(2),
      category: z.string().min(2),
      unit: z.string().default('units'),
    });
    const validated = schema.parse(req.body);

    const item = await prisma.equipmentType.create({
      data: validated,
    });

    return res.status(201).json({ success: true, data: item });
  })
);

export default router;
