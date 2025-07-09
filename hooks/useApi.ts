import { useUser } from "@/contexts/UserContext";
import {
    authApi,
    booksApi,
    cartApi,
    FavoriteItem,
    favoritesApi,
    ordersApi,
    recommendationsApi,
    ShippingAddress,
    userApi,
} from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Re-export types for convenience
export type { FavoriteItem };

// Query Keys
export const queryKeys = {
    // Auth
    session: ["session"] as const,

    // Books
    books: ["books"] as const,
    topBooks: ["books", "top"] as const,
    allBooks: (params?: any) => ["books", "all", params] as const,
    book: (id: string) => ["books", id] as const,
    searchBooks: (query: string) => ["books", "search", query] as const,
    genres: ["genres"] as const,

    // Cart
    cart: ["cart"] as const,

    // Orders
    orders: ["orders"] as const,
    order: (id: string) => ["orders", id] as const,

    // Favorites
    favorites: (userId: string) => ["favorites", userId] as const,

    // User
    userSettings: ["user", "settings"] as const,
    userPreferences: ["user", "preferences"] as const,
    shippingAddresses: ["user", "shipping-addresses"] as const,

    // Recommendations
    recommendations: ["recommendations"] as const,
} as const;

// Auth Hooks
export function useSession() {
    return useQuery({
        queryKey: queryKeys.session,
        queryFn: authApi.getSession,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Auth mutations
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { email: string; password: string }) => {
            console.log("🔑 Attempting mobile login with:", {
                email: data.email,
            });

            try {
                const response = await authApi.mobileLogin(data);

                if (response.success && response.user) {
                    console.log("🔑 Mobile login successful:", response.user);
                    return response.user;
                } else {
                    throw new Error(response.message || "Login failed");
                }
            } catch (error) {
                console.error("🔑 Mobile login error:", error);
                throw error;
            }
        },
        onSuccess: (user) => {
            console.log("🔑 Login successful, invalidating queries");
            // Invalidate all user-related queries
            queryClient.invalidateQueries({ queryKey: ["user"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["favorites"] });
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
        onError: (error) => {
            console.error("🔑 Login failed:", error);
        },
    });
};

export function useRegister() {
    return useMutation({
        mutationFn: authApi.register,
    });
}

export function useRegisterAlternative() {
    return useMutation({
        mutationFn: authApi.registerAlternative,
    });
}

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            console.log("🚪 Attempting mobile logout...");

            try {
                const response = await authApi.mobileLogout();
                console.log("🚪 Mobile logout successful:", response);
                return response;
            } catch (error) {
                console.error("🚪 Mobile logout error:", error);
                // Don't throw error - we still want to clear local data
                return {
                    success: false,
                    message: "Logout failed but cleared locally",
                };
            }
        },
        onSuccess: () => {
            console.log("🚪 Logout successful, clearing all cached data");
            // Clear all cached data
            queryClient.clear();
        },
        onError: (error) => {
            console.error("🚪 Logout failed:", error);
            // Even if logout fails, clear local cache
            queryClient.clear();
        },
    });
}

// Get user profile with mobile auth
export function useUserProfile() {
    return useQuery({
        queryKey: ["profile"],
        queryFn: authApi.getMobileProfile,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false,
    });
}

// Books Hooks
export function useTopBooks() {
    return useQuery({
        queryKey: queryKeys.topBooks,
        queryFn: booksApi.getTopBooks,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

export function useAllBooks(params?: {
    page?: number;
    sortBy?: string;
    genres?: string;
}) {
    return useQuery({
        queryKey: queryKeys.allBooks(params),
        queryFn: () => booksApi.getAllBooks(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useBook(bookId: string) {
    return useQuery({
        queryKey: queryKeys.book(bookId),
        queryFn: () => booksApi.getBookById(bookId),
        enabled: !!bookId,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

export function useSearchBooks(query: string) {
    return useQuery({
        queryKey: queryKeys.searchBooks(query),
        queryFn: () => booksApi.searchBooks(query),
        enabled: query.length >= 2, // Only search if query is at least 2 characters
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

export function useGenres() {
    return useQuery({
        queryKey: queryKeys.genres,
        queryFn: booksApi.getGenres,
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
}

// Cart Hooks
export function useCart() {
    const { user, isAuthenticated } = useUser();

    return useQuery({
        queryKey: queryKeys.cart,
        queryFn: cartApi.getCart,
        enabled: isAuthenticated && !!user, // Only fetch if user is logged in via mobile auth
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

export function useAddToCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { bookId: string; quantity: number }) => {
            console.log("[AddToCart] Attempting to add to cart:", data);
            return cartApi.addToCart(data);
        },
        onSuccess: (result, variables) => {
            console.log("[AddToCart] Successfully added to cart:", result);
            console.log("[AddToCart] Invalidating cart queries...");
            queryClient.invalidateQueries({ queryKey: queryKeys.cart });
        },
        onError: (error, variables) => {
            console.error("[AddToCart] Failed to add to cart:", error);
            console.error("[AddToCart] Variables:", variables);
        },
    });
}

export function useUpdateCartItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            cartItemId,
            data,
        }: {
            cartItemId: string;
            data: { quantity: number };
        }) => cartApi.updateCartItem(cartItemId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cart });
        },
    });
}

export function useRemoveFromCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cartApi.removeFromCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cart });
        },
    });
}

export function useClearCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cartApi.clearCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cart });
        },
    });
}

