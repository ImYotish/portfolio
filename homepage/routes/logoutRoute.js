import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  // Supprime le cookie d'authentification
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // ⚠️ passe à true en production avec HTTPS
    sameSite: "lax",
  });

  return res.json({ success: true, message: "Déconnecté" });
});

export default router;