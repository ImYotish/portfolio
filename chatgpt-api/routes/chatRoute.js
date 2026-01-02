import express from 'express';
import { api } from '../utils/buffer.js';
import db from '../database.js'; // your Supabase client
import { nanoid } from 'nanoid';

const router = express.Router();

router.post('/', async (req, res) => {
  const { messages } = req.body;
  const input = messages?.[0]?.content;

  if (!input) {
    return res.status(400).json({ error: 'Missing message' });
  }

  // 1) Generate a unique ID and insert into chat_list
  let id, success = false;
  while (!success) {
    try {
      id = nanoid(16);

      const { error } = await db
        .from('chat_list')
        .insert({ conv_id: id, titre: 'In progress...' });

      if (error) {
        if (error.code === '23505') {
          // duplicate -> retry
          continue;
        }
        throw error;
      }

      success = true;
    } catch (err) {
      console.error('chat_list insertion error:', err);
      return res.status(500).json({ error: 'Conversation creation error' });
    }
  }

  console.log('New conversation ID:', id);

  // 2) Send the ID in a header
  res.setHeader('X-Conv-Id', id);
  res.setHeader('Access-Control-Expose-Headers', 'X-Conv-Id');

  // 3) Generate the response as a stream
  let output = '';
  await api(messages, (token) => {
    output += token;
    console.log(token)
    res.write(token);
  });

  res.end();

  // 4) Generate a short title based on input/output
  let title = '';
  const text = [
    {
      role: 'user',
      content:
        'Give me a title of at most 4 words, no punctuation or style. Input: ' +
        input +
        ' Output: ' +
        output,
    },
  ];

  await api(text, (token) => {
    title += token;
  });

  console.log('Generated title:', title);

  // 5) Update the title and insert the conversation
  try {
    await db.from('chat_list').update({ titre: title }).eq('conv_id', id);

    await db.from('chat').insert({
      id,
      input,
      output,
    });
  } catch (err) {
    console.error('Chat update error:', err);
  }
});

export default router;