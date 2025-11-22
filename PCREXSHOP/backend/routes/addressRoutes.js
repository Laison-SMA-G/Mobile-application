import express from "express";
import auth from "../middlewares/auth.js";
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from "../controllers/addressController.js";

const router = express.Router({ mergeParams: true });

// GET addresses
router.get("/", auth, getUserAddresses);

// Add address
router.post("/add", auth, addAddress);

// Update address
router.put("/:addressId", auth, updateAddress);

// Delete address
router.delete("/:addressId", auth, deleteAddress);

// Set default address
router.put("/:addressId/default", auth, setDefaultAddress);

export default router;
