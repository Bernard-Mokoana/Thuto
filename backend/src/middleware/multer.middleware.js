import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "../utils/s3Config.utils.js";
import dotenv from "dotenv";

dotenv.config();

const awsBucketName = process.env.AWS_BUCKET_NAME;

export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: awsBucketName,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fileName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `uploads/${Date.now()}-${file.originalname}`);
    },
  }),
});
