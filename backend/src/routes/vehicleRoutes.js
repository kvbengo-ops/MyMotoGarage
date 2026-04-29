import express from 'express';
import { addVehicle, getVehicles, setupVehicle, getVehicleById } from '../controllers/vehicleController.js';

const router = express.Router();

router.post('/', addVehicle);
router.get('/', getVehicles);
router.get('/:id', getVehicleById);
router.put('/:id/setup', setupVehicle);

export default router;
