import express from 'express';
import requireAuth from "../middlewares/requireAuth.js"
import db from "../database.js";

const router = express.Router();

/**
 * POST /message/generateconv
 * Retrieves all conversations of the connected user
 * and returns the other participants (id + username).
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1) Récupérer toutes les convs de l’utilisateur
    const { data: convs, error: convsError } = await db
      .from('participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (convsError) {
      console.error('Error fetching convs:', convsError);
      return res.status(500).json({ success: false, message: 'Error fetching conversations' });
    }

    if (!convs || convs.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const convIds = convs.map(c => c.conversation_id);

    // 2) Récupérer les autres participants de ces convs
    const { data: participants, error: partError } = await db
      .from('participants')
      .select('conversation_id, profiles(id, username)')
      .in('conversation_id', convIds)
      .neq('user_id', userId);

    if (partError) {
      console.error('Error fetching participants:', partError);
      return res.status(500).json({ success: false, message: 'Error fetching participants' });
    }

    const result = participants.map(p => ({
      conversation_id: p.conversation_id,
      id: p.profiles.id,
      username: p.profiles.username
    }));

    res.json({ success: true, data: result });

  } catch (err) {
    console.error('generateconv route error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;