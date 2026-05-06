import { pool } from './src/config/db.js';

async function updateDb() {
  try {
    await pool.query(`
      ALTER TABLE vehicles
      ADD COLUMN IF NOT EXISTS last_wash_odo INTEGER,
      ADD COLUMN IF NOT EXISTS last_wash_date DATE,
      ADD COLUMN IF NOT EXISTS last_inspect_odo INTEGER,
      ADD COLUMN IF NOT EXISTS last_inspect_date DATE;
    `);
    console.log('vehicles table updated');

    await pool.query(`
      ALTER TABLE components 
      DROP CONSTRAINT IF EXISTS check_threshold_positive;
    `);
    
    await pool.query(`
      ALTER TABLE components 
      ADD CONSTRAINT check_threshold_positive CHECK (replacement_threshold IS NULL OR replacement_threshold > 0);
    `);
    console.log('components table updated');

    await pool.query(`
      ALTER TABLE maintenance_logs
      ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);
    `);
    console.log('maintenance_logs table updated with image_url');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

updateDb();
