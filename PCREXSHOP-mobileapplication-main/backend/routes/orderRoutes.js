import express from "express";
const router = express.Router();

// Controllers
import { getAllOrders } from "../controllers/orderControllers.js";

//middlewares
import auth from "../middlewares/auth.js";
router.use(auth);

// Example route
router.get("/", getAllOrders);

export default router;
