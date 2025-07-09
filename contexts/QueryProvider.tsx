import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { useApiStatus } from "./ApiStatusContext";

// We'll create the client inside the provider so it can access the API status context
let globalQueryClient: QueryClient | null = null;

interface QueryProviderProps {
    children: ReactNode;
}

function QueryProviderInner({ children }: QueryProviderProps) {
    const { setApiUnavailable, setApiAvailable } = useApiStatus();

    // Create query client with API status integration
    if (!globalQueryClient) {
        globalQueryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 1000 * 60 * 5, // 5 minutes
                    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
                    retry: (failureCount, error: any) => {
                        // Check if this is an API unavailability error
                        if (error?.isApiUnavailable) {
                            // Update global API status
                            setApiUnavailable(
                                error.message || "API temporarily unavailable"
                            );
                            return false; // Don't retry API unavailability errors
                        }

                        // Don't retry on 4xx errors
                        if (
                            error instanceof Error &&
                            (error.message.includes("4") ||
                                error.message.includes("HTTP 4"))
                        ) {
                            return false;
                        }

                        return failureCount < 3;
                    },
                    refetchOnWindowFocus: false,
                    onError: (error: any) => {
                        // Global error handler for queries
                        if (error?.isApiUnavailable) {
                            setApiUnavailable(
                                error.message || "API temporarily unavailable"
                            );
                        }
                    },
                    onSuccess: () => {
                        // If any query succeeds, mark API as available
                        setApiAvailable();
                    },
                },
                mutations: {
                    retry: (failureCount, error: any) => {
                        // Don't retry mutations if API is unavailable
                        if (error?.isApiUnavailable) {
                            setApiUnavailable(
                                error.message || "API temporarily unavailable"
                            );
                            return false;
                        }
                        return false; // Generally don't retry mutations
                    },
                    onError: (error: any) => {
                        // Global error handler for mutations
                        if (error?.isApiUnavailable) {
                            setApiUnavailable(
                                error.message || "API temporarily unavailable"
                            );
                        }
                    },
                    onSuccess: () => {
                        // If any mutation succeeds, mark API as available
                        setApiAvailable();
                    },
                },
            },
        });
    }

    return (
        <QueryClientProvider client={globalQueryClient}>
            {children}
        </QueryClientProvider>
    );
}

export function QueryProvider({ children }: QueryProviderProps) {
    return <QueryProviderInner>{children}</QueryProviderInner>;
}

export { globalQueryClient as queryClient };
