import express from "express";
const router = express.Router();
import { tokenVerify } from "../../middlewares/tokenVerify";
import {
  get_bank_list,
  get_bank_account,
} from "../../controllers/bankController";
import { validateGetAccountDetails } from "../../middlewares/validator";

// Wallet/Account Routes

router.get("/", tokenVerify, get_bank_list);

router.get(
  "/account",
  tokenVerify,
  validateGetAccountDetails,
  get_bank_account
);

export default router;
