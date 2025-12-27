import express from "express";
import db from "../database.js"; // ⚠️ client Supabase centralisé avec SERVICE_ROLE_KEY

const router = express.Router();

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const fakeEmail = `${username}@example.com`;

    // Create in Supabase Auth
    const { data, error } = await db.auth.signUp({
      email: fakeEmail,
      password,
    });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const user = data.user;
    if (!user) {
      return res.status(500).json({ success: false, message: "User not created" });
    }

    // Insert into your "profiles" table
    const { error: profileError } = await db
      .from("profiles")
      .insert([{ id: user.id, username }]);

    if (profileError) {
      console.error("❌ profile insert error:", profileError);
    }

    // Vérifie si une session est renvoyée
    let token = data.session?.access_token;

    // If no session (e.g. email confirmation enabled), force a login
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

    // Set the cookie with the Supabase access_token
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // ⚠️ mettre true en prod HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 24h
    });

    res.status(200)

    // 👉 Direct server-side response after setting cookie
    return res.status(200).json({
      success: true,
      message: "Registration successful",
      user: { id: user.id, email: user.email, username }
    });

  } catch (err) {
    console.error("❌ register error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;