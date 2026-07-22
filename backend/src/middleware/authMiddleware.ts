import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import type { JwtUserPayload } from "../types/types.ts";

dotenv.config();

const jwtSecret = process.env.ACCESS_TOKEN_SECRET;
if (!jwtSecret) {
  throw new Error(
    "ACCESS_TOKEN_SECRET is not defined in environment variables",
  );
}

export const verifyJwt = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const header = req.headers.authorization || "";
  const [scheme, tokenFromHeader] = header.split(" ");
  const tokenFromCookie = req.cookies?.accessToken;

  const token = scheme === "Bearer" ? tokenFromHeader : tokenFromCookie;

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    const msg =
      error instanceof jwt.JsonWebTokenError
        ? "Invalid token"
        : (error as Error).message;
    res.status(401).json({ message: msg });
  }
};

export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user?.role !== "Admin") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
};

export const tutorOnly = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  if (req.user.role !== "Tutor") {
    res
      .status(403)
      .json({ message: "Tutor access required", yourRole: req.user.role });
    return;
  }
  next();
};

export const studentOnly = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  if (req.user.role !== "Student") {
    res.status(403).json({ message: "Student access required" });
    return;
  }
  next();
};

export const tutorOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  if (req.user.role !== "Tutor" && req.user.role !== "Admin") {
    res.status(403).json({
      message: "Tutor or Admin access required",
      yourRole: req.user.role,
    });
    return;
  }
  next();
};
