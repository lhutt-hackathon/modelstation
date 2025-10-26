"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

const TOKEN_STORAGE_KEY = "modelstation:token";

export type ModelRecord = {
  id: string;
  name: string;
  baseModel: string;
  dataset: string;
  status: "Queued" | "Training" | "QA" | "Live";
  createdAt: string;
  updatedAt: string;
  objective: string;
  successCriteria: string;
  guardrailsEnabled: boolean;
  dryRun: boolean;
  notes: string;
  evaluationSuites: string[];
};

export type UserAccount = {
  id: string;
  email: string;
  name: string;
  role: string;
  models: ModelRecord[];
};

type AuthContextValue = {
  user: UserAccount | null;
  isReady: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  createModel: (input: Omit<ModelRecord, "id" | "status" | "createdAt" | "updatedAt">) => Promise<ModelRecord | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Load user from token on mount
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsReady(true);
      return;
    }

    fetchWithAuth("/api/auth/me")
      .then(({ user: serverUser }) => {
        // Load models for user
        fetchWithAuth("/api/models")
          .then(({ models }) => {
            setUser({
              ...serverUser,
              models: models || [],
            });
          })
          .catch(() => {
            setUser({
              ...serverUser,
              models: [],
            });
          })
          .finally(() => {
            setIsReady(true);
          });
      })
      .catch(() => {
        setToken(null);
        setIsReady(true);
      });
  }, []);

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const data = await fetchWithAuth("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(data.token);

      // Load models for user
      const { models } = await fetchWithAuth("/api/models");

      setUser({
        ...data.user,
        models: models || [],
      });
    },
    []
  );

  const register = useCallback(
    async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const data = await fetchWithAuth("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      setToken(data.token);

      setUser({
        ...data.user,
        models: [],
      });
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetchWithAuth("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      // Ignore errors on logout
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  const createModel: AuthContextValue["createModel"] = useCallback(
    async (input) => {
      if (!user) {
        return null;
      }

      try {
        const { model } = await fetchWithAuth("/api/models", {
          method: "POST",
          body: JSON.stringify(input),
        });

        // Update local user state
        setUser((prev) =>
          prev
            ? {
                ...prev,
                models: [model, ...prev.models],
              }
            : prev
        );

        return model;
      } catch (error) {
        console.error("Failed to create model:", error);
        return null;
      }
    },
    [user]
  );

  const memoisedValue = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      login,
      register,
      logout,
      createModel,
    }),
    [createModel, isReady, login, logout, register, user]
  );

  return <AuthContext.Provider value={memoisedValue}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
