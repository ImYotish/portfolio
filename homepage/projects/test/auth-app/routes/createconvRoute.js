const express = require('express');
const db = require('../database');
const router = express.Router();

router.post('/', async (req, res) => {
  try {

    console.log(req.body)

    const result = await db.query('INSERT INTO conversations DEFAULT VALUES RETURNING id;')

    const conv_id = result.rows[0].id
    const receiver = req.body.id
    const sender = req.session?.userId

    console.log(conv_id)
    console.log(receiver)
    console.log(sender)


    await db.query('INSERT INTO participants (user_id, conversation_id) VALUES ($1, $2), ($3, $4)', [receiver, conv_id, sender, conv_id])

    res.status(200).json({sender: sender, receiver: receiver, conv: conv_id, success: true})

  } catch (err) {
    console.error(err)
  }
});

module.exports = router;