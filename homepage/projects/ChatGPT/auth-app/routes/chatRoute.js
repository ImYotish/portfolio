import express from 'express';
import { api } from '../utils/buffer.js';
import db from '../database.js'; // ton client Supabase
import { nanoid } from 'nanoid';

const router = express.Router();

router.post('/', async (req, res) => {
  const { messages } = req.body;
  const input = messages?.[0]?.content;

  if (!input) {
    return res.status(400).json({ error: 'Message manquant' });
  }

  // 1) Générer un ID unique et insérer dans chat_list
  let id, success = false;
  while (!success) {
    try {
      id = nanoid(16);

      const { error } = await db
        .from('chat_list')
        .insert({ conv_id: id, titre: 'En cours...' });

      if (error) {
        if (error.code === '23505') {
          // doublon → on réessaie
          continue;
        }
        throw error;
      }

      success = true;
    } catch (err) {
      console.error('Erreur insertion chat_list:', err);
      return res.status(500).json({ error: 'Erreur création conversation' });
    }
  }

  console.log('Nouvelle conversation ID:', id);

  // 2) Envoyer l’ID dans un header
  res.setHeader('X-Conv-Id', id);
  res.setHeader('Access-Control-Expose-Headers', 'X-Conv-Id');

  // 3) Générer la réponse en streaming
  let output = '';
  await api(messages, (token) => {
    output += token;
    console.log(token)
    res.write(token);
  });

  res.end();

  // 4) Générer un titre court basé sur input/output
  let title = '';
  const text = [
    {
      role: 'user',
      content:
        'Donne moi un titre de 4 mots maximum, sans ponctuation ni style. Input : ' +
        input +
        ' Output : ' +
        output,
    },
  ];

  await api(text, (token) => {
    title += token;
  });

  console.log('Titre généré:', title);

  // 5) Mettre à jour le titre et insérer la conversation
  try {
    await db.from('chat_list').update({ titre: title }).eq('conv_id', id);

    await db.from('chat').insert({
      id,
      input,
      output,
    });
  } catch (err) {
    console.error('Erreur mise à jour chat:', err);
  }
});

export default router;