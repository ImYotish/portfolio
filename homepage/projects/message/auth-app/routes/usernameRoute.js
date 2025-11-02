import express from "express";
import requireAuth from "../middlewares/requireAuth.js"
import db from "../database.js";

const router = express.Router();

/**
 * POST /message/username
 * body: { username: string }
 * Recherche un utilisateur par son username.
 */
router.post("/", requireAuth, async (req, res) => {
  const { username } = req.body;
  const currentUserId = req.user.id;

  try {
    if (!username) {
      return res.status(400).json({ success: false, message: "❌ Username manquant" });
    }

    const { data: user, error } = await db
      .from("profiles")
      .select("id, username")
      .eq("username", username)
      .single();

    if (error) {
      console.error("Erreur Supabase /username:", error);
      return res.status(500).json({ success: false, message: "Erreur lors de la recherche utilisateur" });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    }

    if (user.id === currentUserId) {
      return res.status(400).json({ success: false, message: "Impossible de discuter avec toi-même" });
    }

    return res.status(200).json({
      success: true,
      message: "✅ Utilisateur trouvé",
      id: user.id,
      username: user.username,
    });

  } catch (err) {
    console.error("❌ Erreur route /username:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

export default router;