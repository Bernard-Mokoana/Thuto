// Global augmentation

import { JwtUserPayload } from "./types.ts";

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

export {};
