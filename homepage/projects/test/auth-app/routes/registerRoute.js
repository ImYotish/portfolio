const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existUsername = await db.query(
      'SELECT username FROM users WHERE username = $1',
      [username]
    );

    if (existUsername.rows.length > 0) {
      return res.status(409).json({ message: "Nom d'utilisateur déjà utilisé" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const data = await db.query(
      'INSERT INTO users (username, hashed_password) VALUES ($1, $2) RETURNING id',
      [username, hashPassword]
    );

    const id = data.rows[0].id

    const result = await db.query('SELECT * FROM users WHERE id = $1', [id])

    const user = result.rows[0]

    console.log("user :", user)

    req.session.regenerate((err) => {
      if (err) {
        console.error('Erreur régénération session:', err);
        return res.status(500).json({ success: false, message: 'Erreur session' });
      }
      
      // Assigner userId et sauvegarder
      req.session.userId = user.id;
      
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Erreur sauvegarde session:', saveErr);
          return res.status(500).json({ success: false, message: 'Erreur sauvegarde session' });
        }
        
        console.log(`✅ Connexion réussie pour ${user.username} (ID: ${user.id})`);
        
        res.status(200).json({ 
          success: true,
          message: 'Connexion réussie'
        });
      });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur générale' });
  }
});

module.exports = router;