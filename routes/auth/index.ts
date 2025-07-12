import express from "express";
const router = express.Router();
import {
  auth_signup1,
  auth_login,
  get_otp,
  otp_verify,
  tier_1_auth,
  tier_2_auth,
  tier_3_auth,
  auth_password_reset,
  auth_set_password,
  // auth_validate_user,
  reset_transaction_pin,
  set_transaction_pin,
  validate_transaction_pin,
  login_with_pin,
  login_pin_reset,
  set_login_pin,
} from "../../controllers/authController";
import { tokenVerify } from "../../middlewares/tokenVerify";
import {
  authPinValidate,
  authValidate,
  transactionPinValidate,
} from "../../middlewares/customValidate";
import {
  validateUserLogin,
  validateUserSignUp1,
  validateTier1Auth,
  validateTier2Auth,
} from "../../middlewares/validator";

router.post("/signupScreen1", validateUserSignUp1, auth_signup1);
// router.post("/signupScreen2", validateUserSignUp, auth_signup2);
// router.post("/signupScreen3", validateUserSignUp, auth_signup3);

router.post("/login", auth_login);

router.post("/get-otp", tokenVerify, get_otp);

router.post("/otp-verify", tokenVerify, otp_verify);

router.post("/login-with-pin", authPinValidate, login_with_pin);

router.post("/reset-login-pin", login_pin_reset);

router.post("/set-login-pin", set_login_pin);

router.post(
  "/validate-transaction-pin",
  tokenVerify,
  transactionPinValidate,
  validate_transaction_pin
);

router.post("/reset-transaction-pin", reset_transaction_pin);

router.post("/set-transaction-pin", set_transaction_pin);

router.post("/tier-1-auth", tokenVerify, validateTier1Auth, tier_1_auth);

router.post("/tier-2-auth", tokenVerify, validateTier2Auth, tier_2_auth);

router.post("/tier-3-auth", tokenVerify, tier_3_auth);

router.post("/reset-password", auth_password_reset);

router.post("/set-password", auth_set_password);

// Validate User
// router.get("/validate/:id", auth_validate_user);

export default router;
