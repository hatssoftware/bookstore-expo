import { authApi, tokenManager, User } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [hasToken, setHasToken] = useState<boolean | null>(null);

    // Check for stored token on mount
    useEffect(() => {
        const checkToken = async () => {
            const tokenExists = await tokenManager.hasToken();
            setHasToken(tokenExists);
            console.log("UserContext: Token check result:", tokenExists);
        };
        checkToken();
    }, []);

    // Query for user profile using mobile endpoint
    const {
        data: profileResponse,
        isLoading: profileLoading,
        refetch: refetchProfile,
        error: profileError,
    } = useQuery({
        queryKey: ["profile"],
        queryFn: authApi.getMobileProfile,
        enabled: hasToken === true, // Only fetch if we have a token
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false, // Don't retry on 401
    });

    const user = profileResponse?.success ? profileResponse.user : null;
    const isAuthenticated = !!user && hasToken === true;
    const isLoading =
        profileLoading || isLoggingIn || isLoggingOut || hasToken === null;

    const login = async (email: string, password: string): Promise<void> => {
        setIsLoggingIn(true);
        try {
            console.log("UserContext: Starting mobile login process...");
            console.log("UserContext: Email:", email);

            const response = await authApi.mobileLogin({ email, password });

            if (response.success && response.user) {
                console.log(
                    "UserContext: Mobile login successful:",
                    response.user
                );
                setHasToken(true);

                // Refetch profile to update the UI
                await refetchProfile();
                console.log("UserContext: Login completed successfully");
            } else {
                throw new Error(response.message || "Login failed");
            }
        } catch (error) {
            console.log("UserContext: Login failed with error:", error);
            setHasToken(false);
            throw error; // Re-throw to let the UI handle the error
        } finally {
            setIsLoggingIn(false);
            console.log("UserContext: Login process finished");
        }
    };

    const logout = async (): Promise<void> => {
        setIsLoggingOut(true);
        try {
            console.log("UserContext: Attempting mobile logout...");

            // Call the mobile logout API
            await authApi.mobileLogout();
            console.log("UserContext: Mobile logout API successful");

            setHasToken(false);

            // Clear all user-related queries
            queryClient.clear();

            console.log("UserContext: User data cleared");
        } catch (error) {
            console.log("UserContext: Logout failed:", error);
            // Even if logout API fails, clear local state
            setHasToken(false);
            queryClient.clear();
        } finally {
            setIsLoggingOut(false);
        }
    };

    const refetchUser = async () => {
        console.log("UserContext: Manually refetching user profile...");
        await refetchProfile();
    };

    // Debug logging
    useEffect(() => {
        console.log("UserContext state updated:", {
            hasUser: !!user,
            userId: user?.id,
            email: user?.email,
            isAuthenticated,
            isLoading,
            hasToken,
            profileResponseSuccess: profileResponse?.success,
            profileError: profileError?.message,
            profileLoading,
        });
        
        if (profileError) {
            console.error("UserContext: Profile fetch error:", profileError);
        }
        
        if (profileResponse) {
            console.log("UserContext: Profile response:", profileResponse);
        }
    }, [user, isAuthenticated, isLoading, hasToken, profileResponse, profileError, profileLoading]);

    const contextValue: UserContextType = {
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refetchUser,
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser(): UserContextType {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
