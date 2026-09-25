import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import basesRoutes from '../modules/bases/bases.routes';
import equipmentRoutes from '../modules/equipment/equipment.routes';
import purchasesRoutes from '../modules/purchases/purchases.routes';
import transfersRoutes from '../modules/transfers/transfers.routes';
import assignmentsRoutes from '../modules/assignments/assignments.routes';
import expendituresRoutes from '../modules/expenditures/expenditures.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import auditRoutes from '../modules/audit/audit.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/bases', basesRoutes);
router.use('/equipment-types', equipmentRoutes);
router.use('/purchases', purchasesRoutes);
router.use('/transfers', transfersRoutes);
router.use('/assignments', assignmentsRoutes);
router.use('/expenditures', expendituresRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit-logs', auditRoutes);

export default router;
