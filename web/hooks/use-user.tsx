"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

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

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  models?: ModelRecord[]; // Optional for now, can be fetched separately
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

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    credentials: "include", // Include cookies in requests
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
  isReady: boolean; // Inverted isLoading for compatibility
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
  const router = useRouter();

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
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.current(), data.user);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.current(), data.user);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(userKeys.current(), null);
      queryClient.clear();
      router.push("/login");
    },
    onError: () => {
      // Always clear on logout, even if API call fails
      queryClient.setQueryData(userKeys.current(), null);
      queryClient.clear();
      router.push("/login");
    },
  });

  const contextValue: UserContextValue = {
    user,
    isLoading,
    isReady: !isLoading, // Inverted for compatibility with old code
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
