import pkg from "@aws-sdk/client-s3";
import dotenv from "dotenv";

const { S3Client: s3Client } = pkg;

dotenv.config();

export const s3 = new s3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
