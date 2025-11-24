import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { CustomerService } from './customer.service';
import { CustomerCreateDTO, CustomerUpdateDTO, CustomerListQuery } from './customer.model';

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  listCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const query: CustomerListQuery = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
      };

      const result = await this.customerService.listCustomers(query);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const id = parseInt(req.params.id);
      const customer = await this.customerService.getCustomerById(id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  createCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const customerData: CustomerCreateDTO = req.body;
      const newCustomer = await this.customerService.createCustomer(customerData);

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: newCustomer,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          return res.status(409).json({
            success: false,
            message: error.message,
          });
        }
      }
      next(error);
    }
  };

  updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const id = parseInt(req.params.id);
      const customerData: CustomerUpdateDTO = req.body;

      const updatedCustomer = await this.customerService.updateCustomer(id, customerData);

      res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: updatedCustomer,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Customer not found') {
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
      }
      next(error);
    }
  };

  softDeleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const id = parseInt(req.params.id);
      await this.customerService.softDeleteCustomer(id);

      res.status(200).json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Customer not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  hardDeleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const id = parseInt(req.params.id);
      await this.customerService.hardDeleteCustomer(id);

      res.status(200).json({
        success: true,
        message: 'Customer permanently deleted',
      });
    } catch (error) {
      next(error);
    }
  };
}
