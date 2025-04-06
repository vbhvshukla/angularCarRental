import express from 'express';
import { 
    getOwnerPredictions, 
    getAdminPredictions, 
    getCarSpecificPredictions, 
    getCategoryPredictions 
} from '../controllers/predictiveAnalytics.controller.js';

const router = express.Router();

// Owner routes
router.post('/owner',  getOwnerPredictions);
router.post('/owner/car', getCarSpecificPredictions);

// Admin routes
router.post('/admin', getAdminPredictions);
router.post('/admin/category', getCategoryPredictions);

export default router; 