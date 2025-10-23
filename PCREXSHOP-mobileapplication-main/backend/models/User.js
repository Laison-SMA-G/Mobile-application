import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  profileImage: { type: String, default: null },

  // Password reset fields
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

// if the model doesn't exist, create a new model
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

