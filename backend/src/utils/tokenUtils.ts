import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Request, Response } from "express";

import RefreshToken from "../model/refreshToken.ts";
import EmailVerification from "../model/emailVerificationToken.ts";
import resetPasswordToken from "../model/resetPasswordToken.ts";
import type { User } from "../model/user.ts";

const rawSecret = process.env.ACCESS_TOKEN_SECRET;
if (!rawSecret) {
  throw new Error(
    "ACCESS_TOKEN_SECRET is not defined in environment variables",
  );
}

const jwtSecret: string = rawSecret;
const ACCESS_TTL = "15m";
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7;

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createJwtId(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function signAccessToken(user: User): string {
  const payload = {
    _id: user._id?.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, jwtSecret, { expiresIn: ACCESS_TTL });
}

export function signRefreshToken(user: User, jwtId: string): string {
  const payload = {
    id: user._id?.toString(),
    jwtId,
    role: user.role,
  };

  return jwt.sign(payload, jwtSecret, { expiresIn: REFRESH_TTL_SECONDS });
}

interface PersistRefreshTokenParams {
  user: User;
  refreshToken: string;
  jwtId: string;
  ip?: string;
  userAgent?: string;
}

interface RotatableRefreshTokenDoc {
  revokedAt?: Date | null;
  replacedBy?: string | null;
  save(): Promise<unknown>;
}

export async function persistRefreshToken({
  user,
  refreshToken,
  jwtId,
  ip,
  userAgent,
}: PersistRefreshTokenParams): Promise<void> {
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);

  await RefreshToken.create({
    user: user._id,
    tokenHash,
    jwtId,
    expiresAt,
    ip,
    userAgent,
  });
}

export function setRefreshCookie(res: Response, refreshToken: string): void {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "strict",
    path: "/api/v1/auth/refresh",
    maxAge: REFRESH_TTL_SECONDS * 1000,
  });
}

export async function rotateRefreshToken(
  oldDoc: RotatableRefreshTokenDoc,
  user: User,
  req: Request,
  res: Response,
): Promise<string> {
  oldDoc.revokedAt = new Date();

  const newJwtId = createJwtId();
  oldDoc.replacedBy = newJwtId;
  await oldDoc.save();

  const newAccessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user, newJwtId);

  await persistRefreshToken({
    user,
    refreshToken: newRefreshToken,
    jwtId: newJwtId,
    ip: req.ip,
    userAgent: req.headers["user-agent"] as string | undefined,
  });

  setRefreshCookie(res, newRefreshToken);

  return newAccessToken;
}

export async function generateEmailVerificationToken(
  user: User,
  jwtId: string,
  ip?: string,
  userAgent?: string,
): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await EmailVerification.create({
    user: user._id,
    tokenHash,
    jwtId,
    expiresAt,
    ip,
    userAgent,
  });

  return rawToken;
}

export async function generateForgotPasswordToken(
  user: User,
  jwtId: string,
  ip?: string,
  userAgent?: string,
): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await resetPasswordToken.create({
    user: user._id,
    tokenHash,
    jwtId,
    ip,
    expiresAt,
    userAgent,
  });

  return rawToken;
}
