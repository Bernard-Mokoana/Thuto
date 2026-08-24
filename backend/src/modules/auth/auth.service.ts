import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Jwt } from "jsonwebtoken";

import { User, user, type User as UserDoc } from "../../model/user";
import RefreshTokenModel from "../../model/refreshToken";
import { EmailVerificationToken } from "../../model/emailVerificationToken";
import { ResetPasswordToken } from "../../model/resetPasswordToken";
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
} from "../../utils/tokenUtils";
import {
  sendEmailVerification,
  sendForgotPasswordEmail,
} from "../../utils/email.util";
// import { AppError } from "../utils/AppError.ts";

import type { RefreshTokenPayload } from "../../types/types";

const jwtSecret = process.env.ACCESS_TOKEN_SECRET;
if (!jwtSecret) {
  throw new Error(
    "ACCESS_TOKEN_SECRET is not defined in environment variables",
  );
}

export interface PublicUser {
  _id: UserDoc["_id"];
  firstName: UserDoc["firstName"];
  lastName: UserDoc["lastName"];
  email: UserDoc["email"];
  role: UserDoc["role"];
  isVerified: UserDoc["isVerified"];
  profileImage: UserDoc["profileImage"];
}

function toPublicUser(u: UserDoc): PublicUser {
  return {
    _id: u._id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role,
    isVerified: u.isVerified,
    profileImage: u.profileImage,
  };
}

export interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}
