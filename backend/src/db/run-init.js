import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

// First connect to default postgres db to create our digital_garage db if it doesn't exist
const createDb = async () => {
  // Parse original connection URL
  const dbUrl = new URL(process.env.DATABASE_URL);
  const targetDb = dbUrl.pathname.slice(1);
  
  // Connect to default 'postgres' database
  dbUrl.pathname = '/postgres';
  
  const client = new Client({ connectionString: dbUrl.toString() });
  
  try {
    await client.connect();
    console.log(`Connected to default postgres database.`);
    
    // Check if database exists
    const res = await client.query(`SELECT datname FROM pg_database WHERE datname = '${targetDb}'`);
    
    if (res.rowCount === 0) {
      console.log(`Database '${targetDb}' does not exist. Creating...`);
      await client.query(`CREATE DATABASE ${targetDb}`);
      console.log(`Database '${targetDb}' created successfully.`);
    } else {
      console.log(`Database '${targetDb}' already exists.`);
    }
  } catch (err) {
    console.error('Error creating database:', err.message);
    console.log('\nPlease make sure your DATABASE_URL in .env has the correct username and password.');
    process.exit(1);
  } finally {
    await client.end();
  }
};

const runInitSql = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    console.log(`Connected to target database.`);
    
    const sqlPath = path.join(__dirname, 'init.sql');
    const sqlQuery = fs.readFileSync(sqlPath, { encoding: 'utf8' });
    
    console.log('Running init.sql...');
    await client.query(sqlQuery);
    console.log('Database initialization completed successfully!');
  } catch (err) {
    console.error('Error executing init.sql:', err.message);
  } finally {
    await client.end();
  }
};

const main = async () => {
  console.log('Starting database setup...');
  await createDb();
  await runInitSql();
  console.log('Setup finished.');
};

main();
