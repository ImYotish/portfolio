const express = require('express');
const router = express.Router();
const db = require('../database')

router.post('/', async (req, res) => {
  const { username } = req.body;
  const user_id = req.session?.userId

    console.log(username)

  try {
    const user = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    console.log(user_id, user.rows[0].id)
    console.log(typeof user_id, typeof user.rows[0].id)

    if (!user.rows[0]) {
        console.log('pas bon');
        return res.status(404).json({ message: "Utilisateur introuvable", success: false });

    } if (user_id === user.rows[0].id) {
      console.log('pas bon');
      return res.status(404).json({ message: "Toi même", success: false });
    }

    else {
        console.log('bon');
        return res.status(200).json({ message: "Utilisateur trouvé", success: true, id: user.rows[0].id });
    }

    } catch (err) {
        console.error(err.message)
    }
});

module.exports = router;