import express from "express";
import { getSalesSummary, getAllSales, getSaleById } from "../controllers/salesController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// 🔒 Require login (and ideally admin check later)
router.use(auth);

// ✅ Fetch sales summary (with optional ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD)
router.get("/summary", getSalesSummary);

// ✅ Fetch all sales (detailed list)
router.get("/", getAllSales);

// ✅ Fetch a single sale by ID
router.get("/:id", getSaleById);

export default router;
