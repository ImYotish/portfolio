const express = require('express');
const cors = require('cors');
const session = require('express-session');
const PgStore = require('connect-pg-simple')(session);
const db = require('./database');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use((req, res, next) => {
  // Pour toutes les routes sensibles, empêcher le cache
  if (req.url.includes('/check-session') || 
      req.url.includes('/login') || 
      req.url.includes('/register') || 
      req.url.includes('/password') || 
      req.url.includes('/logout')) {
    
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
});

// Configuration session finale
app.use(session({
  store: new PgStore({ 
    pool: db, 
    createTableIfMissing: true,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, // Revenir à false maintenant que ça marche
  name: 'sid',
  rolling: true,
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 heure
    secure: false,           // false pour HTTP
    httpOnly: true,          // ⚠️ REMETTRE à true pour la sécurité
    sameSite: 'lax'         // lax maintenant que c'est sur localhost
  }
}));

// Routes
const routesSensible = {
  '/login': require('./routes/loginRoute'),
  '/register': require('./routes/registerRoute'),
  '/password': require('./routes/passwordRoute'),
  '/logout': require('./routes/logoutRoute')
};

Object.entries(routesSensible).forEach(([route, handler]) =>
  app.use(route, handler)
);

const routes = {
  '/check-session': require('./routes/checksessionRoute'),
  '/username': require('./routes/usernameRoute'),
  '/createconv': require('./routes/createconvRoute'),
  '/generateconv': require('./routes/generateconvRoute'),
  '/message': require('./routes/messageRoute'),
  '/generatemessage': require('./routes/generatemessageRoute')
};

Object.entries(routes).forEach(([route, handler]) =>
  app.use(route, handler)
);

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});