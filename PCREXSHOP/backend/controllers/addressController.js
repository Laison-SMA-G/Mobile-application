// controllers/addressController.js
import User from "../models/User.js";

// --------------------------------------------------------
// GET ALL ADDRESSES
// --------------------------------------------------------
export const getUserAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user.addresses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --------------------------------------------------------
// ADD NEW ADDRESS
// --------------------------------------------------------
export const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newAddress = req.body;

        // If new address is default, remove default from others
        if (newAddress.isDefault) {
            user.addresses = user.addresses.map(a => ({ ...a.toObject(), isDefault: false }));
        }

        user.addresses.push(newAddress);
        await user.save();

        res.json(user.addresses[user.addresses.length - 1]); // Return newly added address
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --------------------------------------------------------
// UPDATE ADDRESS
// --------------------------------------------------------
export const updateAddress = async (req, res) => {
    try {
        const { userId, addressId } = req.params;
        const data = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const address = user.addresses.id(addressId);
        if (!address) return res.status(404).json({ message: "Address not found" });

        // If this becomes default - unset others
        if (data.isDefault) {
            user.addresses.forEach(a => a.isDefault = false);
        }

        // Update fields
        Object.assign(address, data);

        await user.save();
        res.json(address);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --------------------------------------------------------
// DELETE ADDRESS
// --------------------------------------------------------
export const deleteAddress = async (req, res) => {
    try {
        const { userId, addressId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const address = user.addresses.id(addressId);
        if (!address) return res.status(404).json({ message: "Address not found" });

        const wasDefault = address.isDefault;

        // Remove the address
        address.remove();

        // If deleted default → set first address as new default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();
        res.json({ message: "Address deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --------------------------------------------------------
// SET DEFAULT ADDRESS
// --------------------------------------------------------
export const setDefaultAddress = async (req, res) => {
    try {
        const { userId, addressId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.addresses.forEach(a => {
            a.isDefault = a._id.toString() === addressId;
        });

        await user.save();

        res.json({ message: "Default address updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
