import express from 'express';
import requireAuth from "../middlewares/requireAuth.js"
import db from "../database.js";

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { content, recipientId } = req.body;

    if (!content || !recipientId) {
      return res.status(400).json({ success: false, message: 'Missing parameters' });
    }
    if (recipientId === senderId) {
      return res.status(400).json({ success: false, message: "Cannot send a message to yourself" });
    }

    // 1) Récupérer les convs du sender
    const { data: senderConvs, error: senderError } = await db
      .from('participants')
      .select('conversation_id')
      .eq('user_id', senderId);

    if (senderError) {
      console.error('Error fetching sender convs:', senderError);
      return res.status(500).json({ success: false, message: 'Error fetching sender conversations' });
    }

    // 2) Récupérer les convs du destinataire
    const { data: receiverConvs, error: receiverError } = await db
      .from('participants')
      .select('conversation_id')
      .eq('user_id', recipientId);

    if (receiverError) {
      console.error('Error fetching receiver convs:', receiverError);
      return res.status(500).json({ success: false, message: 'Error fetching receiver conversations' });
    }

    // 3) Intersection en JS
    const senderSet = new Set(senderConvs.map(c => c.conversation_id));
    const commonConv = receiverConvs.find(c => senderSet.has(c.conversation_id));

    if (!commonConv) {
      return res.status(404).json({ success: false, message: 'No common conversation' });
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
      console.error('Message insertion error:', msgError);
      return res.status(500).json({ success: false, message: 'Message send error' });
    }

    return res.status(201).json({ success: true, message: inserted });

  } catch (err) {
    console.error('message route error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;