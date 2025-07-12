import express from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import accountRoutes from "./account";
import bankRoutes from "./banks";
import transactionRoutes from "./transactions";
import subscribeRoutes from "./subscribe";
import uploadsRoutes from "./uploads";
import webhooksRoutes from "./webhooks";

const router = express.Router();

// Routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/account", accountRoutes);
router.use("/banks", bankRoutes);
router.use("/transactions", transactionRoutes);
router.use("/subscribe", subscribeRoutes);
router.use("/uploads", uploadsRoutes);
router.use("/webhooks", webhooksRoutes);

export default router;
