import express from "express";
const router = express.Router();
import { tokenVerify } from "../../middlewares/tokenVerify";
import { userPermissionMiddleware } from "../../middlewares/permissons";
import { delete_file, get_auth } from "../../controllers/uploadController";

// FIle upload Routes
router.get("/get-auth", get_auth);

router.delete(
  "/delete-file",
  tokenVerify,
  userPermissionMiddleware,
  delete_file
);

export default router;
