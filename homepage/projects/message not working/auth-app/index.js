// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const PgStore = require('connect-pg-simple')(session);
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middlewares ----
app.use(cors());
app.use(express.json());
app.use(session({
  store: new PgStore({
    pool: db,
    createTableIfMissing: true      // génère la table `session` si elle n'existe pas
  }),
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }        // true en prod HTTPS
}));

// ---- Serve static files ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- Health check ----
app.get('/', (req, res) => {
  res.send('Serveur Express en ligne ✅');
});

// ---- Helper d’authentification ----
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  next();
}

// ---- Route /me ----
app.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  res.json({ id: req.session.user.id, username: req.session.user.username });
});

// ---- Auth routes ----

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('📩 POST /login', { username });
  try {
    const result = await db.query(
      'SELECT id, username FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects ❌' });
    }
    req.session.user = result.rows[0];
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('🔥 Erreur /login :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur ❌' });
  }
});

// Register
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log('📩 POST /register', { username });
  try {
    const { rows } = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Utilisateur déjà existant ❌' });
    }
    await db.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
    res.status(201).json({ success: true, message: 'Compte créé 🎉' });
  } catch (err) {
    console.error('🔥 Erreur /register :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur ❌' });
  }
});

// Reset password
app.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;
  console.log('📩 POST /reset-password', { username });
  if (!username || !newPassword) {
    return res.status(400).json({ success: false, message: 'Champs manquants ❌' });
  }
  try {
    const result = await db.query(
      'UPDATE users SET password = $1 WHERE username = $2',
      [newPassword, username]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable ❌' });
    }
    res.json({ success: true, message: 'Mot de passe mis à jour ✅' });
  } catch (err) {
    console.error('🔥 Erreur /reset-password :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur ❌' });
  }
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('🔥 Erreur /logout :', err);
      return res.status(500).json({ success: false, message: 'Erreur serveur ❌' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// ---- Messaging API (sécurisé) ----

// Lister les conversations
app.get('/conversations', requireAuth, async (req, res) => {
  const userId = req.session.user.id;
  console.log(`📩 GET /conversations user=${userId}`);
  try {
    const result = await db.query(`
      SELECT c.id, u.username,
        (SELECT content
         FROM messages
         WHERE conversation_id = c.id
         ORDER BY created_at DESC
         LIMIT 1) AS lastMessage
      FROM conversations c
      JOIN conversation_participants cp ON cp.conversation_id = c.id
      JOIN users u ON u.id = cp.user_id
      WHERE c.id IN (
        SELECT conversation_id
        FROM conversation_participants
        WHERE user_id = $1
      )
      AND u.id != $1
      GROUP BY c.id, u.username
      ORDER BY lastMessage DESC
      LIMIT 20;
    `, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('🔥 Erreur /conversations :', err);
    res.status(500).json({ error: 'Erreur serveur ❌' });
  }
});

// Récupérer les messages d’une conversation
app.get('/messages', requireAuth, async (req, res) => {
  const userId = req.session.user.id;
  const convId = parseInt(req.query.convId, 10);
  console.log(`📩 GET /messages convId=${convId} user=${userId}`);
  if (!convId) {
    return res.status(400).json({ error: 'convId requis ❌' });
  }
  try {
    const check = await db.query(
      'SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
      [convId, userId]
    );
    if (check.rows.length === 0) {
      return res.status(403).json({ error: 'Accès refusé ❌' });
    }
    const result = await db.query(
      `SELECT id, sender_id, content, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [convId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('🔥 Erreur /messages :', err);
    res.status(500).json({ error: 'Erreur serveur ❌' });
  }
});

// Envoyer un nouveau message
app.post('/messages', requireAuth, async (req, res) => {
  const userId = req.session.user.id;
  const { conversationId, content } = req.body;
  console.log('📩 POST /messages', { conversationId, content });
  if (!conversationId || !content) {
    return res.status(400).json({ error: 'conversationId et content requis ❌' });
  }
  try {
    const result = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, sender_id, content, created_at`,
      [conversationId, userId, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('🔥 Erreur POST /messages :', err);
    res.status(500).json({ error: 'Erreur serveur ❌' });
  }
});

// Démarrer une conversation 1-to-1
app.post('/start-conversation', requireAuth, async (req, res) => {
  console.log('📩 POST /start-conversation', { body: req.body, user: req.session.user });
  const userId = req.session.user.id;
  const { withUsername } = req.body;
  if (!withUsername) {
    return res.status(400).json({ success: false, message: 'Nom d’utilisateur requis ❌' });
  }
  try {
    const contactRes = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [withUsername]
    );
    if (contactRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable ❌' });
    }
    const contactId = contactRes.rows[0].id;

    const convRes = await db.query(`
      SELECT c.id
      FROM conversations c
      JOIN conversation_participants cp1 
        ON cp1.conversation_id = c.id AND cp1.user_id = $1
      JOIN conversation_participants cp2 
        ON cp2.conversation_id = c.id AND cp2.user_id = $2
      WHERE c.is_group = FALSE
    `, [userId, contactId]);

    let convId;
    if (convRes.rows.length > 0) {
      convId = convRes.rows[0].id;
    } else {
      const newConv = await db.query(
        'INSERT INTO conversations (is_group) VALUES (FALSE) RETURNING id'
      );
      convId = newConv.rows[0].id;
      await db.query(
        `INSERT INTO conversation_participants (conversation_id, user_id)
         VALUES ($1, $2), ($1, $3)`,
        [convId, userId, contactId]
      );
    }

    res.json({ success: true, convId });
  } catch (err) {
    console.error('🔥 Erreur /start-conversation :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur ❌' });
  }
});

// ---- Démarrage du serveur ----
app.listen(PORT, () => {
  console.log(`🔊 Serveur lancé sur http://localhost:${PORT}`);
});