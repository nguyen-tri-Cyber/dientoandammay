import express from 'express';
import { authenticate } from '../middlewares/authMiddlewares.js';
import {
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByUserId,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getBookingStats
} from '../controllers/bookingController.js';

const router = express.Router();

router.get('/', authenticate, getAllAppointments);
router.get('/stats/booking', authenticate, getBookingStats);
router.get('/user/:userId', authenticate, getAppointmentsByUserId);
router.get('/:id', authenticate, getAppointmentById);
router.post('/', authenticate, createAppointment);
router.put('/:id', authenticate, updateAppointment);
router.delete('/:id', authenticate, deleteAppointment);

export default router;
