import { Router } from 'express';
import { UserController } from './user.controller';
import { registerValidator, loginValidator } from './user.validator';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

// Rutas públicas
router.post('/register', registerValidator, userController.register);
router.post('/login', loginValidator, userController.login);
router.post('/verify-token', userController.verifyToken);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authMiddleware, userController.getProfile);

export default router;
