import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { UserService } from './user.service';
import { UserCreateDTO, UserLoginDTO } from './user.model';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userData: UserCreateDTO = req.body;
      const newUser = await this.userService.createUser(userData);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: newUser,
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

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const loginData: UserLoginDTO = req.body;

      const user = await this.userService.validateCredentials(
        loginData.email,
        loginData.password
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const token = this.userService.generateToken(user.id!, user.email);
      const sanitizedUser = this.userService.sanitizeUser(user);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: sanitizedUser,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // El userId viene del middleware de autenticación
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const user = await this.userService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const sanitizedUser = this.userService.sanitizeUser(user);

      res.status(200).json({
        success: true,
        data: sanitizedUser,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided',
        });
      }

      const decoded = this.userService.verifyToken(token);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: decoded,
      });
    } catch (error) {
      next(error);
    }
  };
}
