import express from "express";
const router = express.Router();

// Controllers
import {
  getAllOrders,
  getUserOrders,
  createOrder,
  cancelOrder,
} from "../controllers/orderControllers.js";

// Middleware
import auth from "../middlewares/auth.js";
router.use(auth);

// Admin: Get all orders
router.get("/", getAllOrders);

// User: Get current user's orders
router.get("/my", getUserOrders);

// User: Create new order
router.post("/", createOrder);

// User: Cancel order
router.put("/:id/cancel", cancelOrder);

export default router;
