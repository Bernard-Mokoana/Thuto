import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { authAPI, userAPI } from "../services/api";
import { toast } from "react-toastify";
import type { User } from "../types/models";
import { AuthContext } from "./auth-context";

interface AuthProviderProps {
  children: ReactNode;
}

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

const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const persistUser = (nextUser: User | null) => {
  if (nextUser) {
    localStorage.setItem("user", JSON.stringify(nextUser));
  } else {
    localStorage.removeItem("user");
  }
};

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

  const clearSessionTimers = useCallback(() => {
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
  }, []);

  const startCountdown = useCallback((expiryTime: number) => {
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
  }, []);

  const handleSessionExpired = useCallback(() => {
    clearSessionTimers();
    clearAuthStorage();
    setShowSessionExpiryModal(false);
    setUser(null);
    toast.error("Session expired. Please log in again.");
    authAPI.logout().catch(() => {
    });
  }, [clearSessionTimers]);

  const scheduleSessionExpiryWarning = useCallback(() => {
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
  }, [clearSessionTimers, handleSessionExpired, startCountdown]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      userAPI
        .getProfile(parsedUser._id)
        .then((response) => {
          const refreshedUser = response.data.user;
          setUser(refreshedUser);
          persistUser(refreshedUser);
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
    const response = await authAPI.login({ email, password });
    const { accessToken, user: userData } = response.data;

    localStorage.setItem("token", accessToken);
    persistUser(userData);
    setUser(userData);
    scheduleSessionExpiryWarning();
  };

  const register = async (userData: FormData) => {
    await authAPI.register(userData);
  };

  const refreshUser = async (userId?: string) => {
    const targetUserId = userId || user?._id;
    if (!targetUserId) return null;

    const response = await userAPI.getProfile(targetUserId);
    const refreshedUser = response.data.user;
    setUser(refreshedUser);
    persistUser(refreshedUser);
    return refreshedUser;
  };

  const logout = () => {
    clearSessionTimers();
    setShowSessionExpiryModal(false);
    clearAuthStorage();
    setUser(null);
    authAPI.logout().catch(() => {
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
  }, [user, clearSessionTimers, scheduleSessionExpiryWarning]);

  const value = {
    user,
    loading,
    login,
    register,
    refreshUser,
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

