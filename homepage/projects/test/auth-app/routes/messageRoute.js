const express = require('express');
const db = require('../database');
const router = express.Router();

router.post('/', async (req, res) => {
  try {

    console.log(req.body)

    const senderId = req.session?.userId
    const username = req.body.username
    const content = req.body.send

    const data = await db.query("SELECT p.conversation_id FROM participants p JOIN users u ON u.id = p.user_id WHERE p.conversation_id IN (SELECT conversation_id FROM participants WHERE user_id = $1) AND u.username = $2", [senderId, username])

    const conversationId = data.rows[0].conversation_id

    await db.query("INSERT INTO messages (conversation_id, sender_id, content) VALUES($1, $2, $3)", [conversationId, senderId, content])


    return res.status(200).json({ success: true });
    

   

  } catch (err) {
    console.error(err)
  }
});

module.exports = router;