import { Request } from "express";
import jwt from "jsonwebtoken";

const JTWSign = `${process.env.JWT_SIGN}`;

export const decodeToken = (token: string) => {
  try {
    const decodedToken: any = jwt.verify(token, JTWSign);
    return decodedToken.id;
  } catch (err) {
    // Handle error here (e.g., throw an error or return null)
    return null;
  }
};

export const getToken = (req: Request) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const [bearer, token] = authHeader.split(" ");

  if (bearer !== "Bearer" || !token) {
    return null;
  }

  return decodeToken(token);
};
