import express from 'express';
import { authenticate } from '../middlewares/authMiddlewares.js';
import {
  getAllNotifications,
  getNotifications,
  getNotificationsByUser,
  createNotification,
  markAsRead,
  updateNotification,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.get('/all', authenticate, getAllNotifications);
router.get('/user/:userId', authenticate, getNotificationsByUser);
router.post('/', authenticate, createNotification);
router.put('/:id/read', authenticate, markAsRead);
// FIX: /read-all phải đứng TRƯỚC /:id để tránh Express match "read-all" vào /:id
router.patch('/read-all', authenticate, markAllAsRead);
router.patch('/:id', authenticate, updateNotification);
router.delete('/:id', authenticate, deleteNotification);

export default router;
