import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../common/middlewares/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.me);

export default router;
