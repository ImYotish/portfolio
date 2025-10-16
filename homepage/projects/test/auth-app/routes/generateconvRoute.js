const express = require('express');
const db = require('../database');
const router = express.Router();

router.post('/', async (req, res) => {
  try {

    const user_id = req.session?.userId

    const data = await db.query("SELECT u.username, p.conversation_id FROM users u JOIN participants p ON p.user_id = u.id JOIN conversations c ON c.id = p.conversation_id WHERE p.conversation_id IN (SELECT conversation_id FROM participants WHERE user_id = $1) AND u.id != $2", [user_id, user_id])

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