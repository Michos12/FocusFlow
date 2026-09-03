import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../interface/authRequest.js";
import { JwtPayload } from "../interface/jwtInterface.js";
import { JWT_SECRET } from "../config/env.js";

export async function authenticate (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // The token lives in an httpOnly cookie, so page scripts cannot read it
    // and an XSS cannot exfiltrate the session.
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Pinning the algorithm stops a forged header from talking the library into
    // accepting a different one.
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as JwtPayload;

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth error:", error);

    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
