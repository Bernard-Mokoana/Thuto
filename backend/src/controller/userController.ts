import { Request, Response } from "express";
import { user } from "../model/user.ts";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { sendEmail } from "./AuthController.ts";

dotenv.config({
  path: "./.env",
});

export const register = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, password, role } = req.body;
  const imageUrl = req.file ? (req.file as any).location : null;

  try {
    if (!firstName || !lastName || !email || !password || !role) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const existingUser = await user.findOne({ email });

    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
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
      await sendEmail(mockReq as any, null as any);
    } catch (emailError) {
      console.error(
        "Failed to send verification email, rolling back user creation:",
        emailError,
      );
      await user.findByIdAndDelete(newUser._id);
      res.status(500).json({
        message: "Failed to send verification email. User registration failed.",
      });
      return;
    }

    res
      .status(201)
      .json({ message: "User created successfully", data: newUser });
  } catch (error) {
    console.error("Failed to create a user:", error);
    res.status(500).json({ message: "Failed to create a user" });
  }
};

export const getUserProfileById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user?.id || req.params.userId;

    if (!userId) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const User = await user.findById(userId).select("-password");
    res.status(200).json({ message: "User fetched successfully", user: User });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetched the user",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateUserProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user?.id || req.params.userId;
    const User = await user.findById(userId);

    if (!User) {
      res.status(404).json({ message: "user not found" });
      return;
    }

    if (req.file) {
      User.profileImage = (req.file as any).location;
    }

    User.firstName = req.body.firstName || User.firstName;
    User.lastName = req.body.lastName || User.lastName;
    User.email = req.body.email || User.email;
    if (req.body.password) {
      User.password = await bcrypt.hash(req.body.password, 10);
    }

    const updated = await User.save();

    res.status(200).json({ message: "user updated successfully", updated });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update the user",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = await user.find().select("-password");
    res.status(200).json({ message: "Users fetch successfully", users });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateUserRoleByAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["Student", "Tutor", "Admin"].includes(role)) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }

    const targetUser = await user.findById(id);
    if (!targetUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    targetUser.role = role;
    await targetUser.save();

    res.status(200).json({
      message: "User role updated successfully",
      user: await user.findById(id).select("-password"),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user role",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deleteUserByAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if ((req as any).user?.id === id) {
      res.status(400).json({ message: "You cannot delete yourself" });
      return;
    }

    const deletedUser = await user.findByIdAndDelete(id);

    if (!deletedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deleteOwnAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const deletedUser = await user.findByIdAndDelete(userId);

    if (!deletedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete account",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
