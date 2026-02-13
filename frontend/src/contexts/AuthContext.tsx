import { createContext, useContext, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { authAPI, userAPI } from "../services/api";
import { toast } from "react-toastify";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Student" | "Tutor" | "Admin";
  isVerified: boolean;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: FormData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSessionExpiryModal, setShowSessionExpiryModal] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expiryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const clearSessionTimers = () => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }

    if (expiryTimeoutRef.current) {
      clearTimeout(expiryTimeoutRef.current);
      expiryTimeoutRef.current = null;
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const getTokenExpiryTime = (token: string) => {
    try {
      const payloadPart = token.split(".")[1];
      if (!payloadPart) return null;

      const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
      const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
      const payload = JSON.parse(atob(paddedBase64));

      return typeof payload.exp === "number" ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  };

  const startCountdown = (expiryTime: number) => {
    const getRemainingSeconds = () =>
      Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000));

    setSecondsLeft(getRemainingSeconds());

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      const remaining = getRemainingSeconds();
      setSecondsLeft(remaining);

      if (remaining <= 0 && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }, 1000);
  };

  const clearAuthStorage = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const handleSessionExpired = () => {
    clearSessionTimers();
    clearAuthStorage();
    setShowSessionExpiryModal(false);
    setUser(null);
    toast.error("Session expired. Please log in again.");
    authAPI.logout().catch(() => {
      // Ignore logout errors
    });
  };

  const scheduleSessionExpiryWarning = () => {
    clearSessionTimers();

    const token = localStorage.getItem("token");
    if (!token) return;

    const expiryTime = getTokenExpiryTime(token);
    if (!expiryTime) return;

    const now = Date.now();
    const warningTime = expiryTime - 10000;

    if (expiryTime <= now) {
      handleSessionExpired();
      return;
    }

    if (warningTime <= now) {
      setShowSessionExpiryModal(true);
      startCountdown(expiryTime);
    } else {
      warningTimeoutRef.current = setTimeout(() => {
        setShowSessionExpiryModal(true);
        startCountdown(expiryTime);
      }, warningTime - now);
    }

    expiryTimeoutRef.current = setTimeout(handleSessionExpired, expiryTime - now);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      userAPI
        .getProfile(parsedUser._id)
        .then((response) => {
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { accessToken, user: userData } = response.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      scheduleSessionExpiryWarning();
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: FormData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      scheduleSessionExpiryWarning();
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    clearSessionTimers();
    setShowSessionExpiryModal(false);
    clearAuthStorage();
    setUser(null);
    authAPI.logout().catch(() => {
      // Ignore logout errors
    });
  };

  useEffect(() => {
    if (user) {
      scheduleSessionExpiryWarning();
    } else {
      clearSessionTimers();
      setShowSessionExpiryModal(false);
    }

    return () => {
      clearSessionTimers();
    };
  }, [user]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showSessionExpiryModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="px-6 pt-6 pb-4 text-center">
              <h3 className="text-2xl font-bold text-red-500">
                Session Expiring
              </h3>
              <p className="mt-3 text-base text-gray-700">
                Your session token expires in{" "}
                <span className="font-semibold">{secondsLeft}</span> seconds.
              </p>
            </div>
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => setShowSessionExpiryModal(false)}
                className="w-1/2 border-r border-gray-200 py-3 text-lg font-medium text-gray-500 transition-colors hover:bg-gray-50"
              >
                Dismiss
              </button>
              <button
                onClick={logout}
                className="w-1/2 py-3 text-lg font-semibold text-indigo-500 transition-colors hover:bg-gray-50"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

