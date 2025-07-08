const BASE_URL = "https://book.stvr.cz/api";

// API Response types
export interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    errorCode?: string;
}

// Book types
export interface Book {
    id: string;
    title: string;
    authors: { name: string }[];
    genres: { name: string; id?: string }[];
    imageURL: string;
    price: number;
    stockQuantity: number;
    year?: number;
    pagecount?: number;
    criticRating?: number;
    bookStockRating?: number;
    combinedRating?: number;
    combinedRatingCount?: number;
    bookStockRatingCount?: number;
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

        const config: RequestInit = {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            credentials: "include", // Important for session cookies
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.text();
                let errorMessage = "An error occurred";

                try {
                    const parsedError = JSON.parse(errorData);
                    errorMessage = parsedError.error || errorMessage;
                } catch {
                    errorMessage = errorData || `HTTP ${response.status}`;
                }

                throw new Error(errorMessage);
            }

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return response.json();
            }

            return response.text() as T;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Network error occurred");
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
    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "DELETE" });
    }
}

// Create API client instance
export const apiClient = new ApiClient(BASE_URL);

// API functions

// Auth API
export const authApi = {
    // Get current session
    getSession: (): Promise<UserSession | null> =>
        apiClient.get("/auth/session"),

    // Login
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

    // Logout
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

// Favorites API
export const favoritesApi = {
    // Get user favorites
    getFavorites: (userId: string): Promise<Book[]> =>
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
