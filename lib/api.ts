const BASE_URL = "http://localhost:3000/api";
const TOKEN_KEY = "bookstore_auth_token";

// API Response types
export interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    errorCode?: string;
}

// Mobile Auth Response types
export interface MobileAuthResponse {
    success: boolean;
    message: string;
    user?: User;
    token?: string;
    hasOnboardingPreferences?: boolean;
}

export interface MobileProfileResponse {
    success: boolean;
    message: string;
    user?: User & {
        phoneNumber?: string;
        createdAt?: string;
        hasOnboardingPreferences?: boolean;
        preferences?: {
            favoriteBookTitles?: string[];
            favoriteAuthorNames?: string[];
            preferredGenreIds?: string[];
            readingGoal?: string;
            eraPreference?: string;
            fictionPreference?: string;
        };
    };
}

// Book types
export interface Book {
    id: string;
    ISBN10: string;
    ISBN13: string;
    title: string;
    subtitle?: string;
    description?: string;
    imageURL?: string;
    year?: number;
    criticRating?: number;
    pagecount?: number;
    bookStockRating?: number;
    bookStockRatingCount?: number;
    combinedRating?: number;
    combinedRatingCount?: number;
    price: number;
    salePrice?: number;
    stockQuantity: number;
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
    isHidden: boolean;
    isUnavailable: boolean;
    createdAt: string;
    updatedAt: string;
    authors: { name: string }[];
    genres: { name: string; id?: string }[];
}

// Cart types
export interface CartItem {
    id: string;
    quantity: number;
    addedAt: string;
    book: Book;
}

export interface Cart {
    id: string;
    userId: string;
    status: string;
    items: CartItem[];
    createdAt: string;
    updatedAt: string;
}

// User types
export interface User {
    id: string;
    email: string;
    name: string;
    gender?: string;
    age?: number;
}

export interface UserSession {
    user: User;
    expires: string;
}

// Order types
export interface Order {
    id: string;
    orderNumber: string;
    date: string;
    status: string;
    totalPrice: number;
    shippingAddress?: any;
    orderItems?: any[];
}

// Address types
export interface ShippingAddress {
    id: string;
    firstName: string;
    lastName: string;
    company?: string;
    country: string;
    state?: string;
    city: string;
    street: string;
    postalCode: string;
    phoneNumber?: string;
    isDefault: boolean;
}

// Token management utilities
export const tokenManager = {
    async getToken(): Promise<string | null> {
        try {
            const storage = await import(
                "@react-native-async-storage/async-storage"
            );
            return await storage.default.getItem(TOKEN_KEY);
        } catch (error) {
            console.error("[TokenManager] Failed to get token:", error);
            return null;
        }
    },

    async setToken(token: string): Promise<void> {
        try {
            const storage = await import(
                "@react-native-async-storage/async-storage"
            );
            await storage.default.setItem(TOKEN_KEY, token);
            console.log("[TokenManager] Token stored successfully");
        } catch (error) {
            console.error("[TokenManager] Failed to store token:", error);
        }
    },

    async removeToken(): Promise<void> {
        try {
            const storage = await import(
                "@react-native-async-storage/async-storage"
            );
            await storage.default.removeItem(TOKEN_KEY);
            console.log("[TokenManager] Token removed successfully");
        } catch (error) {
            console.error("[TokenManager] Failed to remove token:", error);
        }
    },

    async hasToken(): Promise<boolean> {
        const token = await this.getToken();
        return !!token;
    },
};

