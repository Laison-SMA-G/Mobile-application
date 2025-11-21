import express from "express";
import auth from "../middlewares/auth.js";
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from "../controllers/addressController.js";

const router = express.Router();

// protect all routes
router.use(auth);

router.get("/users/:userId/addresses", getUserAddresses);
router.post("/users/:userId/addresses", addAddress);
router.put("/users/:userId/addresses/:addressId", updateAddress);
router.delete("/users/:userId/addresses/:addressId", deleteAddress);
router.patch("/users/:userId/addresses/default/:addressId", setDefaultAddress);

export default router;

