import dotenv from "dotenv";
dotenv.config();

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { decodeToken } from "../functions/token";


const maxAge = 3 * 24 * 60 * 60;
/* global process */
const JTWSign = `${process.env.JWT_SIGN}`;

export const tokenVerify = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.cookies.authorization) {
    const token = req.cookies.authorization;

    
    
    jwt.verify(token, JTWSign, (err: any, decodeToken: any) => {
      console.log(decodeToken);
       
      if (err) {
        res
          .status(400)
          .send({ success: false, message: "Invalid Token Gotten" });
      } else {
        next();
      }
    });
  } else {
    res
      .status(400)
      .send({ success: false, message: "Unauthorized access detected!!!" });
  }
};



export const createToken = (id: string) => {
  return jwt.sign({ id }, JTWSign, {
    expiresIn: maxAge,
  });
};

