import { user } from "../model/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const accessToken = process.env.ACCESS_TOKEN_SECRET;

export const verifyJwt = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Authorization required" });

    const decoded = jwt.verify(token, accessToken);

    const foundUser = await user
      .findById(decoded.id)
      .select("-password -refreshToken")
      .lean();

    if (!foundUser) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = foundUser;
    next();
  } catch (error) {
    console.error("JWT verification error: ", error.message);

    return res
      .status(401)
      .json({ message: "Token Invalid or expired", error: error.message });
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
