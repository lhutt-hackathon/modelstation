"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";

// Types matching the backend API
export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type AuthResponse = {
  user: User;
  token: string;
};

type UserOnlyResponse = {
  user: User;
};

type MessageResponse = {
  message: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

// Token management
const TOKEN_STORAGE_KEY = "modelstation:token";

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

// API client
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
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Request failed");
  }

  return response.json();
}

// API functions
async function fetchCurrentUser(): Promise<User> {
  const data: UserOnlyResponse = await fetchWithAuth("/api/auth/me");
  return data.user;
}

async function loginUser(input: LoginInput): Promise<AuthResponse> {
  return fetchWithAuth("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  return fetchWithAuth("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

async function logoutUser(): Promise<MessageResponse> {
  return fetchWithAuth("/api/auth/logout", {
    method: "POST",
  });
}

// Query keys
export const userKeys = {
  all: ["user"] as const,
  current: () => [...userKeys.all, "current"] as const,
};

// Context type
type UserContextValue = {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Query for current user
  const {
    data: user = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: userKeys.current(),
    queryFn: fetchCurrentUser,
    enabled: !!getToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(userKeys.current(), data.user);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(userKeys.current(), data.user);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      setToken(null);
      queryClient.setQueryData(userKeys.current(), null);
      queryClient.clear();
    },
    onError: () => {
      // Always clear on logout, even if API call fails
      setToken(null);
      queryClient.setQueryData(userKeys.current(), null);
      queryClient.clear();
    },
  });

  const contextValue: UserContextValue = {
    user,
    isLoading,
    isError,
    error: error as Error | null,
    login: async (input: LoginInput) => {
      await loginMutation.mutateAsync(input);
    },
    register: async (input: RegisterInput) => {
      await registerMutation.mutateAsync(input);
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    refetch: async () => {
      await refetch();
    },
  };

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
}

// Hook to use the user context
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
