# Book Finder API - Book Routes

## Available Endpoints

### 1. GET `/api/books/show` - Random Books for Landing Page

Returns 10 random popular books for display on the landing page.

**Response:**

```json
{
  "books": [
    {
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "year": "1925",
      "cover": "https://covers.openlibrary.org/b/id/123456-M.jpg",
      "id": "/works/OL123456W"
    }
  ],
  "message": "Random books for landing page"
}
```

### 2. GET `/api/books/search?q=<query>` - Search Books

Search for books using the Open Library API.

**Parameters:**

- `q` (required): Search query string

**Response:**

```json
{
  "books": [
    {
      "id": "/works/OL123456W",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "year": "1925",
      "cover": "https://covers.openlibrary.org/b/id/123456-M.jpg"
    }
  ],
  "total": 150,
  "query": "gatsby",
  "message": "Found 20 books for \"gatsby\""
}
```

### 3. Favorite Books (Require Authentication)

#### GET `/api/books/favorites` - Get User's Favorite Books

Returns all books favorited by the authenticated user.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "books": [
    {
      "id": "book_mongo_id",
      "userId": "user_mongo_id",
      "bookId": "/works/OL123456W",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "year": "1925",
      "cover": "https://covers.openlibrary.org/b/id/123456-M.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Found 5 favorite books"
}
```

#### POST `/api/books/favorites` - Add Book to Favorites

Add a book to the user's favorites.

**Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "bookId": "/works/OL123456W",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "year": "1925",
  "cover": "https://covers.openlibrary.org/b/id/123456-M.jpg"
}
```

**Response:**

```json
{
  "book": {
    "id": "book_mongo_id",
    "userId": "user_mongo_id",
    "bookId": "/works/OL123456W",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "year": "1925",
    "cover": "https://covers.openlibrary.org/b/id/123456-M.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Book added to favorites successfully"
}
```

#### DELETE `/api/books/favorites/:bookId` - Remove Book from Favorites

Remove a book from the user's favorites.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Parameters:**

- `bookId` (required): Open Library book ID

**Response:**

```json
{
  "message": "Book removed from favorites successfully",
  "removedBook": {
    "id": "book_mongo_id",
    "bookId": "/works/OL123456W",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald"
  }
}
```

#### GET `/api/books/favorites/check/:bookId` - Check if Book is Favorited

Check if a specific book is in the user's favorites.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Parameters:**

- `bookId` (required): Open Library book ID

**Response:**

```json
{
  "isFavorited": true,
  "book": {
    "id": "book_mongo_id",
    "bookId": "/works/OL123456W",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald"
  }
}
```

## Usage Examples

### Frontend - Fetch Random Books

```javascript
const response = await fetch("/api/books/show");
const data = await response.json();
console.log(data.books); // Array of 10 random books
```

### Frontend - Search Books

```javascript
const query = "harry potter";
const response = await fetch(
  `/api/books/search?q=${encodeURIComponent(query)}`
);
const data = await response.json();
console.log(data.books); // Array of search results
```

### Frontend - Get Favorite Books

```javascript
const token = "your-jwt-token";
const response = await fetch("/api/books/favorites", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const data = await response.json();
console.log(data.books); // Array of favorite books
```

### Frontend - Add Book to Favorites

```javascript
const token = "your-jwt-token";
const bookData = {
  bookId: "/works/OL123456W",
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  year: "1925",
  cover: "https://covers.openlibrary.org/b/id/123456-M.jpg",
};

const response = await fetch("/api/books/favorites", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(bookData),
});
const data = await response.json();
console.log(data.book); // Added book details
```

### Frontend - Remove Book from Favorites

```javascript
const token = "your-jwt-token";
const bookId = "/works/OL123456W";

const response = await fetch(
  `/api/books/favorites/${encodeURIComponent(bookId)}`,
  {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
const data = await response.json();
console.log(data.message); // "Book removed from favorites successfully"
```

### Frontend - Check if Book is Favorited

```javascript
const token = "your-jwt-token";
const bookId = "/works/OL123456W";

const response = await fetch(
  `/api/books/favorites/check/${encodeURIComponent(bookId)}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
const data = await response.json();
console.log(data.isFavorited); // true or false
```

## Database Schema

### Book Model

```typescript
{
  userId: string,        // Reference to user who favorited the book
  bookId: string,        // Open Library book ID (unique per user)
  title: string,         // Book title
  author: string,        // Book author
  year?: string,         // Publication year (optional)
  cover?: string,        // Cover image URL (optional)
  createdAt: Date,       // Auto-generated timestamp
  updatedAt: Date        // Auto-generated timestamp
}
```

## Features

- ✅ Random book selection for landing page
- ✅ Book search using Open Library API
- ✅ Cover image URLs
- ✅ User favorite books management
- ✅ Duplicate prevention (user can't favorite same book twice)
- ✅ Authentication required for favorites
- ✅ Error handling and validation
- ✅ CORS enabled for frontend integration
