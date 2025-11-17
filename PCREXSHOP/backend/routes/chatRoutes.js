// routes/chatRoutes.js
import express from "express";
import Chat from "../models/Chat.js";


const router = express.Router();

// ✅ Get chats for a specific user
router.get("/users/chats/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) return res.status(400).json({ error: "userId is required" });

  try {
    const chats = await Chat.find({ participants: userId }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Correct ESM export (NOT module.exports)
export default router;
