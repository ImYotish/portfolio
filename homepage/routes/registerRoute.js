import express from "express";
import db from "../database.js"; // ⚠️ client Supabase centralisé avec SERVICE_ROLE_KEY

const router = express.Router();

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Champs manquants" });
  }

  try {
    const fakeEmail = `${username}@example.com`;

    // Création dans Supabase Auth
    const { data, error } = await db.auth.signUp({
      email: fakeEmail,
      password,
    });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const user = data.user;
    if (!user) {
      return res.status(500).json({ success: false, message: "Utilisateur non créé" });
    }

    // Insertion dans ta table "profiles"
    const { error: profileError } = await db
      .from("profiles")
      .insert([{ id: user.id, username }]);

    if (profileError) {
      console.error("❌ Erreur insertion profile:", profileError);
    }

    // Vérifie si une session est renvoyée
    let token = data.session?.access_token;

    // Si pas de session (ex: confirmation email activée), on force un login
    if (!token) {
      const { data: loginData, error: loginError } = await db.auth.signInWithPassword({
        email: fakeEmail,
        password,
      });
      if (loginError) {
        return res.status(400).json({ success: false, message: loginError.message });
      }
      token = loginData.session.access_token;
    }

    // Pose le cookie avec l’access_token Supabase
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // ⚠️ mettre true en prod HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 24h
    });

    res.status(200)

    // 👉 Redirection directe côté serveur
    // Après avoir posé le cookie
    return res.status(200).json({
      success: true,
      message: "Inscription réussie",
      user: { id: user.id, email: user.email, username }
    });

  } catch (err) {
    console.error("❌ Erreur register:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

export default router;