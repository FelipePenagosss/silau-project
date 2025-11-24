import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ProductService } from './product.service';
import {
  ProductCreateDTO,
  ProductUpdateDTO,
  ProductListQuery,
} from './product.model';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  listProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const query: ProductListQuery = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        minPrice: req.query.minPrice
          ? parseFloat(req.query.minPrice as string)
          : undefined,
        maxPrice: req.query.maxPrice
          ? parseFloat(req.query.maxPrice as string)
          : undefined,
        inStock: req.query.inStock === 'true' ? true : undefined,
      };

      const result = await this.productService.listProducts(query);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const id = parseInt(req.params.id);
      const product = await this.productService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const productData: ProductCreateDTO = req.body;
      const newProduct = await this.productService.createProduct(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: newProduct,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          return res.status(409).json({
            success: false,
            message: error.message,
          });
        }
        if (error.message.includes('must be a positive')) {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      }
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const id = parseInt(req.params.id);
      const productData: ProductUpdateDTO = req.body;

      const updatedProduct = await this.productService.updateProduct(
        id,
        productData
      );

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Product not found') {
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        }
        if (error.message.includes('already exists')) {
          return res.status(409).json({
            success: false,
            message: error.message,
          });
        }
        if (error.message.includes('must be a positive')) {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      }
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const id = parseInt(req.params.id);
      await this.productService.deleteProduct(id);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  updateStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const id = parseInt(req.params.id);
      const { quantity } = req.body;

      const updatedProduct = await this.productService.updateStock(
        id,
        quantity
      );

      res.status(200).json({
        success: true,
        message: 'Stock updated successfully',
        data: updatedProduct,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Product not found') {
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        }
        if (error.message === 'Insufficient stock') {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      }
      next(error);
    }
  };
}
