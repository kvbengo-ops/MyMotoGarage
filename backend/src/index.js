import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import vehicleRoutes from './routes/vehicleRoutes.js';
import trafficRoutes from './routes/trafficRoutes.js';
import gasPricesRoute from './routes/gasPricesRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const DIST = path.join(__dirname, '..', '..', 'dist');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomUUID();
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage: storage });

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    // Construct the local URL path
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      imageUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

// Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/gas-prices', gasPricesRoute);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// ── Serve built React frontend (production only) ──────────────────────────────
import { existsSync } from 'fs';
if (existsSync(DIST)) {
  app.use(express.static(DIST));
  // SPA catch-all — Express 5 requires regex, not bare '*'
  app.get(/(.*)/, (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(DIST, 'index.html'));
    }
  });
  console.log('Serving React frontend from:', DIST);
}

// ── Auto-init database on startup (no shell access needed) ───────────────────
async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('[db] No DATABASE_URL set — skipping auto-init.');
    return;
  }
  try {
    const { default: pg } = await import('pg');
    const { readFileSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const __file = fileURLToPath(import.meta.url);
    const __dir  = path.dirname(__file);
    const sql    = readFileSync(path.join(__dir, 'db', 'init.sql'), 'utf8');
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await client.connect();
    await client.query(sql);
    await client.end();
    console.log('[db] Database initialized successfully.');
  } catch (err) {
    console.error('[db] Auto-init failed (non-fatal):', err.message);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initDatabase();
});

