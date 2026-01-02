import express from "express";
import db from "../database.js"; // ⚠️ your centralized Supabase client with SERVICE_ROLE_KEY

const router = express.Router();

router.get("/", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ loggedIn: false });
  }

  try {
    // Verify the token with Supabase
    const { data: { user }, error } = await db.auth.getUser(token);
    if (error || !user) {
      return res.json({ loggedIn: false });
    }

    // Retrieve the linked profile (username)
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("id, username")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return res.json({ loggedIn: true, user }); // fallback : renvoie au moins l'user Supabase
    }

    // Merge Supabase info + custom profile
    return res.json({
      loggedIn: true,
      user: {
        id: user.id,
        email: user.email,
        username: profile.username,
      },
    });
  } catch (err) {
    console.error("❌ check-session error:", err);
    return res.json({ loggedIn: false });
  }
});

export default router;