import express from "express";
import db from "../database.js"; // ⚠️ client Supabase centralisé avec SERVICE_ROLE_KEY

async function requireAuth(req, res, next) {
  console.log("Cookies reçus:", req.cookies);

  const token = req.cookies["token"] || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  try {
    const { data: { user }, error } = await db.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Token invalide" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Erreur requireAuth:", err);
    return res.status(401).json({ error: "Erreur vérification token" });
  }
}

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  return res.json({ loggedIn: true, user: req.user });
});

export default router;