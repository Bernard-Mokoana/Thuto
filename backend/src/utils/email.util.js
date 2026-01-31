import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const createEmailTransporter = () => {
  const config = {
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  };

  return nodemailer.createTransport(config);
};

export const sendEmailVerification = async (email, token) => {
  try {
    const transporter = createEmailTransporter();

    const verificationUrl = `${process.env.CORS_ORIGIN}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thuto email verification",
      html: buildEmaiVerificationHtml(verificationUrl),
    });
  } catch (error) {
    throw error;
  }
};

export const sendForgotPasswordEmail = async (email, token) => {
  try {
    const transporter = createEmailTransporter();

    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thuto reset password verification",
      html: buildResetPassowrdHtml(resetUrl),
    });
  } catch (error) {
    throw error;
  }
};

const buildEmaiVerificationHtml = (verificationUrl) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
      <tr>
        <td align="center">
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; margin: 20px 0; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <h1 style="color: #333333;">Verify Your Email Address</h1>
                <p style="color: #666666; font-size: 16px;">
                  Thank you for registering with Thuto. To complete your registration, please click the button below to verify your email address.
                </p>
                <a href="${verificationUrl}" style="display: inline-block; padding: 15px 25px; margin: 20px 0; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify Email</a>
                <p style="color: #666666; font-size: 14px;">
                  If you did not create an account, no further action is required.
                </p>
                <p style="color: #aaaaaa; font-size: 12px;">
                  &copy; 2024 Thuto. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

const buildResetPassowrdHtml = (resetUrl) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
      <tr>
        <td align="center">
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; margin: 20px 0; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <h1 style="color: #333333;">Reset Your Password</h1>
                <p style="color: #666666; font-size: 16px;">
                  You are receiving this email because you requested a password reset for your Thuto account. Please click the button below to reset your password.
                </p>
                <a href="${resetUrl}" style="display: inline-block; padding: 15px 25px; margin: 20px 0; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px;">Reset Password</a>
                <p style="color: #666666; font-size: 14px;">
                  If you did not request a password reset, please ignore this email.
                </p>
                <p style="color: #aaaaaa; font-size: 12px;">
                  &copy; 2024 Thuto. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};
