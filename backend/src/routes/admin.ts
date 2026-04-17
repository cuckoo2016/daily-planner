import { Router } from 'express';
import {
  getDashboard,
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getStatistics,
  getLogs,
  getSettings,
  updateSettings
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.patch('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/statistics', getStatistics);
router.get('/logs', getLogs);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;