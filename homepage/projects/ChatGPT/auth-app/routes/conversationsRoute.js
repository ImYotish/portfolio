import express from 'express';
import dotenv from 'dotenv';
import db from '../database.js'

dotenv.config();

const router = express.Router()

const __dirname = path.resolve();

// Exemple Express
router.get('/api/conversations/:id', async (req, res) => {
  const convId = req.params.id;

  try {
    // 1. Récupérer la conversation (titre + user)
    const convResult = await db.query(
      `SELECT conv_id
       FROM list_conv`,
      [convId]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation introuvable' });
    }

    const conversation = convResult.rows[0];

    const messagesResult = await db.query(
      `SELECT c.id, c.input, c.output, c.created_at
       FROM conv as c
       JOIN 
       WHERE conv_id = $1
       ORDER BY c.created_at ASC`,
      [convId]
    );

    res.json({
      id: conversation.conv_id,
      title: conversation.title,
      user: conversation.username,
      messages: messagesResult.rows.map(m => ({
        id: m.id,
        input: m.input,
        output: m.output
      }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Route front : toutes les URL /conversation/:id renvoient le même HTML
router.get('/conversation/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'conversation.html'));
});

export default router;