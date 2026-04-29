import { pool } from '../config/db.js';
import crypto from 'crypto';

export const addVehicle = async (req, res) => {
  try {
    const { userId, make, model, year, category, odometer, nickname, imageUrl } = req.body;

    if (!userId || !make || !model || !year) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const id = crypto.randomUUID();
    const status = 'needsSetup'; // Default status for new vehicles

    // Insert into DB
    const query = `
      INSERT INTO vehicles (id, user_id, make, model, year, category, odometer, nickname, image_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    
    const values = [id, userId, make, model, year, category, odometer || 0, nickname || null, imageUrl || null, status];
    
    const result = await pool.query(query, values);
    const newVehicle = result.rows[0];

    res.status(201).json({
      success: true,
      data: newVehicle
    });

  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getVehicles = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const result = await pool.query('SELECT * FROM vehicles WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    const vehicles = result.rows;

    res.status(200).json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const setupVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      lastOilChangeDate, oilInterval, chainInterval, tireAge, tireLifespan,
      engineDisplacement, weight, fuelType
    } = req.body;

    const query = `
      UPDATE vehicles 
      SET 
        last_oil_change_date = $1,
        oil_interval = $2,
        chain_cleaning_interval = $3,
        tire_age_months = $4,
        tire_lifespan_months = $5,
        engine_displacement = $6,
        weight = $7,
        fuel_type = $8,
        status = 'active'
      WHERE id = $9
      RETURNING *;
    `;
    
    // Parse lastOilChangeDate as proper date or null
    const oilDate = lastOilChangeDate ? new Date(lastOilChangeDate) : null;
    
    const values = [
      oilDate, 
      oilInterval || null, 
      chainInterval || null, 
      tireAge || null, 
      tireLifespan || null, 
      engineDisplacement || null,
      weight || null,
      fuelType || null,
      id
    ];
    
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error setting up vehicle:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching vehicle by id:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