// Generic API client
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        // Get auth token for mobile endpoints
        const token = await tokenManager.getToken();

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(options.headers as Record<string, string>),
        };

        // Add Authorization header if we have a token
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const config: RequestInit = {
            headers,
            credentials: "include", // Keep for legacy session-based endpoints
            ...options,
        };

        console.log(`[API] Making ${options.method || "GET"} request to:`, url);
        console.log(`[API] Request config:`, config);

        try {
            const response = await fetch(url, config);

            console.log(
                `[API] Response status:`,
                response.status,
                response.statusText
            );
            console.log(
                `[API] Response headers:`,
                Object.fromEntries(response.headers.entries())
            );

            if (!response.ok) {
                const errorData = await response.text();
                console.log(`[API] Error response data:`, errorData);

                let errorMessage = "An error occurred";

                try {
                    const parsedError = JSON.parse(errorData);
                    errorMessage = parsedError.error || errorMessage;
                    console.log(`[API] Parsed error:`, parsedError);
                } catch {
                    errorMessage = errorData || `HTTP ${response.status}`;
                    console.log(
                        `[API] Could not parse error as JSON, using raw data:`,
                        errorData
                    );
                }

                // Create enhanced error with status code information
                const error = new Error(errorMessage);
                (error as any).status = response.status;
                (error as any).statusText = response.statusText;
                (error as any).isApiUnavailable = response.status >= 500;

                console.log(`[API] Throwing error:`, error);
                console.log(`[API] Error status:`, (error as any).status);
                console.log(
                    `[API] Error isApiUnavailable:`,
                    (error as any).isApiUnavailable
                );

                throw error;
            }

            const contentType = response.headers.get("content-type");
            let responseData;

            if (contentType && contentType.includes("application/json")) {
                responseData = await response.json();
            } else {
                responseData = (await response.text()) as T;
            }

            console.log(`[API] Success response data:`, responseData);

            // Special check for auth endpoints - if we get HTML back, it means auth failed
            if (
                endpoint.includes("/auth/") &&
                typeof responseData === "string" &&
                responseData.includes("<html")
            ) {
                console.log(
                    `[API] Auth endpoint returned HTML page - treating as authentication failure`
                );
                const authError = new Error("Invalid credentials");
                (authError as any).status = 401;
                (authError as any).statusText = "Unauthorized";
                (authError as any).isApiUnavailable = false;
                throw authError;
            }

            return responseData;
        } catch (error) {
            console.log(`[API] Caught error in request:`, error);

            if (error instanceof Error) {
                // Enhanced error information for better error handling
                if (
                    error.name === "TypeError" &&
                    error.message.includes("fetch")
                ) {
                    (error as any).isApiUnavailable = true;
                    error.message = "Network error - unable to connect to API";
                } else if (!error.hasOwnProperty("status")) {
                    // This is likely a network error
                    (error as any).isApiUnavailable = true;
                    if (!error.message.includes("API")) {
                        error.message = `Network error - ${error.message}`;
                    }
                }
                console.log(`[API] Enhanced error:`, error);
                console.log(
                    `[API] Enhanced error status:`,
                    (error as any).status
                );
                console.log(
                    `[API] Enhanced error isApiUnavailable:`,
                    (error as any).isApiUnavailable
                );
                throw error;
            }
            const networkError = new Error("Unknown network error occurred");
            (networkError as any).isApiUnavailable = true;
            console.log(
                `[API] Unknown error, throwing network error:`,
                networkError
            );
            throw networkError;
        }
    }

    // GET request
    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "GET" });
    }

    // POST request
    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // PUT request
    async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // DELETE request
    async delete<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: "DELETE",
            body: data ? JSON.stringify(data) : undefined,
        });
    }
}

// Create API client instance
export const apiClient = new ApiClient(BASE_URL);

// API functions

// Auth API
export const authApi = {
    // Get current session (legacy web-based)
    getSession: (): Promise<UserSession | null> =>
        apiClient.get("/auth/session"),

    // Mobile login - returns JWT token
    mobileLogin: async (credentials: {
        email: string;
        password: string;
    }): Promise<MobileAuthResponse> => {
        const response = await apiClient.post<MobileAuthResponse>(
            "/mobile/auth/login",
            credentials
        );

        // Store token if login successful
        if (response.success && response.token) {
            await tokenManager.setToken(response.token);
            console.log("[AuthAPI] Mobile login successful, token stored");
        }

        return response;
    },

    // Mobile logout - clears JWT token
    mobileLogout: async (): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await apiClient.post<{
                success: boolean;
                message: string;
            }>("/mobile/auth/logout");

            // Always clear local token regardless of API response
            await tokenManager.removeToken();
            console.log("[AuthAPI] Mobile logout completed, token cleared");

            return response;
        } catch (error) {
            // Even if API call fails, clear the local token
            await tokenManager.removeToken();
            console.log(
                "[AuthAPI] Mobile logout failed but token cleared locally"
            );
            throw error;
        }
    },

    // Get user profile with JWT auth
    getMobileProfile: (): Promise<MobileProfileResponse> =>
        apiClient.get("/mobile/user/profile"),

    // Legacy login (for web compatibility)
    login: (credentials: { email: string; password: string }) =>
        apiClient.post("/auth/signin/credentials", credentials),

    // Register
    register: (userData: {
        email: string;
        password: string;
        name: string;
        gender?: string;
        age?: number;
        agreedToDataProcessing: boolean;
    }) => apiClient.post("/auth/register", userData),

    // Alternative register endpoint
    registerAlternative: (userData: {
        email: string;
        password: string;
        name: string;
        gender?: string;
        age?: number;
        referralSource?: string;
        agreedToDataProcessing: boolean;
    }) => apiClient.post("/register", userData),

    // Legacy logout (for web compatibility)
    logout: () => apiClient.post("/auth/signout"),
};

