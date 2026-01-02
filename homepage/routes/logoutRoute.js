import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  // Clear the auth cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  return res.json({ success: true, message: "Logged out" });
});

export default router;