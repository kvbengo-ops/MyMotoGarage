import { pool } from '../config/db.js';
import crypto from 'crypto';

export const addVehicle = async (req, res) => {
  try {
    const { userId, make, model, year, category, odometer, nickname, imageUrl,
            engineDisplacement, weight, fuelType, fuelCapacity, fuelConsumption } = req.body;

    if (!userId || !make || !model || !year) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const id = crypto.randomUUID();
    const status = 'needsSetup'; // Default status for new vehicles

    // Insert into DB — includes optional factory specs from bikeSpecs auto-fill
    const query = `
      INSERT INTO vehicles (id, user_id, make, model, year, category, odometer, nickname, image_url, status,
                            engine_displacement, weight, fuel_type, fuel_capacity, fuel_consumption)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;
    
    const values = [
      id, userId, make, model, year, category, odometer || 0, nickname || null, imageUrl || null, status,
      engineDisplacement || null, weight || null, fuelType || null, fuelCapacity || null, fuelConsumption || null
    ];
    
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
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
    
    const vehicleResult = await client.query(vehicleQuery, vehicleValues);

    if (vehicleResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    const initialOdometer = vehicleResult.rows[0].odometer || 0;

    // Now insert components if they exist
    if (components && Array.isArray(components) && components.length > 0) {
      // Clear any existing components for this vehicle to prevent duplicates if they run setup again
      await client.query('DELETE FROM components WHERE vehicle_id = $1', [id]);

      // Prepare batch insert
      for (const comp of components) {
        let baselineOdometer = initialOdometer;

        // For both Brand New (factory-original parts) and Currently Used:
        if (comp.estimatedKmUsed && parseInt(comp.estimatedKmUsed) > 0) {
          if (parseInt(comp.estimatedKmUsed) > initialOdometer) {
             await client.query('ROLLBACK');
             return res.status(400).json({ success: false, error: `Estimated usage for ${comp.componentType} cannot exceed current odometer.` });
          }
          baselineOdometer = initialOdometer - parseInt(comp.estimatedKmUsed);
          if (baselineOdometer < 0) baselineOdometer = 0;
        }

        const compQuery = `
          INSERT INTO components (vehicle_id, category, component_type, brand, model, baseline_install_odometer, replacement_threshold, last_service_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        
        const serviceDate = comp.lastServiceDate ? new Date(comp.lastServiceDate) : null;

        await client.query(compQuery, [
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

    await client.query('COMMIT');
    res.status(200).json({
      success: true,
      data: vehicleResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error setting up vehicle:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
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

export const getMaintenanceLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM maintenance_logs WHERE vehicle_id = $1 ORDER BY date DESC, created_at DESC',
      [id]
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching maintenance logs:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const addMaintenanceLog = async (req, res) => {
  // DEV-1: wrap entire operation in a transaction so partial failures
  // (e.g. component update error after log insert) are fully rolled back.
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { logType, title, description, odometerAtLog, cost, date, componentIds, updatedComponents, newComponents, imageUrl } = req.body;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!title) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    // QA-5: enforce DB VARCHAR(255) limit on the server side
    if (title.length > 255) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Title must be 255 characters or fewer' });
    }
    // QA-6: reject negative cost values
    if (cost !== undefined && cost !== null && Number(cost) < 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Cost cannot be negative' });
    }
    // ─────────────────────────────────────────────────────────────────────────

    const logDate = date || new Date();

    if (odometerAtLog !== undefined && odometerAtLog !== null) {
      // Validate monotonic odometer against strictly prior and strictly future dates.
      // Same-day logs are not ordered against each other (intentional: different service
      // stops on the same calendar day may be entered in any order).
      const prevLog = await client.query(
        'SELECT MAX(odometer_at_log) as max_odo FROM maintenance_logs WHERE vehicle_id = $1 AND date < $2',
        [id, logDate]
      );
      if (prevLog.rows[0].max_odo !== null && odometerAtLog < prevLog.rows[0].max_odo) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'Odometer cannot be less than a log from a previous date.' });
      }

      const nextLog = await client.query(
        'SELECT MIN(odometer_at_log) as min_odo FROM maintenance_logs WHERE vehicle_id = $1 AND date > $2',
        [id, logDate]
      );
      if (nextLog.rows[0].min_odo !== null && odometerAtLog > nextLog.rows[0].min_odo) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'Odometer cannot be greater than a log from a future date.' });
      }
    }

    const result = await client.query(
      `INSERT INTO maintenance_logs (vehicle_id, log_type, title, description, odometer_at_log, cost, date, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, logType || 'maintenance', title, description || null, odometerAtLog ?? null, cost ?? null, logDate, imageUrl || null]
    );

    if (odometerAtLog !== undefined && odometerAtLog !== null) {
      await client.query(
        'UPDATE vehicles SET odometer = $1 WHERE id = $2 AND odometer < $1',
        [odometerAtLog, id]
      );
    }

    // Legacy support for componentIds
    let componentsToUpdate = updatedComponents || [];
    if (componentIds && Array.isArray(componentIds) && componentIds.length > 0 && componentsToUpdate.length === 0) {
      componentsToUpdate = componentIds.map(cid => ({ id: cid, brand: null, model: null }));
    }

    // Reset components lifeline AND update brand/model/threshold
    if (componentsToUpdate && Array.isArray(componentsToUpdate) && componentsToUpdate.length > 0) {
      let resetOdo = odometerAtLog;
      if (resetOdo === undefined || resetOdo === null) {
        // GA-03: Always fetch live vehicle odometer rather than trusting stale client state
        const vRes = await client.query('SELECT odometer FROM vehicles WHERE id = $1', [id]);
        resetOdo = vRes.rows[0]?.odometer || 0;
      }

      for (const comp of componentsToUpdate) {
        // GA-new: Build a dynamic SET so we only touch fields that were actually provided.
        // This lets Quick Reset optionally change the threshold when upgrading to a more
        // durable part — without breaking resets that don't supply a new threshold.
        const sets   = ['baseline_install_odometer = $1', 'last_service_date = $2'];
        const params = [resetOdo, logDate];
        let   pIdx   = 3;

        if (comp.brand !== undefined) { sets.push(`brand = $${pIdx++}`); params.push(comp.brand || null); }
        if (comp.model !== undefined) { sets.push(`model = $${pIdx++}`); params.push(comp.model || null); }

        // newThreshold: explicit null clears it (→ Permanent). undefined = leave unchanged.
        if (comp.newThreshold !== undefined) {
          const t = comp.newThreshold === null || comp.newThreshold === ''
            ? null
            : Number(comp.newThreshold);
          if (t !== null && (isNaN(t) || t <= 0)) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, error: `Invalid threshold for component ${comp.id}` });
          }
          sets.push(`replacement_threshold = $${pIdx++}`);
          params.push(t);
        }

        params.push(comp.id, id);
        await client.query(
          `UPDATE components SET ${sets.join(', ')} WHERE id = $${pIdx} AND vehicle_id = $${pIdx + 1}`,
          params
        );

        // GA-08: Write audit trail row
        await client.query(
          `INSERT INTO component_service_history
             (component_id, log_id, vehicle_id, odometer_at_service, service_date, brand_at_service, model_at_service)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [comp.id, result.rows[0].id, id, resetOdo, logDate, comp.brand || null, comp.model || null]
        );
      }
    }

    // Add new modifications/components — DEV-3: store NULL for blank brand/model
    if (newComponents && Array.isArray(newComponents) && newComponents.length > 0) {
      let resetOdo = odometerAtLog;
      if (resetOdo === undefined || resetOdo === null) {
        const vRes = await client.query('SELECT odometer FROM vehicles WHERE id = $1', [id]);
        resetOdo = vRes.rows[0]?.odometer || 0;
      }

      for (const comp of newComponents) {
        if (!comp.componentType) continue;
        const newCompRes = await client.query(
          `INSERT INTO components (vehicle_id, category, component_type, brand, model, baseline_install_odometer, last_service_date, replacement_threshold)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
          [
            id,
            comp.category || 'Accessory',
            comp.componentType,
            comp.brand || null,
            comp.model || null,
            resetOdo,
            logDate,
            comp.threshold ? Number(comp.threshold) : null,
          ]
        );

        // GA-08: Write initial install record into service history
        const newCompId = newCompRes.rows[0].id;
        await client.query(
          `INSERT INTO component_service_history
             (component_id, log_id, vehicle_id, odometer_at_service, service_date, brand_at_service, model_at_service)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [newCompId, result.rows[0].id, id, resetOdo, logDate, comp.brand || null, comp.model || null]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding maintenance log:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const updateOdometer = async (req, res) => {
  try {
    const { id } = req.params;
    const { odometer } = req.body;

    if (odometer === undefined || odometer === null || isNaN(Number(odometer))) {
      return res.status(400).json({ success: false, error: 'Valid odometer value is required' });
    }

    const newOdo = parseInt(odometer);

    // Replace the SELECT then UPDATE with a single atomic UPDATE
    const result = await pool.query(
      'UPDATE vehicles SET odometer = $1 WHERE id = $2 AND odometer < $1 RETURNING id, odometer',
      [newOdo, id]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ success: false, error: 'New odometer must be greater than current value' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating odometer:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const updateWashInspectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, odometer, date } = req.body;

    if (!type || odometer === undefined || !date) {
      return res.status(400).json({ success: false, error: 'Type, odometer, and date are required' });
    }

    let query = '';
    if (type === 'wash') {
      query = 'UPDATE vehicles SET last_wash_odo = $1, last_wash_date = $2 WHERE id = $3 RETURNING *';
    } else if (type === 'inspect') {
      query = 'UPDATE vehicles SET last_inspect_odo = $1, last_inspect_date = $2 WHERE id = $3 RETURNING *';
    } else {
      return res.status(400).json({ success: false, error: 'Invalid type. Must be wash or inspect.' });
    }

    const result = await pool.query(query, [odometer, date, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(`Error updating ${req.body?.type} status:`, error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// ── GA-01: Edit a component's threshold, brand, or model ────────────────────
export const patchComponent = async (req, res) => {
  const { id, componentId } = req.params;
  const { brand, model, replacement_threshold, component_type } = req.body;

  // Build a dynamic SET clause — only update fields that were sent
  const updates = [];
  const values  = [];
  let   idx     = 1;

  if (brand !== undefined)                { updates.push(`brand = $${idx++}`);                 values.push(brand || null); }
  if (model !== undefined)                { updates.push(`model = $${idx++}`);                 values.push(model || null); }
  if (component_type !== undefined)       { updates.push(`component_type = $${idx++}`);        values.push(component_type); }
  if (replacement_threshold !== undefined) {
    const t = replacement_threshold === '' || replacement_threshold === null
      ? null
      : Number(replacement_threshold);
    if (t !== null && (isNaN(t) || t < 0)) {
      return res.status(400).json({ success: false, error: 'replacement_threshold must be a positive number or empty.' });
    }
    updates.push(`replacement_threshold = $${idx++}`);
    values.push(t);
  }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, error: 'No updatable fields provided.' });
  }

  values.push(componentId, id); // $idx and $idx+1
  const q = `UPDATE components SET ${updates.join(', ')} WHERE id = $${idx} AND vehicle_id = $${idx + 1} RETURNING *`;

  try {
    const result = await pool.query(q, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Component not found.' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error patching component:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// ── GA-08: Get full service history for a single component ──────────────────
export const getComponentHistory = async (req, res) => {
  const { id, componentId } = req.params;
  try {
    const result = await pool.query(
      `SELECT csh.*, ml.title as log_title, ml.log_type
       FROM component_service_history csh
       LEFT JOIN maintenance_logs ml ON ml.id = csh.log_id
       WHERE csh.component_id = $1 AND csh.vehicle_id = $2
       ORDER BY csh.service_date DESC, csh.created_at DESC`,
      [componentId, id]
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching component history:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
