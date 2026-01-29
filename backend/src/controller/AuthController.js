import { user } from "../model/user.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  createJwtId,
  persistRefreshToken,
  setRefreshCookie,
  rotateRefreshToken,
  generateEmailVerificationToken,
} from "../utils/tokenUtils.js";
import RefreshToken from "../model/refreshToken.js";
import EmailVerificationToken from "../model/emailVerificationToken.js";
import {
  sendEmailVerification,
  sendForgotPasswordEmail,
} from "../utils/email.util.js";

const jwtSecret = process.env.ACCESS_TOKEN_SECRET;
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const User = await user.findOne({ email });
    if (!User) {
      return res.status(400).json({ message: "Invalid email or password" });
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
      refreshToken: refreshToken,
      jwtId: jwtId,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      message: "User login successfully ",
      accessToken,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const tokenHash = hashToken(token);
      const doc = await RefreshToken.findOne({ tokenHash });
      if (doc && !doc.revokedAt) {
        doc.revokedAt = new Date();
        await doc.save();
      }
    }

    res
      .status(200)
      .clearCookie("refreshToken", { path: "/api/v1/auth/refresh" })
      .json({ message: "User logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const sendEmail = async (req, res) => {
  const userId = req.user._id;
  const email = req.user.email;
  const jwtId = createJwtId();
  const ip = req.ip;
  const userAgent = req.headers["user-agent"];

  try {
    const verificationToken = await generateEmailVerificationToken(
      userId,
      jwtId,
      ip,
      userAgent
    );
    await sendEmailVerification(email, verificationToken);
    if (res) {
      return res.status(200).json({ message: "Verification email sent." });
    }
  } catch (error) {
    console.error("Error sending email verification:", error);
    if (res) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
    throw error;
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await user.findOne({ email });
    if (!existingUser)
      return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    existingUser.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    existingUser.resetPasswordEXpire = Date.now() + 10 * 60 * 1000;
    await existingUser.save();

    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password/${resetToken}`;
    const html = `<h2>Reset Your password</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link expires in 10 minutes.</p>
    `;

    await sendEmail(existingUser.email, html);

    return res
      .status(200)
      .json({ message: "Password reset link sent to email " });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to send email", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const tokenHash = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const existingUser = await user.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordEXpire: { $gt: Date.now() },
    });

    if (!existingUser)
      return res.status(400).json({ message: "Token invalid or expired" });

    existingUser.password = req.body.password;
    existingUser.resetPasswordToken = undefined;
    existingUser.resetPasswordEXpire = undefined;
    await existingUser.save();

    return res
      .status(200)
      .json({ message: "Password reset successful. Please log in." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error resetting the password", error: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) return res.status(401).json({ message: "No refresh token" });

    let decoded;

    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (error) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const tokenHash = hashToken(token);
    const doc = await refreshToken
      .findOne({
        tokenHash,
        jwtId: decoded.jwtId,
      })
      .populate("User");

    if (!doc)
      return res.status(401).json({ message: "Refresh token not recognized" });

    if (doc.revokedAt) {
      return res.status(401).json({ message: "Refresh token revoked" });
    }

    if (doc.expiresAt < new Date()) {
      return res.status(401).json({ message: "Refresh token expired" });
    }

    const result = await rotateRefreshToken(doc, doc.user, req, res);
    return res.status(200).json({ accessToken: result.accessToken });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const handleEmailVerification = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
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
      .json({ message: "Internal server error", error: error.message });
  }
};
