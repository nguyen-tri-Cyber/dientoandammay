import { Router } from "express";
import { getInvoices, createInvoice, getInvoiceById, updateInvoice, deleteInvoice, recordPayment, createInvoiceWithPayment, getDashboardStats, getInvoiceByAppointmentId } from "../controllers/invoiceController.js";
import { authenticate } from "../middlewares/authMiddlewares.js";

const router = Router();

// FIX ITC_FIN_1.1: Thêm authenticate middleware cho tất cả routes
// Tất cả request đều phải có Bearer token hợp lệ

// Static routes phải đứng trước dynamic /:id để tránh route conflict
router.get("/stats/dashboard", authenticate, getDashboardStats);
router.get("/appointment/:appointmentId", authenticate, getInvoiceByAppointmentId);
router.post("/payment", authenticate, recordPayment);
router.post("/create-with-payment", authenticate, createInvoiceWithPayment);

// CRUD routes
router.get("/", authenticate, getInvoices);
router.get("/:id", authenticate, getInvoiceById);
router.post("/", authenticate, createInvoice);
router.put("/:id", authenticate, updateInvoice);
router.delete("/:id", authenticate, deleteInvoice);

export default router;
