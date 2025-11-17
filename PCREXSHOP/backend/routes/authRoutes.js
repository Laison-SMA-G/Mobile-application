import express from "express";
const router = express.Router();

// controllers
import { register, login } from "../controllers/authControllers.js";

// routes
router.post("/register", register);
router.post("/login", login);

export default router;
