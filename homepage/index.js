import express from "express";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json());
app.use(cookieParser());

import loginRoute from './routes/loginRoute.js';
import registerRoute from './routes/registerRoute.js';
import checksessionRoute from './routes/checksessionRoute.js';
import logoutRoute from './routes/logoutRoute.js';
import protectedRoute from './routes/protectedRoute.js';

const routes = {
  '/login': loginRoute,
  '/register': registerRoute,
  '/logout': logoutRoute,
  '/check-session': checksessionRoute,
  '/protected': protectedRoute,
};

Object.entries(routes).forEach(([route, handler]) =>
  app.use(route, handler)
);

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});

//TEST DE MERGE -> MAIN - DEV REUSSI