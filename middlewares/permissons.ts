import { NextFunction, Request, Response } from "express";
import { getToken } from "../functions/token";
import User from "../models/userModel";

export const userPermissionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ID = getToken(req);
  const user = await User.findById(ID);
  const userIdFromRoute = req.params.id;

  console.log(userIdFromRoute);
  console.log(user?._id);

  if (user?._id.toString() === userIdFromRoute || user?.userRole === "admin") {
    next();
  } else {
    res.status(401).send({ message: "Unauthorized access" });
  }
};
