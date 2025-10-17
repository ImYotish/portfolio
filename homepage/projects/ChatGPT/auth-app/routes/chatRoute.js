import express from 'express';
import { api } from '../public/utils/buffer.js';
import db from '../database.js'
import { nanoid } from 'nanoid';


const router = express.Router()

router.post('/', async (req, res) => {

  const { messages } = req.body;
  const input = messages[0].content;

  let id, success = false;
  while (!success) {
    try {
      id = nanoid(16);
      await db.query(
        "INSERT INTO chat_list (conv_id, titre) VALUES($1, $2)",
        [id, "En cours..."]
      );
      success = true;
    } catch (err) {
      if (err.code !== '23505') throw err;
    }
  }

  console.log(id)

  // 2) Envoyer l'ID dans un header
  res.setHeader('X-Conv-Id', id);
  res.setHeader('Access-Control-Expose-Headers', 'X-Conv-Id');

  
  let output = "";
  let title = "";

  await api(messages, (token) => {
    output += token
    res.write(token)
    })

    res.end()

   const text = [{ role: 'user', content: 'Donne moi un titre de 4 mots maximum, tu ne dois mettre aucune ponctuation ou appliquer de style sur le texte voici sur quoi tu dois baser ta réflexion : Input : ' + input + ' Output : ' + output}]

  await api(text,  (token) => {
    title += token
  })

  console.log(title)
  


      await db.query(
        "UPDATE chat_list SET titre = $1 WHERE conv_id = $2",
        [title, id]
      );

      await db.query(
        "INSERT INTO chat (id, input, output) VALUES($1, $2, $3)",
        [id, input, output]
      );
})

export default router;