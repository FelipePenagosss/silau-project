import { Router } from 'express';
import { OrderController } from './order.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  createOrderValidator,
  updateOrderValidator,
  listOrdersValidator,
  orderIdValidator,
  updateOrderStatusValidator,
} from './order.validator';

const router = Router();
const orderController = new OrderController();

// Public routes
router.get('/', listOrdersValidator, orderController.listOrders);
router.get('/stats', orderController.getOrderStatistics);
router.get('/:id', orderIdValidator, orderController.getOrder);

// Protected routes (require authentication)
router.post('/', authMiddleware, createOrderValidator, orderController.createOrder);
router.put('/:id', authMiddleware, updateOrderValidator, orderController.updateOrder);
router.patch('/:id/status', authMiddleware, updateOrderStatusValidator, orderController.updateOrderStatus);

// ✅ NUEVA RUTA: Cancel order and restore stock
router.patch('/:id/cancel', authMiddleware, orderIdValidator, orderController.cancelOrderAndRestoreStock);

router.delete('/:id', authMiddleware, orderIdValidator, orderController.softDeleteOrder);
router.delete('/:id/hard', authMiddleware, orderIdValidator, orderController.hardDeleteOrder);

export default router;