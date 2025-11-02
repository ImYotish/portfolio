import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// Middleware anti-cache pour routes sensibles
app.use((req, res, next) => {
  if (['/check-session','/login','/register','/password','/logout'].some(path => req.url.includes(path))) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});


// --- Import de tes routes (elles devront utiliser req.user si besoin) ---
import usernameRoute from './routes/usernameRoute.js';
import createconvRoute from './routes/createconvRoute.js';
import generateconvRoute from './routes/generateconvRoute.js';
import messageRoute from './routes/messageRoute.js';
import generatemessageRoute from './routes/generatemessageRoute.js';

// Mapping des routes
const routes = {
  '/username': usernameRoute,
  '/createconv': createconvRoute,
  '/generateconv': generateconvRoute,
  '/message': messageRoute,
  '/generatemessage': generatemessageRoute
};

// Montage automatique
Object.entries(routes).forEach(([route, handler]) =>
  app.use(route, handler)
);

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});