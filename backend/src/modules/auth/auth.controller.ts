import { Response } from "express";
import type { Request } from "express";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";

import { user, type User as UserDoc } from "../model/user.ts";
import RefreshToken from "../model/refreshToken.ts";
import EmailVerificationToken from "../model/emailVerificationToken.ts";
import ResetPasswordToken from "../model/resetPasswordToken.ts";
import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  createJwtId,
  persistRefreshToken,
  setRefreshCookie,
  rotateRefreshToken,
  generateEmailVerificationToken,
  generateForgotPasswordToken,
} from "../utils/tokenUtils.ts";
import {
  sendEmailVerification,
  sendForgotPasswordEmail,
} from "../utils/email.util.ts";

import type { RefreshTokenPayload } from "../types/types.ts";

const jwtSecret = process.env.ACCESS_TOKEN_SECRET;
if (!jwtSecret) {
  throw new Error(
    "ACCESS_TOKEN_SECRET is not defined in environment variables",
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const User = await user.findOne({ email });
    if (!User) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!User.isVerified) {
      return res.status(403).json({ message: "Please verify your email." });
    }

    const isMatch = await bcrypt.compare(password, User.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const accessToken = signAccessToken(User);
    const jwtId = createJwtId();
    const refreshToken = signRefreshToken(User, jwtId);

    await persistRefreshToken({
      user: User,
      refreshToken,
      jwtId,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      message: "User login successfully",
      accessToken,
      user: {
        _id: User._id,
        firstName: User.firstName,
        lastName: User.lastName,
        email: User.email,
        role: User.role,
        isVerified: User.isVerified,
        profileImage: User.profileImage,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: errorMessage(error) });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token: string | undefined = req.cookies?.refreshToken;

    if (token) {
      const tokenHash = hashToken(token);
      const doc = await RefreshToken.findOne({ tokenHash });
      if (doc && !doc.revokedAt) {
        doc.revokedAt = new Date();
        await doc.save();
      }
    }

    return res
      .status(200)
      .clearCookie("refreshToken", { path: "/api/v1/auth/refresh" })
      .json({ message: "User logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: errorMessage(error) });
  }
};

export const sendEmail = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const email = req.user?.email;

  if (!userId || !email) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const jwtId = createJwtId();
  const ip = req.ip;
  const userAgent = req.headers["user-agent"];

  try {
    const User = await user.findById(userId);
    if (!User) {
      return res.status(404).json({ message: "User not found" });
    }

    const verificationToken = await generateEmailVerificationToken(
      User,
      jwtId,
      ip,
      userAgent,
    );
    await sendEmailVerification(email, verificationToken);

    return res.status(200).json({ message: "Verification email sent." });
  } catch (error) {
    console.error("Error sending email verification:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: errorMessage(error) });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };
    const existingUser = await user.findOne({ email });

    if (!existingUser || !existingUser._id) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = existingUser._id;
    const userEmail = existingUser.email;
    const jwtId = createJwtId();
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];

    const verificationToken = await generateForgotPasswordToken(
      existingUser,
      jwtId,
      ip,
      userAgent,
    );
    await sendForgotPasswordEmail(userEmail, verificationToken);

    return res.status(200).json({ message: "Forgot password email sent." });
  } catch (error) {
    console.error("Error sending forgot password email:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: errorMessage(error) });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    const { password } = req.body as { password?: string };

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Token is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const tokenHash = hashToken(token);
    const verificationToken = await ResetPasswordToken.findOne({ tokenHash });

    if (!verificationToken) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (verificationToken.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token has expired" });
    }

    const User = await user.findById(verificationToken.user);
    if (!User) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    User.password = await bcrypt.hash(password, salt);
    await User.save();

    await ResetPasswordToken.findByIdAndDelete(verificationToken._id);

    return res
      .status(200)
      .json({ message: "Password reset successful. Please log in." });
  } catch (error) {
    return res.status(500).json({
      message: "Error resetting the password",
      error: errorMessage(error),
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const token: string | undefined = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    let decoded: RefreshTokenPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as RefreshTokenPayload;
    } catch {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const tokenHash = hashToken(token);
    const doc = await RefreshToken.findOne({
      tokenHash,
      jwtId: decoded.jwtId,
    }).populate<{ user: UserDoc }>("user");

    if (!doc) {
      return res.status(401).json({ message: "Refresh token not recognized" });
    }

    if (doc.revokedAt) {
      return res.status(401).json({ message: "Refresh token revoked" });
    }

    if (doc.expiresAt < new Date()) {
      return res.status(401).json({ message: "Refresh token expired" });
    }

    const newAccessToken = await rotateRefreshToken(doc, doc.user, req, res);
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: errorMessage(error) });
  }
};

export const handleEmailVerification = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Token is required" });
    }

    const tokenHash = hashToken(token);
    const verificationToken = await EmailVerificationToken.findOne({
      tokenHash,
    });

    if (!verificationToken) {
      return res.status(404).json({ message: "Invalid token" });
    }

    if (verificationToken.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token has expired" });
    }

    const User = await user.findById(verificationToken.user);
    if (!User) {
      return res.status(404).json({ message: "User not found" });
    }

    User.isVerified = true;
    await User.save();

    await EmailVerificationToken.findByIdAndDelete(verificationToken._id);

    return res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    console.error("Error handling email verification:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: errorMessage(error) });
  }
};
