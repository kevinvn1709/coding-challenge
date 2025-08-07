import { Router } from 'express';
import { userController } from '../controllers/userController';

const router = Router();

// GET /api/users - List all users with optional filters
router.get('/', (req, res) => userController.getAllUsers(req, res));

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => userController.getUserById(req, res));

// POST /api/users - Create new user
router.post('/', (req, res) => userController.createUser(req, res));

// PUT /api/users/:id - Update user
router.put('/:id', (req, res) => userController.updateUser(req, res));

// DELETE /api/users/:id - Delete user
router.delete('/:id', (req, res) => userController.deleteUser(req, res));

export default router;
