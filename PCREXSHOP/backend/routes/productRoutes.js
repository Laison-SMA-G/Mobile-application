import express from "express";
import { createProduct, getAllProducts } from "../controllers/productControllers.js";
import upload from "../utils/multerConfig.js";

const router = express.Router();

// -------------------------------------
// GET all products (mobile)
// Supports: page, limit, search, category
// -------------------------------------
router.get("/", getAllProducts);

// -------------------------------------
// POST a new product (desktop)
// Supports multiple images (max 5)
// -------------------------------------
router.post("/add", upload.array("images", 5), createProduct);

export default router;
