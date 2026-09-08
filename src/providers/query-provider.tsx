import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { ApiError } from "@/api/http-client";

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status && error.status < 500) {
    return false;
  }
  return failureCount < 1;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: shouldRetryQuery,
      staleTime: 30_000,
      gcTime: 30 * 60_000,
    },
    mutations: {
      retry: false,
    },
  },
});

export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
