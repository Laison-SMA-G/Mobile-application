// routes/productRoutes.js
import express from "express";
import { createProduct, getAllProducts, deleteProduct } from "../controllers/productControllers.js";
import upload from "../utils/multerConfig.js";

const router = express.Router();

// desktop routes
router.post("/add", createProduct);         // expects JSON with Cloudinary image URLs
router.delete("/product/:id", deleteProduct);


// mobile application routes
router.get("/", getAllProducts); 
router.delete("/mobile/product/:id", deleteProduct)

export default router;
