import jwt from "jsonwebtoken";
import crypto from "crypto";
import RefreshToken from "../model/refreshToken.js";
import EmailVerification from "../model/emailVerificationToken.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const jwtSecret = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TTL = "15m";
const REFRESH_TTL = 60 * 60 * 24 * 7;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createJwtId() {
  return crypto.randomBytes(16).toString("hex");
}

function signAccessToken(user) {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, jwtSecret, { expiresIn: ACCESS_TTL });
  return token;
}

function signRefreshToken(user, jwtId) {
  const payload = {
    id: user._id.toString(),
    jwtId,
    role: user.role,
  };

  const token = jwt.sign(payload, jwtSecret, { expiresIn: REFRESH_TTL });
  return token;
}

async function persistRefreshToken({
  user,
  refreshToken,
  jwtId,
  ip,
  userAgent,
}) {
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TTL * 1000);

  await RefreshToken.create({
    user: user._id,
    tokenHash,
    jwtId,
    expiresAt,
    ip,
    userAgent,
  });
}

function setRefreshCookie(res, refreshToken) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "strict",
    path: "/api/v1/auth/refresh",
    maxAge: REFRESH_TTL * 1000,
  });
}

async function rotateRefreshToken(oldDoc, user, req, res) {
  oldDoc.revokedAt = new Date();
  const newJwtId = createJwtId();
  oldDoc.replacedBy = newJwtId;

  const newAccess = signAccessToken(user);
  const newRefresh = signRefreshToken(user, newJwtId);
  await persistRefreshToken({
    user,
    refreshToken: newRefresh,
    jwtId: newJwtId,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
  setRefreshCookie(res, newRefresh);
  return newAccess;
}

async function generateEmailVerificationToken(user, jwtId, ip, userAgent) {
  const tokenHash = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await EmailVerification.create({
    user: user._id,
    tokenHash,
    jwtId,
    expiresAt,
    ip,
    userAgent,
  });

  return tokenHash;
}

export {
  hashToken,
  createJwtId,
  signAccessToken,
  signRefreshToken,
  persistRefreshToken,
  setRefreshCookie,
  rotateRefreshToken,
  generateEmailVerificationToken,
};
