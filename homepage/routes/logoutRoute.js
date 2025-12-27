import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  // Clear the auth cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // ⚠️ set to true in production with HTTPS
    sameSite: "lax",
  });

  return res.json({ success: true, message: "Logged out" });
});

export default router;