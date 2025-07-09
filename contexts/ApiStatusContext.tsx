import React, { createContext, useContext, useState } from "react";

interface ApiStatusContextType {
    isApiAvailable: boolean;
    apiError: string | null;
    setApiUnavailable: (error: string) => void;
    setApiAvailable: () => void;
    retryConnection: () => Promise<void>;
    lastChecked: Date | null;
}

const ApiStatusContext = createContext<ApiStatusContextType | undefined>(
    undefined
);

interface ApiStatusProviderProps {
    children: React.ReactNode;
}

export function ApiStatusProvider({ children }: ApiStatusProviderProps) {
    const [isApiAvailable, setIsApiAvailable] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    const setApiUnavailable = (error: string) => {
        setIsApiAvailable(false);
        setApiError(error);
        setLastChecked(new Date());
    };

    const setApiAvailable = () => {
        setIsApiAvailable(true);
        setApiError(null);
        setLastChecked(new Date());
    };

    const retryConnection = async () => {
        try {
            // Try to ping the API with a simple request
            const response = await fetch("https://book.stvr.cz/api/books", {
                method: "HEAD", // Use HEAD to minimize data transfer
                signal: AbortSignal.timeout(5000), // 5 second timeout
            });

            if (response.ok) {
                setApiAvailable();
                return;
            }

            // If we get a response but it's an error, check if it's a server error
            if (response.status >= 500) {
                setApiUnavailable("Server temporarily unavailable");
            } else {
                // For 4xx errors, consider API as available but with other issues
                setApiAvailable();
            }
        } catch (error) {
            // Network errors, timeouts, or other connection issues
            setApiUnavailable("Unable to connect to server");
        }
    };

    return (
        <ApiStatusContext.Provider
            value={{
                isApiAvailable,
                apiError,
                setApiUnavailable,
                setApiAvailable,
                retryConnection,
                lastChecked,
            }}
        >
            {children}
        </ApiStatusContext.Provider>
    );
}

export function useApiStatus() {
    const context = useContext(ApiStatusContext);
    if (context === undefined) {
        throw new Error(
            "useApiStatus must be used within an ApiStatusProvider"
        );
    }
    return context;
}

// Utility function to check if an error indicates API unavailability
export function isApiUnavailableError(error: any): boolean {
    if (!error) return false;

    // Network errors
    if (error.name === "TypeError" && error.message.includes("fetch")) {
        return true;
    }

    // Timeout errors
    if (error.name === "AbortError" || error.message.includes("timeout")) {
        return true;
    }

    // Connection errors
    if (
        error.message.includes("Network request failed") ||
        error.message.includes("Connection refused") ||
        error.message.includes("Unable to connect")
    ) {
        return true;
    }

    // HTTP 5xx errors (server errors)
    if (
        error.message.includes("HTTP 5") ||
        error.message.includes("Internal Server Error") ||
        error.message.includes("Bad Gateway") ||
        error.message.includes("Service Unavailable") ||
        error.message.includes("Gateway Timeout")
    ) {
        return true;
    }

    return false;
}
