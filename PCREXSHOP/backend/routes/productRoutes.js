// routes/productRoutes.js
import express from "express";
import { createProduct, getAllProducts, deleteProduct } from "../controllers/productControllers.js";
import upload from "../utils/multerConfig.js";

const router = express.Router();

// desktop routes
router.post("/add", upload.array("images", 5), createProduct);
router.delete("/product", deleteProduct)

// mobile application routes
router.get("/", getAllProducts); 
router.delete("/mobile/product")

export default router;
