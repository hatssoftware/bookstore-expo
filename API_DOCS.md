# Book Store API Documentation

**Base URL:** `https://book.stvr.cz/api`

This documentation covers all available API endpoints for building React Native applications with the book store backend.

## Table of Contents

1. [Authentication](#authentication)
2. [Books & Search](#books--search)
3. [Cart Management](#cart-management)
4. [User Management](#user-management)
5. [Orders & Checkout](#orders--checkout)
6. [Reviews & Ratings](#reviews--ratings)
7. [Favorites](#favorites)
8. [Recommendations](#recommendations)
9. [System Endpoints](#system-endpoints)

## Authentication

### Register User

```http
POST /auth/register
```

**Request Body:**

```json
{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "gender": "male", // optional
    "age": 25, // optional
    "agreedToDataProcessing": true
}
```

**Response:**

```json
{
    "message": "Registration successful",
    "user": {
        "id": "user_id",
        "email": "user@example.com",
        "name": "John Doe",
        "gender": "male",
        "age": 25
    }
}
```

### Alternative Registration Endpoint

```http
POST /register
```

**Request Body:**

```json
{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "gender": "male",
    "age": 25,
    "referralSource": "google",
    "agreedToDataProcessing": true
}
```

**Response:**

```json
{
    "message": "User created successfully",
    "userId": "user_id"
}
```

### Login (Credential-based)

```http
POST /auth/signin/credentials
```

**Request Body:**

```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

Login with email and password. Returns session cookies for authenticated requests.

**Response:**

-   **Success:** Redirects to callback URL with session established
-   **Error:** Returns error message for invalid credentials

### Get Current Session

```http
GET /auth/session
```

Returns the current user session information if authenticated.

**Response:**

```json
{
    "user": {
        "id": "user_id",
        "email": "user@example.com",
        "name": "John Doe",
        "age": 25,
        "gender": "male"
    },
    "expires": "2023-12-31T23:59:59Z"
}
```

Returns `null` if not authenticated.

### Logout

```http
POST /auth/signout
```

Ends the current user session and clears authentication cookies.

**Response:**

-   Redirects to sign-in page or specified callback URL

### OAuth Authentication

The API supports OAuth through NextAuth with GitHub and Discord providers:

-   **GitHub:** `GET /auth/signin/github`
-   **Discord:** `GET /auth/signin/discord`
-   **Session:** `GET /auth/session`
-   **Sign Out:** `POST /auth/signout`

---

## Books & Search

### Get Top 20 Books

```http
GET /books
```

Returns top 20 books with at least 100 reviews, sorted by rating.

**Response:**

```json
[
    {
        "id": "book_id",
        "title": "Book Title",
        "combinedRating": 4.5,
        "combinedRatingCount": 150,
        "bookStockRating": 4.3,
        "bookStockRatingCount": 200
    }
]
```

### Get All Books (Paginated)

```http
GET /books/all?page=1&sortBy=title-asc&genres=genre1,genre2
```

**Query Parameters:**

-   `page` (optional): Page number (default: 1)
-   `sortBy` (optional): `title-asc`, `title-desc`, `rating-asc`, `rating-desc`
-   `genres` (optional): Comma-separated genre IDs

**Response:**

```json
{
    "books": [
        {
            "id": "book_id",
            "title": "Book Title",
            "authors": [{ "name": "Author Name" }],
            "genres": [{ "name": "Fiction" }],
            "imageURL": "https://...",
            "price": 299.99,
            "stockQuantity": 10
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 50,
        "totalBooks": 2000,
        "booksPerPage": 40
    }
}
```

### Get Book by ID

```http
GET /book/{bookId}
```

**Response:**

```json
{
    "id": "book_id",
    "title": "Book Title",
    "authors": [{ "name": "Author Name" }],
    "genres": [{ "name": "Fiction" }],
    "imageURL": "https://...",
    "price": 299.99,
    "stockQuantity": 10,
    "year": 2023,
    "pagecount": 350,
    "criticRating": 4.5,
    "bookStockRating": 4.3
}
```

### Search Books

```http
GET /books/search?query=harry+potter
```

**Query Parameters:**

-   `query`: Search term (minimum 2 characters)

**Response:**

```json
[
    {
        "id": "book_id",
        "title": "Harry Potter and the...",
        "imageURL": "https://..."
    }
]
```

### Search by Name

```http
GET /books/name/{bookName}
```

Returns books matching the name (partial matching).

### Search by Author

```http
GET /books/author/{authorName}
```

Returns books by the specified author (partial matching).

### Search by Genre

```http
GET /books/genre/{genreName}
```

Returns books in the specified genre (partial matching).

### Get All Genres

```http
GET /genres
```

**Response:**

```json
[
    {
        "id": "genre_id",
        "name": "Fiction"
    }
]
```

### Search Authors

```http
GET /authors/search?query=stephen+king
```

**Query Parameters:**

-   `query`: Author name search term (minimum 2 characters)

**Response:**

```json
[
    {
        "id": "author_id",
        "name": "Stephen King"
    }
]
```

---

## Cart Management

### Get User Cart

```http
GET /cart
```

**Requires Authentication**

**Response:**

```json
{
    "id": "cart_id",
    "userId": "user_id",
    "status": "active",
    "items": [
        {
            "id": "item_id",
            "quantity": 2,
            "addedAt": "2023-01-01T00:00:00Z",
            "book": {
                "id": "book_id",
                "title": "Book Title",
                "price": 299.99,
                "imageURL": "https://..."
            }
        }
    ],
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
}
```

### Add Item to Cart

```http
POST /cart
```

**Requires Authentication**

**Request Body:**

```json
{
    "bookId": "book_id",
    "quantity": 1
}
```

### Clear Cart

```http
DELETE /cart
```

**Requires Authentication**

### Update Cart Item

```http
PUT /cart/{cartItemId}
```

**Requires Authentication**

**Request Body:**

```json
{
    "quantity": 3
}
```

Updates the quantity of a specific cart item. Setting quantity to 0 removes the item.

### Remove Item from Cart

```http
DELETE /cart/{cartItemId}
```

**Requires Authentication**

Removes a specific item from the cart completely.

### Guest Cart Operations

#### Validate Book for Guest Cart

```http
POST /guest-cart/validate
```

**Request Body:**

```json
{
    "bookId": "book_id",
    "quantity": 1
}
```

**Response:**

```json
{
    "valid": true,
    "book": {
        "id": "book_id",
        "title": "Book Title",
        "price": 299.99
    }
}
```

#### Get Guest Cart with Details

```http
POST /guest-cart
```

**Request Body:**

```json
{
    "cart": {
        "id": "guest_cart_id",
        "items": [
            {
                "bookId": "book_id",
                "quantity": 1,
                "addedAt": "2023-01-01T00:00:00Z"
            }
        ],
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-01T00:00:00Z"
    }
}
```

---

## User Management

### Get User Settings

```http
GET /user/settings
```

**Requires Authentication**

### Update User Settings

```http
PUT /user/settings
```

**Requires Authentication**

**Request Body:**

```json
{
    "language": "en"
}
```

### Get User Preferences

```http
GET /user/preferences
```

**Requires Authentication**

**Response:**

```json
{
    "preferences": {
        "favoriteBookTitles": ["Book 1", "Book 2"],
        "preferredGenreIds": ["genre1", "genre2"],
        "favoriteAuthorNames": ["Author 1"],
        "readingGoal": 50,
        "eraPreference": "modern",
        "fictionPreference": "fiction",
        "dislikedGenreId": "genre3"
    }
}
```

### Update User Preferences

```http
POST /user/preferences
```

**Requires Authentication**

**Request Body:**

```json
{
    "favoriteBookTitles": ["Book 1", "Book 2"],
    "preferredGenreIds": ["genre1", "genre2"],
    "favoriteAuthorNames": ["Author 1"],
    "readingGoal": 50,
    "eraPreference": "modern",
    "fictionPreference": "fiction",
    "dislikedGenreId": "genre3"
}
```

### Update User Profile

```http
PUT /user/update
```

**Requires Authentication**

**Request Body:**

```json
{
    "name": "John Doe",
    "gender": "male",
    "age": 30
}
```

**Response:**

```json
{
    "message": "Profile updated successfully",
    "user": {
        "name": "John Doe",
        "email": "john@example.com",
        "gender": "male",
        "age": 30
    }
}
```

### Change Password

```http
POST /user/change-password
```

**Requires Authentication**

**Request Body:**

```json
{
    "currentPassword": "old_password",
    "newPassword": "new_password"
}
```

### Get Shipping Addresses

```http
GET /shipping/addresses
```

**Requires Authentication**

**Response:**

```json
[
    {
        "id": "address_id",
        "firstName": "John",
        "lastName": "Doe",
        "company": "Company Name",
        "country": "Czech Republic",
        "state": "Prague",
        "city": "Prague",
        "street": "Main Street 123",
        "postalCode": "12345",
        "phoneNumber": "+420123456789",
        "isDefault": true
    }
]
```

### Add Shipping Address

```http
POST /shipping/addresses
```

**Requires Authentication**

**Request Body:**

```json
{
    "firstName": "John",
    "lastName": "Doe",
    "company": "Company Name",
    "country": "Czech Republic",
    "state": "Prague",
    "city": "Prague",
    "street": "Main Street 123",
    "postalCode": "12345",
    "phoneNumber": "+420123456789",
    "isDefault": false
}
```

### Update Shipping Address

```http
PUT /shipping/addresses/{addressId}
```

**Requires Authentication**

**Request Body:**

```json
{
    "firstName": "John",
    "lastName": "Doe Updated",
    "company": "New Company",
    "isDefault": true
}
```

Updates an existing shipping address. Only provided fields will be updated.

### Delete Shipping Address

```http
DELETE /shipping/addresses/{addressId}
```

**Requires Authentication**

**Response:**

```json
{
    "success": true
}
```

Deletes a shipping address if it's not being used by active orders.

---

## Orders & Checkout

### Process Checkout (Authenticated Users)

```http
POST /checkout
```

**Requires Authentication**

**Request Body:**

```json
{
    "shippingAddressId": "address_id",
    "paymentMethod": "stripe"
}
```

**Response:**

```json
{
    "success": true,
    "order": {
        "id": "order_id",
        "orderNumber": "ORD-2023-001",
        "date": "2023-01-01T00:00:00Z",
        "status": "pending",
        "totalPrice": 599.98
    }
}
```

### Process Guest Checkout

```http
POST /guest-checkout
```

**Request Body:**

```json
{
    "guestCart": {
        "id": "guest_cart_id",
        "items": [
            {
                "bookId": "book_id",
                "quantity": 1,
                "addedAt": "2023-01-01T00:00:00Z"
            }
        ]
    },
    "customerInfo": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+420123456789",
        "age": 25,
        "gender": "male"
    },
    "shippingAddress": {
        "firstName": "John",
        "lastName": "Doe",
        "country": "Czech Republic",
        "city": "Prague",
        "street": "Main Street 123",
        "postalCode": "12345"
    },
    "billingAddress": {
        // Same structure as shippingAddress, optional
    },
    "paymentMethod": "dobírka", // dobírka, bankTransfer, onlineCard
    "agreedToDataProcessing": true,
    "useBillingAsShipping": false
}
```

### Get User Orders

```http
GET /orders
```

**Requires Authentication**

**Response:**

```json
[
    {
        "id": "order_id",
        "orderNumber": "ORD-2023-001",
        "date": "2023-01-01T00:00:00Z",
        "status": "completed",
        "totalPrice": 599.98
    }
]
```

### Get Order Details

```http
GET /orders/{orderId}
```

**Requires Authentication**

**Response:**

```json
{
    "id": "order_id",
    "orderNumber": "ORD-2023-001",
    "date": "2023-01-01T00:00:00Z",
    "status": "completed",
    "totalPrice": 599.98,
    "shippingAddress": {
        "firstName": "John",
        "lastName": "Doe",
        "street": "Main Street 123",
        "city": "Prague"
    },
    "orderItems": [
        {
            "id": "item_id",
            "quantity": 1,
            "price": 299.99,
            "book": {
                "id": "book_id",
                "title": "Book Title",
                "imageURL": "https://..."
            }
        }
    ]
}
```

### Get Order History

```http
GET /orders/history
```

**Requires Authentication**

### Payment Methods

```http
GET /payment
```

**Response:**

```json
[
    {
        "id": "stripe",
        "name": "Credit Card",
        "description": "Pay with credit card",
        "requiresDetails": true
    }
]
```

### Process Payment

```http
POST /payment
```

**Requires Authentication**

**Request Body:**

```json
{
    "orderId": "order_id",
    "paymentMethodId": "stripe",
    "paymentDetails": {
        // Payment method specific details
    }
}
```

### Get Payment Status

```http
GET /payment/{orderId}/status
```

**Requires Authentication**

**Response:**

```json
{
    "orderId": "order_id",
    "status": "PAID"
}
```

**Status Values:**

-   `PENDING` - Payment is pending
-   `PAID` - Payment completed successfully
-   `FAILED` - Payment failed

---

## Reviews & Ratings

### Rate a Book

```http
POST /rating/{bookId}
```

**Requires Authentication**

**Request Body:**

```json
{
    "rating": 5
}
```

**Response:**

```json
{
    "id": "rating_id",
    "bookId": "book_id",
    "userId": "user_id",
    "rating": 5,
    "createdAt": "2023-01-01T00:00:00Z"
}
```

### Get User's Rating for a Book

```http
GET /rating/{bookId}
```

**Requires Authentication**

### Create Comment

```http
POST /comment
```

**Requires Authentication**

**Request Body:**

```json
{
    "bookId": "book_id",
    "text": "Great book! Highly recommended."
}
```

**Response:**

```json
{
    "id": "comment_id",
    "text": "Great book! Highly recommended.",
    "bookId": "book_id",
    "userId": "user_id",
    "createdAt": "2023-01-01T00:00:00Z"
}
```

### Delete Comment

```http
DELETE /comment
```

**Requires Authentication**

**Request Body:**

```json
{
    "commentId": "comment_id"
}
```

---

## Favorites

### Get User's Favorite Books

```http
GET /favorites/{userId}
```

**Requires Authentication**

**Response:**

```json
[
    {
        "id": "book_id",
        "title": "Book Title",
        "authors": [{ "name": "Author Name" }],
        "imageURL": "https://..."
    }
]
```

### Add Book to Favorites

```http
POST /favorites/{userId}
```

**Requires Authentication**

**Request Body:**

```json
{
    "bookId": "book_id"
}
```

### Remove Book from Favorites

```http
DELETE /favorites/{userId}
```

**Requires Authentication**

**Request Body:**

```json
{
    "bookId": "book_id"
}
```

---

## Recommendations

### Get Book Recommendations

```http
GET /recommendations
```

**Requires Authentication**

Returns personalized book recommendations based on user preferences.

**Response:**

```json
{
    "books": [
        {
            "id": "book_id",
            "title": "Recommended Book",
            "imageURL": "https://...",
            "authors": [{ "name": "Author Name" }],
            "genres": [{ "name": "Fiction" }],
            "year": 2023,
            "criticRating": 4.5
        }
    ]
}
```

---

## System Endpoints

### Health Check

```http
GET /health
```

**Response:**

```json
{
    "status": "healthy",
    "timestamp": "2023-01-01T00:00:00Z",
    "uptime": 12345,
    "environment": "production",
    "memory": {
        "rss": 123456,
        "heapTotal": 123456,
        "heapUsed": 123456,
        "external": 123456
    }
}
```

### API Documentation

```http
GET /docs
```

Returns the OpenAPI/Swagger specification for the API.

---

## Error Handling

All endpoints return standardized error responses:

```json
{
    "error": "Error message",
    "errorCode": "ERROR_CODE" // optional
}
```

### Common HTTP Status Codes

-   `200` - Success
-   `400` - Bad Request (validation errors, missing fields)
-   `401` - Unauthorized (authentication required)
-   `403` - Forbidden (insufficient permissions)
-   `404` - Not Found
-   `500` - Internal Server Error

### Common Error Codes

-   `MISSING_FIELDS` - Required fields are missing
-   `INVALID_JSON` - Invalid JSON in request body
-   `INSUFFICIENT_STOCK` - Not enough items in stock
-   `ITEM_NOT_FOUND` - Requested item not found
-   `EMPTY_CART` - Cart is empty
-   `CHECKOUT_FAILED` - Checkout process failed

---

## Authentication Notes

Most endpoints require authentication via session cookies. For React Native apps, you'll need to:

1. Implement OAuth flow or credential-based login
2. Store and manage session cookies
3. Include authentication headers in requests
4. Handle authentication errors (401/403 responses)

## Rate Limiting

The API may implement rate limiting. Monitor response headers for rate limit information and implement appropriate retry logic in your React Native app.

---

For additional support or questions about specific endpoints, please refer to the OpenAPI specification available at `/api/docs`.
