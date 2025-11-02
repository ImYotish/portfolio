import express from 'express';
import requireAuth from "../middlewares/requireAuth.js"
import db from "../database.js";

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { content, recipientId } = req.body;

    if (!content || !recipientId) {
      return res.status(400).json({ success: false, message: 'Paramètres manquants' });
    }
    if (recipientId === senderId) {
      return res.status(400).json({ success: false, message: "Impossible de s'envoyer un message à soi-même" });
    }

    // 1) Récupérer les convs du sender
    const { data: senderConvs, error: senderError } = await db
      .from('participants')
      .select('conversation_id')
      .eq('user_id', senderId);

    if (senderError) {
      console.error('Erreur récupération convs sender:', senderError);
      return res.status(500).json({ success: false, message: 'Erreur récupération convs sender' });
    }

    // 2) Récupérer les convs du destinataire
    const { data: receiverConvs, error: receiverError } = await db
      .from('participants')
      .select('conversation_id')
      .eq('user_id', recipientId);

    if (receiverError) {
      console.error('Erreur récupération convs receiver:', receiverError);
      return res.status(500).json({ success: false, message: 'Erreur récupération convs receiver' });
    }

    // 3) Intersection en JS
    const senderSet = new Set(senderConvs.map(c => c.conversation_id));
    const commonConv = receiverConvs.find(c => senderSet.has(c.conversation_id));

    if (!commonConv) {
      return res.status(404).json({ success: false, message: 'Pas de conversation commune' });
    }

    // 4) Insérer le message
    const { data: inserted, error: msgError } = await db
      .from('messages')
      .insert({
        conversation_id: commonConv.conversation_id,
        sender_id: senderId,
        content
      })
      .select('id, content, sender_id, sent_at')
      .single();

    if (msgError) {
      console.error('Erreur insertion message:', msgError);
      return res.status(500).json({ success: false, message: 'Erreur envoi message' });
    }

    return res.status(201).json({ success: true, message: inserted });

  } catch (err) {
    console.error('Erreur route /message:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;