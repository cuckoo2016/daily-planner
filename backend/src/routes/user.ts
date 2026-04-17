import { Router } from 'express';
import { getProfile, updateProfile, updateTheme, getStats, changePassword } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/theme', updateTheme);
router.get('/stats', getStats);
router.put('/password', changePassword);

export default router;