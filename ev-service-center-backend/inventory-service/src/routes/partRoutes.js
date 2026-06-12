import { Router } from "express";
import { authenticate } from "../middlewares/authMiddlewares.js";
import { 
  getParts, 
  getPartById, 
  addPart, 
  updatePart, 
  deletePart, 
  updateStock, 
  getStockHistory,
  getPartsStats
} from "../controllers/partController.js";

const router = Router();

// Part operations
router.get("/", authenticate, getParts);
router.get("/stats/parts", authenticate, getPartsStats);
router.get("/:id", authenticate, getPartById);
router.post("/", authenticate, addPart);
router.put("/:id", authenticate, updatePart);
router.delete("/:id", authenticate, deletePart);

// Stock operations
router.put("/:id/stock", authenticate, updateStock);
router.get("/:id/stock-history", authenticate, getStockHistory);

export default router;
