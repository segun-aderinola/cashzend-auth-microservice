import express from "express";
const router = express.Router();
import { subscribe_waitlist } from "../../controllers/subscribeController";

// Users Individual Routes
router.post("/waitlist", subscribe_waitlist);

export default router;