// Orders Hooks
export function useOrders() {
    const { user, isAuthenticated } = useUser();

    return useQuery({
        queryKey: queryKeys.orders,
        queryFn: ordersApi.getOrders,
        enabled: isAuthenticated && !!user,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useOrder(orderId: string) {
    const { user, isAuthenticated } = useUser();

    return useQuery({
        queryKey: queryKeys.order(orderId),
        queryFn: () => ordersApi.getOrderDetails(orderId),
        enabled: isAuthenticated && !!user && !!orderId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useCheckout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ordersApi.checkout,
        onSuccess: () => {
            // Invalidate cart and orders after successful checkout
            queryClient.invalidateQueries({ queryKey: queryKeys.cart });
            queryClient.invalidateQueries({ queryKey: queryKeys.orders });
        },
    });
}

// Favorites Hooks
export function useFavorites(userId: string) {
    return useQuery({
        queryKey: queryKeys.favorites(userId),
        queryFn: () => favoritesApi.getFavorites(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useAddToFavorites() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            userId,
            bookId,
        }: {
            userId: string;
            bookId: string;
        }) => {
            console.log("[AddToFavorites] Attempting to add to favorites:", {
                userId,
                bookId,
            });
            return favoritesApi.addToFavorites(userId, bookId);
        },
        onSuccess: (result, { userId, bookId }) => {
            console.log(
                "[AddToFavorites] Successfully added to favorites:",
                result
            );
            console.log(
                "[AddToFavorites] Invalidating favorites queries for user:",
                userId
            );
            queryClient.invalidateQueries({
                queryKey: queryKeys.favorites(userId),
            });
        },
        onError: (error: any, variables) => {
            console.error(
                "[AddToFavorites] Failed to add to favorites:",
                error
            );
            console.error("[AddToFavorites] Variables:", variables);

            // Show user-friendly error message for auth issues
            if (error?.status === 401) {
                console.log(
                    "[AddToFavorites] Server authentication issue detected"
                );
                // You can add a toast notification here when available
            }
        },
    });
}

export function useRemoveFromFavorites() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            userId,
            bookId,
        }: {
            userId: string;
            bookId: string;
        }) => {
            console.log(
                "[RemoveFromFavorites] Attempting to remove from favorites:",
                { userId, bookId }
            );
            return favoritesApi.removeFromFavorites(userId, bookId);
        },
        onSuccess: (result, { userId, bookId }) => {
            console.log(
                "[RemoveFromFavorites] Successfully removed from favorites:",
                result
            );
            console.log(
                "[RemoveFromFavorites] Invalidating favorites queries for user:",
                userId
            );
            queryClient.invalidateQueries({
                queryKey: queryKeys.favorites(userId),
            });
        },
        onError: (error: any, variables) => {
            console.error(
                "[RemoveFromFavorites] Failed to remove from favorites:",
                error
            );
            console.error("[RemoveFromFavorites] Variables:", variables);

            // Show user-friendly error message for auth issues
            if (error?.status === 401) {
                console.log(
                    "[RemoveFromFavorites] Server authentication issue detected"
                );
                // You can add a toast notification here when available
            }
        },
    });
}

// User Hooks
export function useUserSettings() {
    const { user, isAuthenticated } = useUser();

    return useQuery({
        queryKey: queryKeys.userSettings,
        queryFn: userApi.getSettings,
        enabled: isAuthenticated && !!user,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

export function useUpdateUserSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.updateSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.userSettings });
        },
    });
}

export function useUserPreferences() {
    const { user, isAuthenticated } = useUser();

    return useQuery({
        queryKey: queryKeys.userPreferences,
        queryFn: userApi.getPreferences,
        enabled: isAuthenticated && !!user,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

export function useUpdateUserPreferences() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.updatePreferences,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.userPreferences,
            });
        },
    });
}

export function useUpdateUserProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.session });
        },
    });
}

export function useShippingAddresses() {
    const { user, isAuthenticated } = useUser();

    return useQuery({
        queryKey: queryKeys.shippingAddresses,
        queryFn: userApi.getShippingAddresses,
        enabled: isAuthenticated && !!user,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

export function useAddShippingAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.addShippingAddress,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.shippingAddresses,
            });
        },
    });
}

export function useUpdateShippingAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            addressId,
            address,
        }: {
            addressId: string;
            address: Partial<ShippingAddress>;
        }) => userApi.updateShippingAddress(addressId, address),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.shippingAddresses,
            });
        },
    });
}

export function useDeleteShippingAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.deleteShippingAddress,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.shippingAddresses,
            });
        },
    });
}

// Recommendations Hooks
export function useRecommendations() {
    const { user, isAuthenticated } = useUser();

    return useQuery({
        queryKey: queryKeys.recommendations,
        queryFn: recommendationsApi.getRecommendations,
        enabled: isAuthenticated && !!user,
        staleTime: 1000 * 60 * 15, // 15 minutes
    });
}
