import express from "express";
import { getAllProducts } from "../controllers/productControllers.js";

const router = express.Router();

// Get all products
router.get("/", getAllProducts);

export default router;
