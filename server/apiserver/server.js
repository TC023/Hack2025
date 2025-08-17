import dotenv from "dotenv";
dotenv.config();

import express from "express";
import multer from "multer";
import { OpenAI } from "openai";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
app.use(express.json());
const upload = multer();

// --- Postgres Pool ---
// Expect the following environment variables in .env:
// PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD (standard libpq vars)
// Optionally DATABASE_URL can be used (overrides individual parts)
let pool;
try {
  if (process.env.DATABASE_URL) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false });
  } else {
    pool = new Pool({
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      database: process.env.PGDATABASE || 'postgres',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false
    });
  }
  pool.on('error', (err) => {
    console.error('Postgres pool error', err);
  });
} catch (e) {
  console.error('Failed to initialize Postgres pool:', e);
}

// Cliente de OpenAI usando tu clave del .env
const client = new OpenAI({
  apiKey: process.env.API_KEY
});

app.get("/", (req, res) => {
  
  res.send("¡Hola! Este es el servidor de la API de OpenAI.");
  return res;
});

// Endpoint: recibe un mensaje y devuelve la respuesta
app.post("/chat", upload.none(), async (req, res) => {
  const { message } = req.body;
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

// POST /users: crea un nuevo usuario
// Body JSON esperado: { nombres, apellidos, correo, contraseña, grado_escolar, idioma }
// Nota: contraseña se almacena actualmente en texto plano como solicitó el usuario (no recomendado en producción)
app.post('/users', async (req, res) => {
  const { nombres, apellidos, correo, contraseña, grado_escolar, idioma } = req.body;

  // Validación básica
  if (!nombres || !apellidos || !correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: nombres, apellidos, correo, contraseña' });
  }

  if (!pool) {
    return res.status(500).json({ error: 'Base de datos no inicializada' });
  }

  try {
    // Crear tabla si no existe (id autoincremental)
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
  nombres TEXT NOT NULL,
        apellidos TEXT NOT NULL,
        correo TEXT UNIQUE NOT NULL,
        contraseña TEXT NOT NULL,
        grado_escolar TEXT,
        idioma TEXT,
        area_interes TEXT,
        carrera_interes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`);
    // Asegura columnas nuevas si la tabla ya existía sin ellas
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS area_interes TEXT;');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS carrera_interes TEXT;');

    // NOTA: Se solicitó que grado_escolar e idioma estaban invertidos; por ahora se intercambian al insertar
    // para que el valor recibido en "grado_escolar" termine en la columna idioma y viceversa.
    const insertQuery = `INSERT INTO users (nombres, apellidos, correo, contraseña, grado_escolar, idioma, area_interes, carrera_interes)
                         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                         RETURNING id, nombres, apellidos, correo, grado_escolar, idioma, area_interes, carrera_interes, created_at`;
    const insertValues = [
      nombres,
      apellidos,
      correo,
      contraseña,
      idioma || null,          // swap solicitado
      grado_escolar || null,   // swap solicitado
      null,                    // area_interes nulo
      null                     // carrera_interes nulo
    ];
    const { rows } = await pool.query(insertQuery, insertValues);

    return res.status(201).json({ usuario: rows[0] });
  } catch (error) {
    console.error('Error creando usuario:', error);
    if (error.code === '23505') { // unique violation
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});