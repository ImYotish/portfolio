const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  console.log('🚪 Demande de déconnexion pour session:', req.sessionID);
  console.log('👤 User ID avant logout:', req.session?.userId);

  // Vérifier si l'utilisateur est connecté
  if (!req.session?.userId) {
    return res.status(401).json({ 
      success: false, 
      message: "Aucune session active" 
    });
  }

  const sid = req.sessionID;
  const userId = req.session.userId;

  // Détruire la session
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Erreur destruction session:', err);
      return res.status(500).json({ 
        success: false, 
        message: "Erreur déconnexion" 
      });
    }

    console.log('🗑️ Session détruite pour utilisateur ID:', userId);

    // Supprimer manuellement de la base si nécessaire
    req.sessionStore.destroy(sid, (storeErr) => {
      if (storeErr) {
        console.error('⚠️ Session non supprimée du store:', storeErr);
      } else {
        console.log('✅ Session supprimée du store');
      }
    });

    // IMPORTANT: Effacer le cookie côté client
    res.clearCookie('sid', {
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });

    console.log('🍪 Cookie effacé');
    
    res.status(200).json({ 
      success: true, 
      message: "Déconnexion réussie" 
    });
  });
});

module.exports = router;