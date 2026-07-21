import { user } from "../model/user.ts";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const jwtSecret = process.env.ACCESS_TOKEN_SECRET;

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
    const decoded = jwt.verify(token, jwtSecret) as any;
    (req as any).user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
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
  if ((req as any).user?.role !== "Admin") {
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
  if (!(req as any).user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  if ((req as any).user.role !== "Tutor") {
    res
      .status(403)
      .json({
        message: "Tutor access required",
        yourRole: (req as any).user.role,
      });
    return;
  }
  next();
};

export const studentOnly = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!(req as any).user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  if ((req as any).user.role !== "Student") {
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
  if (!(req as any).user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  if (
    (req as any).user.role !== "Tutor" &&
    (req as any).user.role !== "Admin"
  ) {
    res.status(403).json({
      message: "Tutor or Admin access required",
      yourRole: (req as any).user.role,
    });
    return;
  }
  next();
};
