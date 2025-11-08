import express from "express";
const router = express.Router();

// Controllers
import { getAllOrders, getUserOrders, createOrder } from "../controllers/orderControllers.js";

// Middleware
import auth from "../middlewares/auth.js";
router.use(auth);

// ✅ Get all orders (admin)
router.get("/", getAllOrders);

// ✅ Get current user's orders
router.get("/my", getUserOrders);

// ✅ Create new order (user places order)
router.post("/", createOrder);

export default router;
