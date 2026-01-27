import { user } from "../model/user.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { sendEmailVerification } from "../utils/email.util.js";
import {
  generateEmailVerificationToken,
  createJwtId,
} from "../utils/tokenUtils.js";

dotenv.config({
  path: "./.env",
});
export const register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    if (!firstName || !lastName || !email || !password || !role)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await user.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await user.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });

    const userId = newUser._id;
    const jwtId = createJwtId();
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];

    try {
      const verificationToken = generateEmailVerificationToken(
        userId,
        jwtId,
        ip,
        userAgent
      );
      await sendEmailVerification(email, verificationToken);
    } catch (error) {
      console.error("Error sending email verification:", error);
    }

    return res
      .status(201)
      .json({ message: "User created successfully", data: newUser });
  } catch (error) {}
  return res.status(500).json({ message: "Failed to create a user" });
};
export const getUserProfileById = async (req, res) => {
  try {
    const userId = req.user._id || req.params._id;

    if (!userId) return res.status(404).json({ message: "User not found" });

    const User = await user.findById(userId).select("-password");
    return res.status(200).json({ user: User });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetched the user", error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const User = await user.findById(req.user._id);

    if (!User) return res.status(404).json({ message: "user not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updated = await user.save();

    return res
      .status(200)
      .json({ message: "user updated successfully", updated });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update the user", error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = user.find().select("-password");
    return res.status(200).json({ message: "Users fetch successfully", users });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};
