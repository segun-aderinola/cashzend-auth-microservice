import express from "express";
const router = express.Router();
import { blochq_webhook } from "../../controllers/webhookController";

// Wallet/Account Routes

router.post("/blochq", blochq_webhook);

export default router;
