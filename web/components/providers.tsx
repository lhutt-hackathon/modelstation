"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/components/auth/auth-provider";
import { UserProvider } from "@/hooks/use-user";

export function Providers({ children }: { children: React.ReactNode }) {
  // Create a client per provider instance to avoid sharing state between different users
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <AuthProvider>{children}</AuthProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
