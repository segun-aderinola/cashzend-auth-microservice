import express from "express";
const router = express.Router();
import {
  create_transaction,
  get_a_user_transactions,
  get_all_transactions,
  get_logged_in_user_transactions,
  get_organization_transactions,
} from "../../controllers/transactionsController";
import { tokenVerify } from "../../middlewares/tokenVerify";
import { transactionValidator } from "../../middlewares/validator";


// Wallet/Account Routes

router.get("/", tokenVerify, get_all_transactions);

router.get("/user", tokenVerify, get_logged_in_user_transactions);

router.get("/admin", tokenVerify, get_organization_transactions);

router.get("/:filter_param", tokenVerify, get_a_user_transactions);

// router.get("/admin/:id", tokenVerify, get_a_user_transactions);

router.post("/", tokenVerify, transactionValidator, create_transaction);

export default router;
