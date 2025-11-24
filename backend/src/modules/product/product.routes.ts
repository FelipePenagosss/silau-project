import { Router } from 'express';
import { ProductController } from './product.controller';
import {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
  listProductsValidator,
  updateStockValidator,
} from './product.validator';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const productController = new ProductController();

// Rutas públicas (lectura)
router.get('/', listProductsValidator, productController.listProducts);
router.get('/:id', productIdValidator, productController.getProduct);

// Rutas protegidas (escritura - requieren autenticación)
router.post(
  '/',
  authMiddleware,
  createProductValidator,
  productController.createProduct
);
router.put(
  '/:id',
  authMiddleware,
  updateProductValidator,
  productController.updateProduct
);
router.delete(
  '/:id',
  authMiddleware,
  productIdValidator,
  productController.deleteProduct
);
router.patch(
  '/:id/stock',
  authMiddleware,
  updateStockValidator,
  productController.updateStock
);

export default router;
