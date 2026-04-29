import express from 'express';
import { addVehicle, getVehicles, setupVehicle, getVehicleById, deleteVehicle } from '../controllers/vehicleController.js';

const router = express.Router();

router.post('/', addVehicle);
router.get('/', getVehicles);
router.get('/:id', getVehicleById);
router.put('/:id/setup', setupVehicle);
router.delete('/:id', deleteVehicle);

export default router;
