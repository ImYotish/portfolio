import express from "express";
import requireAuth from "../middlewares/requireAuth.js"
import db from "../database.js";

const router = express.Router();

/**
 * POST /message/createconv
 * body: { id: uuid } → l’ID du destinataire
 * Crée une nouvelle conversation (si elle n’existe pas déjà) et ajoute les deux participants.
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.body.id;

    if (!receiverId) {
      return res.status(400).json({ success: false, message: "Destinataire manquant" });
    }
    if (receiverId === senderId) {
      return res.status(400).json({ success: false, message: "Impossible de créer une conversation avec soi-même" });
    }

    // 1) Récupérer les conversations du sender
    const { data: senderConvs, error: senderError } = await db
      .from("participants")
      .select("conversation_id")
      .eq("user_id", senderId);

    if (senderError) {
      console.error("Erreur récupération convs sender:", senderError);
      return res.status(500).json({ success: false, message: "Erreur récupération convs sender" });
    }

    // 2) Récupérer les conversations du receiver
    const { data: receiverConvs, error: receiverError } = await db
      .from("participants")
      .select("conversation_id")
      .eq("user_id", receiverId);

    if (receiverError) {
      console.error("Erreur récupération convs receiver:", receiverError);
      return res.status(500).json({ success: false, message: "Erreur récupération convs receiver" });
    }

    // 3) Intersection en JS
    const senderSet = new Set(senderConvs.map(c => c.conversation_id));
    const commonConv = receiverConvs.find(c => senderSet.has(c.conversation_id));

    if (commonConv) {
      return res.status(200).json({
        success: true,
        message: "Conversation déjà existante",
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
      console.error("Erreur création conversation:", convError);
      return res.status(500).json({ success: false, message: "Erreur création conversation" });
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
      console.error("Erreur ajout participants:", partError);
      return res.status(500).json({ success: false, message: "Erreur ajout participants" });
    }

    return res.status(201).json({
      success: true,
      message: "Conversation créée",
      conversation_id: convId,
      sender: senderId,
      receiver: receiverId,
    });

  } catch (err) {
    console.error("Erreur route /createconv:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

export default router;