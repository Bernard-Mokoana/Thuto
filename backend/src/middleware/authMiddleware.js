import { user } from "../model/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const jwtSecret = process.env.ACCESS_TOKEN_SECRET;

export const verifyJwt = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, tokenFromHeader] = header.split(" ");
  const tokenFromCookie = req.cookies?.accessToken;

  const token = scheme === "Bearer" ? tokenFromHeader : tokenFromCookie;

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (error) {
    const msg =
      error.name === "JsonWebTokenError" ? "Invalid token" : error.message;
    return res.status(401).json({ message: msg });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export const tutorOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });

  if (req.user.role !== "Tutor")
    return res
      .status(403)
      .json({ message: "Tutor access required", yourRole: req.user.role });
  next();
};

export const studentOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });

  if (req.user.role !== "Student")
    return res.status(403).json({ message: "Student access required" });

  next();
};

export const tutorOrAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });

  if (req.user.role !== "Tutor" && req.user.role !== "Admin")
    return res.status(403).json({
      message: "Tutor or Admin access required",
      yourRole: req.user.role,
    });
  next();
};
