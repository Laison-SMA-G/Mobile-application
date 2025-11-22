// controllers/addressController.js
import User from "../models/User.js";

// ---------- Helper: Ownership ----------
const verifyOwnership = (req, res) => {
  if (req.user._id.toString() !== req.params.userId) {
    res.status(403).json({
      message: "Unauthorized: Cannot modify another user's data",
    });
    return false;
  }
  return true;
};

// ---------- Helper: Validate Address ----------
const validateAddress = (data) => {
  if (!data.fullName || !data.phone || !data.address || !data.city || !data.region) {
    return "Missing required fields";
  }
  return null;
};

// --------------------------
// GET /users/:userId/addresses
// --------------------------
export const getUserAddresses = async (req, res) => {
  if (!verifyOwnership(req, res)) return;

  try {
    const user = await User.findById(req.params.userId).select("addresses");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ addresses: user.addresses });
  } catch (err) {
    console.error("Fetch addresses error:", err);
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
};

// --------------------------
// POST /users/:userId/addresses
// --------------------------
export const addAddress = async (req, res) => {
  if (!verifyOwnership(req, res)) return;

  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const error = validateAddress(req.body);
    if (error) return res.status(400).json({ message: error });

    const newAddress = req.body;

    // Ensure only 1 default
    if (newAddress.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push(newAddress);
    await user.save();

    res.json({ addresses: user.addresses });
  } catch (err) {
    console.error("Add address error:", err);
    res.status(500).json({ message: "Failed to add address" });
  }
};

// --------------------------
// PUT /users/:userId/addresses/:addressId
// --------------------------
export const updateAddress = async (req, res) => {
  if (!verifyOwnership(req, res)) return;

  try {
    const { userId, addressId } = req.params;
    const updatedData = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    // Handle default logic
    if (updatedData.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    // Update fields properly
    Object.assign(address, updatedData);

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (err) {
    console.error("Update address error:", err);
    res.status(500).json({ message: "Failed to update address" });
  }
};

// --------------------------
// DELETE /users/:userId/addresses/:addressId
// --------------------------
export const deleteAddress = async (req, res) => {
  if (!verifyOwnership(req, res)) return;

  try {
    const { userId, addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    const wasDefault = address.isDefault;

    address.deleteOne(); // safer than remove()

    // If default was deleted → auto assign first address
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (err) {
    console.error("Delete address error:", err);
    res.status(500).json({ message: "Failed to delete address" });
  }
};

// --------------------------
// PUT /users/:userId/addresses/:addressId/default
// --------------------------
export const setDefaultAddress = async (req, res) => {
  if (!verifyOwnership(req, res)) return;

  try {
    const { userId, addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    // Unset previous defaults
    user.addresses.forEach((a) => (a.isDefault = false));

    // Set new default
    address.isDefault = true;

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (err) {
    console.error("Set default address error:", err);
    res.status(500).json({ message: "Failed to set default address" });
  }
};