// Books API
export const booksApi = {
    // Get top 20 books
    getTopBooks: (): Promise<Book[]> => apiClient.get("/books"),

    // Get all books with pagination
    getAllBooks: (params?: {
        page?: number;
        sortBy?: string;
        genres?: string;
    }): Promise<{
        books: Book[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalBooks: number;
            booksPerPage: number;
        };
    }> => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
        if (params?.genres) searchParams.append("genres", params.genres);

        return apiClient.get(`/books/all?${searchParams.toString()}`);
    },

    // Get book by ID
    getBookById: (bookId: string): Promise<Book> =>
        apiClient.get(`/book/${bookId}`),

    // Search books
    searchBooks: (query: string): Promise<Book[]> =>
        apiClient.get(`/books/search?query=${encodeURIComponent(query)}`),

    // Get genres
    getGenres: (): Promise<{ id: string; name: string }[]> =>
        apiClient.get("/genres"),
};

// Cart API
export const cartApi = {
    // Get user cart
    getCart: (): Promise<Cart> => apiClient.get("/cart"),

    // Add item to cart
    addToCart: (item: { bookId: string; quantity: number }) =>
        apiClient.post("/cart", item),

    // Update cart item
    updateCartItem: (cartItemId: string, data: { quantity: number }) =>
        apiClient.put(`/cart/${cartItemId}`, data),

    // Remove item from cart
    removeFromCart: (cartItemId: string) =>
        apiClient.delete(`/cart/${cartItemId}`),

    // Clear cart
    clearCart: () => apiClient.delete("/cart"),
};

// Orders API
export const ordersApi = {
    // Get user orders
    getOrders: (): Promise<Order[]> => apiClient.get("/orders"),

    // Get order details
    getOrderDetails: (orderId: string): Promise<Order> =>
        apiClient.get(`/orders/${orderId}`),

    // Process checkout
    checkout: (data: { shippingAddressId: string; paymentMethod: string }) =>
        apiClient.post("/checkout", data),
};

// Favorites types
export interface FavoriteItem {
    id: string;
    userId: string;
    bookId: string;
    addedAt: string;
    book: Book;
}

// Favorites API
export const favoritesApi = {
    // Get user favorites
    getFavorites: (userId: string): Promise<FavoriteItem[]> =>
        apiClient.get(`/favorites/${userId}`),

    // Add to favorites
    addToFavorites: (userId: string, bookId: string) =>
        apiClient.post(`/favorites/${userId}`, { bookId }),

    // Remove from favorites
    removeFromFavorites: (userId: string, bookId: string) =>
        apiClient.delete(`/favorites/${userId}`, { bookId }),
};

// User API
export const userApi = {
    // Get user settings
    getSettings: () => apiClient.get("/user/settings"),

    // Update user settings
    updateSettings: (settings: { language?: string }) =>
        apiClient.put("/user/settings", settings),

    // Get user preferences
    getPreferences: () => apiClient.get("/user/preferences"),

    // Update user preferences
    updatePreferences: (preferences: any) =>
        apiClient.post("/user/preferences", preferences),

    // Update user profile
    updateProfile: (profile: {
        name?: string;
        gender?: string;
        age?: number;
    }) => apiClient.put("/user/update", profile),

    // Get shipping addresses
    getShippingAddresses: (): Promise<ShippingAddress[]> =>
        apiClient.get("/shipping/addresses"),

    // Add shipping address
    addShippingAddress: (address: Omit<ShippingAddress, "id">) =>
        apiClient.post("/shipping/addresses", address),

    // Update shipping address
    updateShippingAddress: (
        addressId: string,
        address: Partial<ShippingAddress>
    ) => apiClient.put(`/shipping/addresses/${addressId}`, address),

    // Delete shipping address
    deleteShippingAddress: (addressId: string) =>
        apiClient.delete(`/shipping/addresses/${addressId}`),
};

// Recommendations API
export const recommendationsApi = {
    // Get book recommendations
    getRecommendations: (): Promise<{ books: Book[] }> =>
        apiClient.get("/recommendations"),
};
