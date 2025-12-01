import express from "express";
import db from "../database.js"; // ⚠️ centralized Supabase client with SERVICE_ROLE_KEY

async function requireAuth(req, res, next) {
  console.log("Received cookies:", req.cookies);

  const token = req.cookies["token"] || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { data: { user }, error } = await db.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ requireAuth error:", err);
    return res.status(401).json({ error: "Token verification error" });
  }
}

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  return res.json({ loggedIn: true, user: req.user });
});

export default router;