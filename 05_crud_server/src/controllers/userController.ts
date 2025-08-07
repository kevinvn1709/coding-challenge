import { Request, Response } from 'express';
import { userRepository } from '../utils/database';
import { CreateUserInput, UpdateUserInput, UserFilters } from '../models/User';

export class UserController {
  // GET /users - List all users with filters
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const filters: UserFilters = {
        name: req.query.name as string,
        email: req.query.email as string,
        status: req.query.status as 'active' | 'inactive',
        age_min: req.query.age_min ? parseInt(req.query.age_min as string) : undefined,
        age_max: req.query.age_max ? parseInt(req.query.age_max as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof UserFilters] === undefined) {
          delete filters[key as keyof UserFilters];
        }
      });

      const users = userRepository.findAll(filters);
      const total = userRepository.count(filters);

      res.json({
        success: true,
        data: users,
        pagination: {
          total,
          limit: filters.limit || 10,
          offset: filters.offset || 0,
          hasMore: (filters.offset || 0) + (filters.limit || 10) < total
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /users/:id - Get user by ID
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
        return;
      }

      const user = userRepository.findById(id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /users - Create new user
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserInput = {
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
        status: req.body.status || 'active'
      };

      // Basic validation
      if (!userData.name || !userData.email) {
        res.status(400).json({
          success: false,
          message: 'Name and email are required'
        });
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      // Age validation
      if (userData.age !== undefined && (userData.age < 0 || userData.age > 150)) {
        res.status(400).json({
          success: false,
          message: 'Age must be between 0 and 150'
        });
        return;
      }

      const newUser = userRepository.create(userData);
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser
      });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // PUT /users/:id - Update user
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
        return;
      }

      const userData: UpdateUserInput = {
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
        status: req.body.status
      };

      // Remove undefined values
      Object.keys(userData).forEach(key => {
        if (userData[key as keyof UpdateUserInput] === undefined) {
          delete userData[key as keyof UpdateUserInput];
        }
      });

      // Validation
      if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      if (userData.age !== undefined && (userData.age < 0 || userData.age > 150)) {
        res.status(400).json({
          success: false,
          message: 'Age must be between 0 and 150'
        });
        return;
      }

      const updatedUser = userRepository.update(id, userData);
      
      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // DELETE /users/:id - Delete user
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
        return;
      }

      const deleted = userRepository.delete(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const userController = new UserController();
