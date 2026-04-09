import express from 'express';
import { createServer as createViteServer } from 'vite';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // MySQL Connection Pool
  let pool: mysql.Pool | null = null;

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sudan_id_db',
      port: parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Initialize Tables
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id VARCHAR(50) PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        nationalId VARCHAR(20) NOT NULL,
        fullName VARCHAR(255) NOT NULL,
        status ENUM('APPROVED', 'REJECTED') NOT NULL,
        confidence FLOAT NOT NULL,
        userData JSON NOT NULL,
        photoUrl LONGTEXT,
        uid VARCHAR(128)
      )
    `);
    connection.release();
    console.log('MySQL Database Initialized');
  } catch (err) {
    console.error('MySQL Connection Error:', err);
  }

  // API Routes
  app.get('/api/logs', async (req, res) => {
    if (!pool) return res.status(500).json({ error: 'Database not connected' });
    try {
      const [rows] = await pool.query('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get('/api/logs/search', async (req, res) => {
    if (!pool) return res.status(500).json({ error: 'Database not connected' });
    const { q } = req.query;
    try {
      const [rows] = await pool.query(
        'SELECT * FROM logs WHERE nationalId = ? OR fullName LIKE ? LIMIT 10',
        [q, `%${q}%`]
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/logs', async (req, res) => {
    if (!pool) return res.status(500).json({ error: 'Database not connected' });
    const { id, nationalId, fullName, status, confidence, userData, photoUrl, uid } = req.body;
    try {
      await pool.query(
        'INSERT INTO logs (id, nationalId, fullName, status, confidence, userData, photoUrl, uid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, nationalId, fullName, status, confidence, JSON.stringify(userData), photoUrl, uid]
      );
      res.status(201).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
