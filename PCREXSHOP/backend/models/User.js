// models/User.js
import mongoose from "mongoose";

// Address sub-schema
const addressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., "Home" or "Office"
    fullName: { type: String, required: true }, // Recipient full name
    phoneNumber: { type: String, required: true }, // Contact number
    addressLine1: { type: String, required: true }, // Street, building, etc.
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: "Philippines" },
    isDefault: { type: Boolean, default: false }, // Default shipping address
  },
  { _id: true }
);

// Main User schema
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    profileImage: { type: String, default: null },

    // Password reset fields
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // Cart inside user document
    cart: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],

    // Addresses
    addresses: [addressSchema],
  },
  { timestamps: true }
);

// ------------------------------
// Pre-save hook to enforce one default
// ------------------------------
userSchema.pre("save", function (next) {
  const addresses = this.addresses || [];

  if (addresses.length === 0) return next();

  // If none marked as default, mark the first one
  if (!addresses.some((a) => a.isDefault)) {
    addresses[0].isDefault = true;
  }

  // Ensure only one default
  let defaultSet = false;
  addresses.forEach((a) => {
    if (a.isDefault) {
      if (!defaultSet) {
        defaultSet = true;
      } else {
        a.isDefault = false;
      }
    }
  });

  next();
});

// Prevent recompilation errors in development
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
