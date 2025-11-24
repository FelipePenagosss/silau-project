import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { OrderService } from './order.service';
import { CreateOrderDTO, UpdateOrderDTO, OrderListQuery } from './order.model';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }


  cancelOrderAndRestoreStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    const id = parseInt(req.params.id);
    
    // Verify order exists first
    const order = await this.orderService.getOrderById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Cancel and restore stock
    const updatedOrder = await this.orderService.cancelOrderAndRestoreStock(id);

    res.status(200).json({
      success: true,
      message: 'Order cancelled and stock restored successfully',
      data: updatedOrder,
    });
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific business logic errors
      if (error.message.includes('already cancelled')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Cannot cancel')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
    }
    next(error);
  }
};
  /**
   * List all orders with pagination and filters
   * GET /api/orders
   */
  listOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Parse query parameters
      const query: OrderListQuery = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        status: req.query.status as any,
        customer_id: req.query.customer_id ? parseInt(req.query.customer_id as string) : undefined,
        date_from: req.query.date_from as string,
        date_to: req.query.date_to as string,
      };

      const result = await this.orderService.listOrders(query);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a single order by ID
   * GET /api/orders/:id
   */
  getOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const id = parseInt(req.params.id);
      const order = await this.orderService.getOrderById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new order
   * POST /api/orders
   */
  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const orderData: CreateOrderDTO = req.body;
      const newOrder = await this.orderService.createOrder(orderData);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: newOrder,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Customer not found') {
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        }
        if (error.message.includes('not found')) {
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        }
        if (error.message.includes('Insufficient stock')) {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      }
      next(error);
    }
  };

  /**
   * Update an order
   * PUT /api/orders/:id
   */
  updateOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const id = parseInt(req.params.id);
      const orderData: UpdateOrderDTO = req.body;

      const updatedOrder = await this.orderService.updateOrder(id, orderData);

      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update order status
   * PATCH /api/orders/:id/status
   */
  updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const id = parseInt(req.params.id);
      const { status } = req.body;

      const updatedOrder = await this.orderService.updateOrderStatus(id, status);

      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Soft delete an order
   * DELETE /api/orders/:id
   */
  softDeleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const id = parseInt(req.params.id);

      // Verify order exists before deleting
      const order = await this.orderService.getOrderById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      await this.orderService.softDeleteOrder(id);

      res.status(200).json({
        success: true,
        message: 'Order deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Hard delete an order
   * DELETE /api/orders/:id/hard
   */
  hardDeleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const id = parseInt(req.params.id);
      await this.orderService.hardDeleteOrder(id);

      res.status(200).json({
        success: true,
        message: 'Order permanently deleted',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get order statistics
   * GET /api/orders/stats
   */
  getOrderStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer_id = req.query.customer_id
        ? parseInt(req.query.customer_id as string)
        : undefined;

      const stats = await this.orderService.getOrderStatistics(customer_id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}