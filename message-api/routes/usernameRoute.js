import express from "express";
import requireAuth from "../middlewares/requireAuth.js"
import db from "../database.js";

const router = express.Router();

/**
 * POST /message/username
 * body: { username: string }
 * Search a user by their username.
 */
router.post("/", requireAuth, async (req, res) => {
  const { username } = req.body;
  const currentUserId = req.user.id;

  try {
    if (!username) {
      return res.status(400).json({ success: false, message: "❌ Missing username" });
    }

    const { data: user, error } = await db
      .from("profiles")
      .select("id, username")
      .eq("username", username)
      .single();

    if (error) {
      console.error("Supabase error /username:", error);
      return res.status(500).json({ success: false, message: "Error searching for user" });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.id === currentUserId) {
      return res.status(400).json({ success: false, message: "Cannot start a conversation with yourself" });
    }

    return res.status(200).json({
      success: true,
      message: "✅ User found",
      id: user.id,
      username: user.username,
    });

  } catch (err) {
    console.error("❌ Erreur route /username:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

export default router;