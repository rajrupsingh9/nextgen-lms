import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

const TOKEN_KEY = "auth_secure_jwt_token";
const WS_SECURITY_ENDPOINT = "wss://api.yourlmsapp.com/v1/security/session";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (jwt: string, userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize and check for existing hardware-secured token
  useEffect(() => {
    async function loadStoredToken() {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          // Fallback parsing: Extract userId from JWT claims to initialize single-device socket validation
          const base64Url = storedToken.split(".")[1];
          if (base64Url) {
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
            );
            const payload = JSON.parse(jsonPayload);
            initializeSingleDeviceSocket(payload.sub);
          }
        }
      } catch (error) {
        console.error("Hardware secure storage retrieval failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredToken();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Enforce Single-Device Login Validation via WebSockets (FR 1.1)
  function initializeSingleDeviceSocket(userId: string) {
    if (wsRef.current) {
      wsRef.current.close();
    }

    wsRef.current = new WebSocket(`${WS_SECURITY_ENDPOINT}?userId=${userId}`);

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // If backend broadcasts that another hardware ID claimed this session, terminate locally
        if (data.type === "SESSION_TERMINATED" || data.reason === "MULTIPLE_DEVICE_LOGIN") {
          executeForceLogout();
        }
      } catch (err) {
        console.error("Failed to parse security frame:", err);
      }
    };

    wsRef.current.onclose = () => {
      // Reconnect logic with backoff to guarantee persistent single-device validation
      setTimeout(() => {
        if (token) initializeSingleDeviceSocket(userId);
      }, 5000);
    };
  }

  async function login(jwt: string, userId: string) {
    setIsLoading(true);
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, jwt);
      setToken(jwt);
      initializeSingleDeviceSocket(userId);
      router.replace("/");
    } catch (error) {
      console.error("Failed to securely store token:", error);
      throw new Error("Secure authentication storage failure");
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    setIsLoading(true);
    try {
      if (wsRef.current) {
        wsRef.current.close();
      }
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setToken(null);
      router.replace("/login");
    } catch (error) {
      console.error("Failed to securely purge token:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function executeForceLogout() {
    SecureStore.deleteItemAsync(TOKEN_KEY).then(() => {
      setToken(null);
      router.replace("/login");
    });
  }

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be executed inside an AuthProvider hierarchy");
  }
  return context;
}