// middlewares/requireAuth.js
import db from "../database.js";

export default async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Missing token" });
    }

    // Vérification du token via Supabase
    const { data: { user }, error } = await db.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Récupération du profil associé
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("id, username")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    // Injection dans req.user pour les routes suivantes
    req.user = {
      id: user.id,
      email: user.email,
      username: profile.username,
    };

    next();
  } catch (err) {
    console.error("❌ Error requireAuth:", err);
    return res.status(500).json({ success: false, message: "Auth server error" });
  }
}