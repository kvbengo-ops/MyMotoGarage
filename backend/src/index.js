import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import vehicleRoutes from './routes/vehicleRoutes.js';
import trafficRoutes from './routes/trafficRoutes.js';
import gasPricesRoute from './routes/gasPricesRoute.js';
import { pool } from './config/db.js';

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

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
});

// Handle multer errors (file size, type) with a clean JSON response
app.use((err, _req, res, _next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, error: 'File too large. Maximum size is 5 MB.' });
  }
  if (err && err.message === 'Only image files are allowed') {
    return res.status(415).json({ success: false, error: 'Only image files are allowed.' });
  }
  res.status(500).json({ success: false, error: 'Internal server error' });
});

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

// ── Run database migrations on every startup (local + production) ────────────
async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        make VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        category VARCHAR(100),
        odometer INTEGER DEFAULT 0,
        nickname VARCHAR(100),
        image_url VARCHAR(255),
        status VARCHAR(50) DEFAULT 'needsSetup',
        last_oil_change_date DATE,
        oil_interval INTEGER,
        chain_cleaning_interval INTEGER,
        tire_age_months INTEGER,
        tire_lifespan_months INTEGER,
        engine_displacement INTEGER,
        weight INTEGER,
        fuel_type VARCHAR(100),
        fuel_capacity NUMERIC,
        fuel_consumption NUMERIC,
        bike_condition VARCHAR(50),
        riding_habit VARCHAR(100),
        last_wash_odo INTEGER,
        last_wash_date DATE,
        last_inspect_odo INTEGER,
        last_inspect_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS components (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        component_type VARCHAR(100) NOT NULL,
        brand VARCHAR(100),
        model VARCHAR(100),
        baseline_install_odometer INTEGER NOT NULL,
        replacement_threshold INTEGER,
        last_service_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      INSERT INTO users (id, email, name)
      VALUES ('00000000-0000-0000-0000-000000000000', 'testrider@digitalgarage.com', 'Test Rider')
      ON CONFLICT (email) DO NOTHING
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS maintenance_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
        log_type VARCHAR(50) DEFAULT 'maintenance',
        title VARCHAR(255) NOT NULL,
        description TEXT,
        odometer_at_log INTEGER,
        cost NUMERIC,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        image_url VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // GA-08: Component service history — audit trail per part reset
    await client.query(`
      CREATE TABLE IF NOT EXISTS component_service_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        component_id UUID REFERENCES components(id) ON DELETE CASCADE,
        log_id UUID REFERENCES maintenance_logs(id) ON DELETE CASCADE,
        vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
        odometer_at_service INTEGER,
        service_date DATE,
        brand_at_service VARCHAR(100),
        model_at_service VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // GA-10: Migrate legacy 'Modification' → 'Accessory' (idempotent)
    await client.query(`UPDATE components SET category = 'Accessory' WHERE category = 'Modification'`);

    console.log('[db] Migrations applied successfully.');
  } catch (err) {
    console.error('[db] Migration failed (non-fatal):', err.message);
  } finally {
    client.release();
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await runMigrations();
});

