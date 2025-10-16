const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database');
const router = express.Router();

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Vérification en base
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Utilisateur introuvable' });
    }
    
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.hashed_password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
    }

    // Régénération et sauvegarde de session
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
    
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;