import express from "express";
import requireAuth from "../middlewares/requireAuth.js"
import db from "../database.js";

const router = express.Router();

/**
 * POST /message/createconv
 * body: { id: uuid } → recipient ID
 * Creates a new conversation (if not already existing) and adds both participants.
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.body.id;

    if (!receiverId) {
      return res.status(400).json({ success: false, message: "Missing recipient" });
    }
    if (receiverId === senderId) {
      return res.status(400).json({ success: false, message: "Cannot create a conversation with yourself" });
    }

    // 1) Fetch sender's conversations
    const { data: senderConvs, error: senderError } = await db
      .from("participants")
      .select("conversation_id")
      .eq("user_id", senderId);

    if (senderError) {
      console.error("Error fetching sender convs:", senderError);
      return res.status(500).json({ success: false, message: "Error fetching sender conversations" });
    }

    // 2) Fetch receiver's conversations
    const { data: receiverConvs, error: receiverError } = await db
      .from("participants")
      .select("conversation_id")
      .eq("user_id", receiverId);

    if (receiverError) {
      console.error("Error fetching receiver convs:", receiverError);
      return res.status(500).json({ success: false, message: "Error fetching receiver conversations" });
    }

    // 3) Intersection in JS
    const senderSet = new Set(senderConvs.map(c => c.conversation_id));
    const commonConv = receiverConvs.find(c => senderSet.has(c.conversation_id));

    if (commonConv) {
      return res.status(200).json({
        success: true,
        message: "Conversation already exists",
        conversation_id: commonConv.conversation_id,
      });
    }

    // 4) Créer une nouvelle conversation
    const { data: conv, error: convError } = await db
      .from("conversations")
      .insert({})
      .select("id")
      .single();

    if (convError || !conv) {
      console.error("Conversation creation error:", convError);
      return res.status(500).json({ success: false, message: "Conversation creation error" });
    }

    const convId = conv.id;

    // 5) Ajouter les participants
    const { error: partError } = await db
      .from("participants")
      .insert([
        { user_id: senderId, conversation_id: convId },
        { user_id: receiverId, conversation_id: convId },
      ]);

    if (partError) {
      console.error("Error adding participants:", partError);
      return res.status(500).json({ success: false, message: "Error adding participants" });
    }

    return res.status(201).json({
      success: true,
      message: "Conversation created",
      conversation_id: convId,
      sender: senderId,
      receiver: receiverId,
    });

  } catch (err) {
    console.error("createconv route error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;