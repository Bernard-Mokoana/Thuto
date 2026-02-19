import { user } from "../model/user.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { sendEmail } from "./AuthController.js";

dotenv.config({
  path: "./.env",
});
export const register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  const imageUrl = req.file ? req.file.location : null;

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
      profileImage: imageUrl,
      role,
    });

    try {
      const mockReq = {
        user: newUser,
        ip: req.ip,
        headers: req.headers,
      };
      await sendEmail(mockReq, null);
    } catch (emailError) {
      console.error(
        "Failed to send verification email, rolling back user creation:",
        emailError
      );
      await user.findByIdAndDelete(newUser._id);
      return res.status(500).json({
        message: "Failed to send verification email. User registration failed.",
      });
    }

    return res
      .status(201)
      .json({ message: "User created successfully", data: newUser });
  } catch (error) {
    console.error("Failed to create a user:", error);
    return res.status(500).json({ message: "Failed to create a user" });
  }
};
export const getUserProfileById = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;

    if (!userId) return res.status(404).json({ message: "User not found" });

    const User = await user.findById(userId).select("-password");
    return res
      .status(200)
      .json({ message: "User fetched successfully", user: User });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetched the user", error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;
    const User = await user.findById(userId);

    if (!User) return res.status(404).json({ message: "user not found" });

    if (req.file) {
      User.profileImage = req.file.location;
    }

    User.firstName = req.body.firstName || User.firstName;
    User.lastName = req.body.lastName || User.lastName;
    User.email = req.body.email || User.email;
    if (req.body.password) {
      User.password = await bcrypt.hash(req.body.password, 10);
    }

    const updated = await User.save();

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
