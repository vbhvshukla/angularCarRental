import { Router } from "express";
import { calculateEstimate, checkDateAvailability, getBidById, getBidsByCar, getBidsByUser, submitBid, updateBidStatus, getBidsForOwner } from "../controllers/bid.controller.js";

const router = Router();

router.post('/submit', submitBid);
router.get('/getbid/:bidId', getBidById);
router.put('/updatestatus/:bidId', updateBidStatus);
router.get('/carbids/:carId', getBidsByCar);
router.get('/userbids/:userId', getBidsByUser);
router.get('/checkavailability', checkDateAvailability);
router.post('/calculateestimate', calculateEstimate);
router.get('/ownerbids/:ownerId', getBidsForOwner);

export default router;