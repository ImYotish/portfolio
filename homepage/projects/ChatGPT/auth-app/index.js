import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


import chat from './routes/chatRoute.js';
import save from './routes/saveRoute.js';

dotenv.config();

const PORT = 3000;
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use('/public', express.static('public'));
app.use(cors({origin: "http://localhost:5501"}));
app.use(express.json());

// Catch-all pour les conversations
app.get('/public/ChatGPT/chats/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/ChatGPT/index.html'));
});

const routes = {
  '/chat': chat,
  '/save': save
}

Object.entries(routes).forEach(([route, handler]) =>
  app.use(route, handler)
);

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});



































/*import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({origin: 'http://localhost:5500'}))

app.post('/chat', async (req, res) => {

   const { messages } = req.body

   if (messages.length === 0) {
    return res.status(404).json({message: "Mauvais message"})
   }

   console.log("first stage")

   const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      messages,
      model: 'openai/gpt-oss-120b',
      stream: true
    }),
  });

  const data = await upstream.body.getReader();
  const decoder = new TextDecoder('utf-8')

  console.log(data)

  while (true) {

    const { value, done } = await data.read();
    if (done) break

    const chunk = decoder.decode(value, { stream: true })

    console.log(chunk)

    res.write(chunk)
  }
  res.end()
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});


*/







































/* import http from "http";
import { config as dotenv } from "dotenv";
import { Readable } from "stream";

dotenv();

const PORT = process.env.PORT || 3000;
const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = process.env.GROQ_API_KEY;

// Utilitaire pour lire le corps JSON d'une requête POST
function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS simple pour dev local; ajuste origin en prod
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5500");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === "POST" && req.url === "/chat") {
    try {
      const body = await readJson(req);
      const {
        messages = [],
        model = "openai/gpt-oss-120b",m
        temperature = 1,
        max_completion_tokens = 8192,
        top_p = 1,
        reasoning_effort = "medium",
        stop = null,
        stream = true,
      } = body;

      // Validation minimaliste
      if (!Array.isArray(messages) || messages.length === 0) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        return res.end("Bad request: messages manquants");
      }
      if (!API_KEY) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        return res.end("Serveur: GROQ_API_KEY manquant");
      }

      // Appel Groq via fetch natif (Node 18+)
      const groqRes = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          messages,
          model,
          temperature,
          max_completion_tokens,
          top_p,
          stream,
          reasoning_effort,
          stop,
        }),
      });

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        res.writeHead(groqRes.status, { "Content-Type": "text/plain" });
        return res.end(`Groq error: ${errText}`);
      }

      // On propage le stream tel quel au client (texte/SSE-like)
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Transfer-Encoding": "chunked",
      });

      // lecture du flux Groq et écriture en direct vers le client
      const reader = groqRes.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value));
      }
      res.end();
    } catch (e) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(`Erreur serveur: ${e.message || e}`);
    }
    return;
  }

  // Fallback
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); */