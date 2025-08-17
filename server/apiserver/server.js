import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { OpenAI } from "openai";

const app = express();
app.use(express.json());

// Cliente de OpenAI usando tu clave del .env
const client = new OpenAI({
  apiKey: process.env.API_KEY
});

app.get("/", (req, res) => {
  
  res.send("¡Hola! Este es el servidor de la API de OpenAI.");
  return res;
});

// Endpoint: recibe un mensaje y devuelve la respuesta
app.post("/chat", async (req, res) => {
  console.log("Solicitud recibida:", req.body);
  const { message } = req.body;
  console.log("Mensaje recibido:", message);  
  if (!message) {
    return res.status(400).json({ error: "Falta el campo 'message' en el body" });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // modelo rápido y económico
      messages: [
        { role: "system", content: "Eres un asistente que responde en español." },
        { role: "user", content: message }
      ]
    });

    const answer = completion.choices[0].message.content;
    res.json({ reply: answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al consultar OpenAI" });
  }
});

// Arranca el servidor
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});