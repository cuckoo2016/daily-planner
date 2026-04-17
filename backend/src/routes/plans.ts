import { Router } from 'express';
import {
  getPlans,
  getHistoryPlans,
  getPlanById,
  createPlan,
  updatePlan,
  toggleComplete,
  deletePlan,
  searchPlans
} from '../controllers/planController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getPlans);
router.get('/history', getHistoryPlans);
router.get('/search', searchPlans);
router.get('/:id', getPlanById);
router.post('/', createPlan);
router.put('/:id', updatePlan);
router.patch('/:id/complete', toggleComplete);
router.delete('/:id', deletePlan);

export default router;