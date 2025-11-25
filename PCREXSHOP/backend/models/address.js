import mongoose from "mongoose";

// Address sub-schema
const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  region: { type: String, required: true },
  province: { type: String, required: true },
  city: { type: String, required: true },
  barangay: { type: String, required: true },
  street: { type: String, required: true },
  postalCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

