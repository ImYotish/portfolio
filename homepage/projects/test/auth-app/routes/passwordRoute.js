const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../database');

const saltRounds = 10;

router.post('/', async (req, res) => {
  console.log('Contenu du body :', req.body);

  try {
    const { username, password } = req.body;

    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Aucun utilisateur' });
    }

    const hashPassword = await bcrypt.hash(password, saltRounds);

    await db.query("UPDATE users SET hashed_password = $1 WHERE username = $2", [hashPassword, username]);

    const user = result.rows[0]

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
    console.error('Erreur générale :', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;