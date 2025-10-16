const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    console.log('🔍 Check session - ID:', req.sessionID);
    console.log('👤 User ID en session:', req.session?.userId);
    console.log('🍪 Cookies reçus:', req.headers.cookie);

    // Vérifier si l'utilisateur est connecté
    if (!req.session?.userId) {
      console.log('❌ Aucune session utilisateur trouvée');
      return res.status(401).json({ 
        loggedIn: false,
        message: 'Aucune session active'
      });
    }

    // Récupérer les données utilisateur
    const data = await db.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
    
    if (data.rows.length === 0) {
      console.log('❌ Utilisateur non trouvé en base pour ID:', req.session.userId);
      // Détruire la session corrompue
      req.session.destroy();
      return res.status(401).json({ 
        loggedIn: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const user = data.rows[0];
    console.log('✅ Utilisateur authentifié:', user.username);

    res.json({ 
      loggedIn: true, 
      user: user.username,
      userId: user.id,
      sessionId: req.sessionID
    });

  } catch (error) {
    console.error('❌ Erreur check-session:', error);
    res.status(500).json({ 
      loggedIn: false, 
      message: 'Erreur serveur' 
    });
  }
});

module.exports = router;