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
      engineDisplacement, weight, fuelType, fuelCapacity, fuelConsumption,
      bikeCondition, ridingHabit,
      components // array of components
    } = req.body;

    // First update the vehicle's core specs and mark it active
    const vehicleQuery = `
      UPDATE vehicles 
      SET 
        engine_displacement = $1,
        weight = $2,
        fuel_type = $3,
        fuel_capacity = $4,
        fuel_consumption = $5,
        bike_condition = $6,
        riding_habit = $7,
        status = 'active'
      WHERE id = $8
      RETURNING *;
    `;
    
    const vehicleValues = [
      engineDisplacement || null,
      weight || null,
      fuelType || null,
      fuelCapacity || null,
      fuelConsumption || null,
      bikeCondition || null,
      ridingHabit || null,
      id
    ];
    
    const vehicleResult = await pool.query(vehicleQuery, vehicleValues);

    if (vehicleResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    const initialOdometer = vehicleResult.rows[0].odometer || 0;

    // Now insert components if they exist
    if (components && Array.isArray(components) && components.length > 0) {
      // Clear any existing components for this vehicle to prevent duplicates if they run setup again
      await pool.query('DELETE FROM components WHERE vehicle_id = $1', [id]);

      // Prepare batch insert
      for (const comp of components) {
        let baselineOdometer = initialOdometer;

        if (comp.wearState === 'Currently Used' && comp.estimatedKmUsed) {
          baselineOdometer = initialOdometer - comp.estimatedKmUsed;
          if (baselineOdometer < 0) baselineOdometer = 0;
        }

        const compQuery = `
          INSERT INTO components (vehicle_id, category, component_type, brand, model, baseline_install_odometer, replacement_threshold, last_service_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        
        const serviceDate = comp.lastServiceDate ? new Date(comp.lastServiceDate) : null;

        await pool.query(compQuery, [
          id,
          comp.category,
          comp.componentType,
          comp.brand,
          comp.model,
          baselineOdometer,
          comp.replacementThreshold ? parseInt(comp.replacementThreshold) : null,
          serviceDate
        ]);
      }
    }

    res.status(200).json({
      success: true,
      data: vehicleResult.rows[0]
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

    const vehicle = result.rows[0];

    const componentsResult = await pool.query('SELECT * FROM components WHERE vehicle_id = $1 ORDER BY created_at ASC', [id]);
    vehicle.components = componentsResult.rows;

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Error fetching vehicle by id:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    res.status(200).json({
      success: true,
      data: { id: result.rows[0].id }
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
