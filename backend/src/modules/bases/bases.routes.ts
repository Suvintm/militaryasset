import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { requireRole } from '../../common/middlewares/rbac.middleware';
import { Role } from '@prisma/client';
import { z } from 'zod';

const router = Router();

// Public/Authenticated list of bases
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const bases = await prisma.base.findMany({
      orderBy: { name: 'asc' },
    });
    return res.status(200).json({ success: true, data: bases });
  })
);

// Admin-only create base
router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN),
  asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      name: z.string().min(2),
      location: z.string().min(2),
    });
    const validated = schema.parse(req.body);

    const base = await prisma.base.create({
      data: validated,
    });

    return res.status(201).json({ success: true, data: base });
  })
);

export default router;
