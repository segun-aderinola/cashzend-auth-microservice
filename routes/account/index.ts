import express from "express";
const router = express.Router();
import { tokenVerify } from "../../middlewares/tokenVerify";
import {
  get_my_wallet,
  get_wallet,
  central_account_funding,
} from "../../controllers/accountController";
import { validateCentralAmountFunding } from "../../middlewares/validator";

// Wallet/Account Routes

router.get("/", tokenVerify, get_my_wallet);

router.get("/:id", tokenVerify, get_wallet);

router.post(
  "/central-account-funding",
  tokenVerify,
  validateCentralAmountFunding,
  central_account_funding
);

export default router;
