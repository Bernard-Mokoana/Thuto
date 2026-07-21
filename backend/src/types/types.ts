import type { Types } from "mongoose";

export type UserRole = "Student" | "Admin" | "Tutor";

export interface AuthUser {
  id: string;
  _id?: string;
  email?: string;
  role: UserRole;
}

export interface AuthRequest {
  body: Record<string, any>;
  params: Record<string, string>;
  query: Record<string, any>;
  cookies?: Record<string, string>;
  headers: Record<string, any>;
  ip?: string;
  user?: AuthUser;
  file?: {
    location?: string;
  };
  files?: Record<string, Array<{ location?: string }>>;
}

export interface ApiResponse {
  status(code: number): ApiResponse;
  json(body: any): ApiResponse;
  clearCookie(name: string, options?: Record<string, any>): ApiResponse;
  cookie(
    name: string,
    value: string,
    options?: Record<string, any>,
  ): ApiResponse;
}

export type ControllerResult = Promise<ApiResponse | void>;

export interface PopulatedPathRef {
  _id: Types.ObjectId;
  createdBy: Types.ObjectId;
}

export interface PopulatedModuleRef {
  _id: Types.ObjectId;
  path: Types.ObjectId;
}

export interface PopulatedStepRef {
  _id: Types.ObjectId;
  lesson: Types.ObjectId;
}

export type QueryObject = Record<string, any>;

export interface AuthenticatedRequest extends Request {
  user: {
    _id: Types.ObjectId;
    email: string;
  };
  ip: string;
}
