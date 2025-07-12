import express from "express";
const router = express.Router();
import { tokenVerify } from "../../middlewares/tokenVerify";
import {
  get_all_users,
  get_user_profile,
  get_user,
  update_user_profile,
  delete_user,
} from "../../controllers/userController";
import { userPermissionMiddleware } from "../../middlewares/permissons";

// Users Individual Routes
router.get("/", get_all_users);

router.get("/profile", tokenVerify, get_user_profile);

router.get("/:id", tokenVerify, get_user);

router.put("/:id", tokenVerify, userPermissionMiddleware, update_user_profile);

router.delete("/:id", tokenVerify, userPermissionMiddleware, delete_user);

export default router;
