import { Router } from "express";
import { calculateEstimate, checkDateAvailability, getBidById, getBidsByCar, getBidsByUser, submitBid, updateBidStatus, getBidsForOwner } from "../controllers/bid.controller.js";
import { bidValidationRules, validateBidId, validateUpdateStatus, validateCarId, validateUserId, validateOwnerId } from "../services/bidValidator.service.js";

const router = Router();

router.post('/submit', bidValidationRules, submitBid);
router.get('/getbid/:bidId', validateBidId, getBidById);
router.put('/updatestatus/:bidId', validateUpdateStatus, updateBidStatus);
router.get('/carbids/:carId', validateCarId, getBidsByCar);
router.get('/userbids/:userId', validateUserId, getBidsByUser);
router.get('/checkavailability', checkDateAvailability);
router.post('/calculateestimate', calculateEstimate);
router.get('/ownerbids/:ownerId', validateOwnerId, getBidsForOwner);

export default router;