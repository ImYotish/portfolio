import express from 'express';
import requireAuth from "../middlewares/requireAuth.js"
import db from "../database.js";

const router = express.Router();

/**
 * POST /message/generatemessage
 * body: { id: uuid } → recipient ID
 * Returns all messages from the common conversation.
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.body.id;

    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'Missing recipient' });
    }
    if (receiverId === senderId) {
      return res.status(400).json({ success: false, message: 'Cannot generate a conversation with yourself' });
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

    // 2) Récupérer les convs du receiver
    const { data: receiverConvs, error: receiverError } = await db
      .from('participants')
      .select('conversation_id')
      .eq('user_id', receiverId);

    if (receiverError) {
      console.error('Error fetching receiver convs:', receiverError);
      return res.status(500).json({ success: false, message: 'Error fetching receiver conversations' });
    }

    // 3) Intersection en JS
    const senderSet = new Set(senderConvs.map(c => c.conversation_id));
    const commonConv = receiverConvs.find(c => senderSet.has(c.conversation_id));

    if (!commonConv) {
      return res.json({ success: true, data: [] });
    }

    // 4) Récupérer les messages de la conv commune
    const { data: messages, error: msgError } = await db
      .from('messages')
      .select('id, content, sender_id, sent_at, profiles(username)')
      .eq('conversation_id', commonConv.conversation_id)
      .order('sent_at', { ascending: true });

    if (msgError) {
      console.error('Error fetching messages:', msgError);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    return res.json({ success: true, data: messages || [] });

  } catch (err) {
    console.error('generatemessage route error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;