import {
    authApi,
    booksApi,
    cartApi,
    favoritesApi,
    ordersApi,
    recommendationsApi,
    ShippingAddress,
    userApi,
} from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: () => {
            // Invalidate session query to refetch user data
            queryClient.invalidateQueries({ queryKey: queryKeys.session });
        },
    });
}

export function useRegister() {
    return useMutation({
        mutationFn: authApi.register,
    });
}

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            // Clear all user-related queries
            queryClient.removeQueries({ queryKey: queryKeys.session });
            queryClient.removeQueries({ queryKey: queryKeys.cart });
            queryClient.removeQueries({ queryKey: queryKeys.orders });
            queryClient.removeQueries({ queryKey: queryKeys.userSettings });
            queryClient.removeQueries({ queryKey: queryKeys.userPreferences });
            queryClient.removeQueries({
                queryKey: queryKeys.shippingAddresses,
            });
        },
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
    const { data: session } = useSession();

    return useQuery({
        queryKey: queryKeys.cart,
        queryFn: cartApi.getCart,
        enabled: !!session?.user, // Only fetch if user is logged in
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

export function useAddToCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cartApi.addToCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cart });
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
    const { data: session } = useSession();

    return useQuery({
        queryKey: queryKeys.orders,
        queryFn: ordersApi.getOrders,
        enabled: !!session?.user,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useOrder(orderId: string) {
    const { data: session } = useSession();

    return useQuery({
        queryKey: queryKeys.order(orderId),
        queryFn: () => ordersApi.getOrderDetails(orderId),
        enabled: !!session?.user && !!orderId,
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
        mutationFn: ({ userId, bookId }: { userId: string; bookId: string }) =>
            favoritesApi.addToFavorites(userId, bookId),
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.favorites(userId),
            });
        },
    });
}

export function useRemoveFromFavorites() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, bookId }: { userId: string; bookId: string }) =>
            favoritesApi.removeFromFavorites(userId, bookId),
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.favorites(userId),
            });
        },
    });
}

// User Hooks
export function useUserSettings() {
    const { data: session } = useSession();

    return useQuery({
        queryKey: queryKeys.userSettings,
        queryFn: userApi.getSettings,
        enabled: !!session?.user,
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
    const { data: session } = useSession();

    return useQuery({
        queryKey: queryKeys.userPreferences,
        queryFn: userApi.getPreferences,
        enabled: !!session?.user,
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
    const { data: session } = useSession();

    return useQuery({
        queryKey: queryKeys.shippingAddresses,
        queryFn: userApi.getShippingAddresses,
        enabled: !!session?.user,
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
    const { data: session } = useSession();

    return useQuery({
        queryKey: queryKeys.recommendations,
        queryFn: recommendationsApi.getRecommendations,
        enabled: !!session?.user,
        staleTime: 1000 * 60 * 15, // 15 minutes
    });
}
