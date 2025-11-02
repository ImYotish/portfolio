import express from "express";
import db from "../database.js"; // client Supabase avec SERVICE_ROLE_KEY

const router = express.Router();

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Champs manquants" });
  }

  try {
    const fakeEmail = `${username}@example.com`;

    // ✅ Connexion via Supabase Auth
    const { data, error } = await db.auth.signInWithPassword({
      email: fakeEmail,
      password,
    });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const token = data.session?.access_token;
    if (!token) {
      return res.status(500).json({ success: false, message: "Pas de session générée" });
    }

    // Pose le cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // ⚠️ true en prod HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 24h
    });

    return res.json({
      success: true,
      message: "Connexion réussie",
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (err) {
    console.error("❌ Erreur login:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

export default router;