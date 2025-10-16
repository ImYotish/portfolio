const express = require('express');
const db = require('../database');
const router = express.Router();

router.post('/', async (req, res) => {
  try {

    const senderId = req.session?.userId
    const receiverId = req.body.username

    const el = await db.query("SELECT p.conversation_id FROM participants p JOIN users u ON u.id = p.user_id WHERE p.conversation_id IN (SELECT conversation_id FROM participants WHERE user_id = $1) AND u.username = $2", [senderId, receiverId])

    const convId = el.rows[0].conversation_id

    console.log(convId)

    const data = await db.query("SELECT content FROM messages WHERE conversation_id = $1", [convId])

    console.log(data)

    if (!data) {
      res.status(200).json({
        succes: true, data: false
      })
    } else {
      res.status(200).json({
        succes: true, data: data
      })
    }

  } catch (err) {
    console.error(err)
  }
});

module.exports = router;