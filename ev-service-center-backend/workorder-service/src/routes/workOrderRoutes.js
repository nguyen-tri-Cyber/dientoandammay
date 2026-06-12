import express from 'express';
import { authenticate } from '../middlewares/authMiddlewares.js';
import {
  getAllWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  addChecklistItem,
  getChecklistItems,
  getAllChecklistItems,
  getWorkOrderByAppointmentId,
  getChecklistItemById,
  updateChecklistItem,
  deleteChecklistItem,
  getRevenueStats,
  getTaskStats,
} from '../controllers/workorderController.js';

const router = express.Router();

// ⚠️ QUAN TRỌNG: Các route cụ thể phải đứng TRƯỚC /:id
// Nếu /appointment/:work_order_id đứng sau /:id thì Express sẽ match "appointment" vào /:id
router.get('/stats/revenue', authenticate, getRevenueStats);
router.get('/stats/tasks', authenticate, getTaskStats);
router.get('/checklist/all', authenticate, getAllChecklistItems);

// FIX ITC_WO_12.2: /appointment/:work_order_id phải đứng TRƯỚC /:id
router.get('/appointment/:work_order_id', authenticate, getWorkOrderByAppointmentId);

router.get('/', authenticate, getAllWorkOrders);
router.get('/:id', authenticate, getWorkOrderById);
router.post('/', authenticate, createWorkOrder);
router.put('/:id', authenticate, updateWorkOrder);
router.delete('/:id', authenticate, deleteWorkOrder);

// Checklist items
router.post('/:work_order_id/checklist', authenticate, addChecklistItem);
router.get('/:work_order_id/checklist', authenticate, getChecklistItems);

// Checklist item specific operations
router.get('/:work_order_id/checklist/:checklist_id', authenticate, getChecklistItemById);
router.put('/:work_order_id/checklist/:checklist_id', authenticate, updateChecklistItem);
router.delete('/:work_order_id/checklist/:checklist_id', authenticate, deleteChecklistItem);



export default router;
