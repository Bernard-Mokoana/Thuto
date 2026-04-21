import { createContext } from "react";
import type { User } from "../types/models";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: FormData) => Promise<void>;
  refreshUser: (userId?: string) => Promise<User | null>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
