import express from 'express';
import { addVehicle, getVehicles, setupVehicle, getVehicleById, deleteVehicle, getMaintenanceLogs, addMaintenanceLog, updateOdometer } from '../controllers/vehicleController.js';

const router = express.Router();

router.post('/', addVehicle);
router.get('/', getVehicles);
router.get('/:id', getVehicleById);
router.put('/:id/setup', setupVehicle);
router.delete('/:id', deleteVehicle);
router.get('/:id/logs', getMaintenanceLogs);
router.post('/:id/logs', addMaintenanceLog);
router.patch('/:id/odometer', updateOdometer);

export default router;

