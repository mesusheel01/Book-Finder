# Book Finder - Full Stack Application

A complete book discovery application with user authentication, book search, and personalized recommendations. Built with React (frontend) and Node.js/Express (backend) with MongoDB database.

## 🚀 Features

- ✅ **User Authentication**: Register, login, and JWT-based session management
- ✅ **Book Search**: Search books using Open Library API
- ✅ **Random Book Recommendations**: Get 10 random popular books for landing page
- ✅ **Type Safety**: Full TypeScript support with Zod validation
- ✅ **Database Integration**: MongoDB with Mongoose ODM
- ✅ **Security**: Password hashing, JWT tokens, input validation
- ✅ **API Documentation**: Comprehensive API documentation

## 📁 Project Structure

```
Book-Finder/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── types/
│   │   │   ├── auth.ts              # Zod schemas and TypeScript types
│   │   │   └── index.ts             # Type exports
│   │   ├── components/
│   │   │   └── AuthForm.tsx         # React component with Zod validation
│   │   └── utils/
│   │       └── api.ts               # Type-safe API utilities
│   └── package.json
└── server/                          # Node.js Backend
    ├── src/
    │   ├── db/
    │   │   └── index.ts             # MongoDB connection
    │   ├── models/
    │   │   ├── User.ts              # User model with password hashing
    │   │   └── index.ts             # Model exports
    │   ├── middleware/
    │   │   ├── auth.ts              # JWT authentication middleware
    │   │   ├── validation.ts        # Zod validation middleware
    │   │   └── index.ts             # Middleware exports
    │   ├── routes/
    │   │   ├── auth.ts              # Authentication routes
    │   │   ├── books.ts             # Book search and recommendations
    │   │   └── index.ts             # Route exports
    │   ├── types/
    │   │   ├── auth.ts              # Zod schemas and TypeScript types
    │   │   └── index.ts             # Type exports
    │   └── index.ts                 # Main server file
    ├── package.json
    ├── README.md                    # Server setup documentation
    └── BOOK_ROUTES.md               # Book API documentation
```

## 🔧 Backend Setup

### Prerequisites

- Node.js (v16+)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Install Dependencies**

   ```bash
   cd server
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the server directory:

   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/book-finder

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Client URL (for CORS)
   CLIENT_URL=http://localhost:5173
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Authentication

#### POST `/api/auth/register`

Register a new user.

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### POST `/api/auth/login`

Login with existing credentials.

**Request Body:**

```json
{
  "username": "john_doe",
  "password": "SecurePass123"
}
```

### Books

#### GET `/api/books/show`

Get 10 random popular books for landing page.

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

#### GET `/api/books/search?q=<query>`

Search books using Open Library API.

**Parameters:**

- `q` (required): Search query string

**Response:**

```json
{
  "books": [...],
  "total": 150,
  "query": "harry potter",
  "message": "Found 20 books for \"harry potter\""
}
```

### Protected Routes (Require Authentication)

#### GET `/api/books/books`

Get user's books or public books.

#### POST `/api/books/books`

Create a new book.

#### PUT `/api/books/books/:id`

Update an existing book.

#### DELETE `/api/books/books/:id`

Delete a book.

## 🔐 Security Features

### Authentication

- **JWT Tokens**: Secure token-based authentication with 7-day expiration
- **Password Hashing**: bcrypt with 12 salt rounds
- **Token Validation**: Middleware for protected routes
- **Optional Authentication**: Routes that work with or without tokens

### Input Validation

- **Zod Schemas**: Runtime validation for all inputs
- **Type Safety**: TypeScript types inferred from Zod schemas
- **Error Handling**: Comprehensive validation error messages
- **Database Validation**: Mongoose schema validation matching Zod rules

### Data Protection

- **Password Security**: Strong password requirements (8+ chars, lowercase + uppercase + number)
- **Username Restrictions**: Alphanumeric and underscores only, 3-20 characters
- **Email Validation**: Proper email format validation
- **CORS Configuration**: Secure cross-origin requests

## 🛠️ Database Schema

### User Model

```typescript
{
  username: string,     // Unique, 3-20 chars, alphanumeric + underscore
  email: string,        // Unique, valid email format
  password: string,      // Hashed, min 8 chars, lowercase + uppercase + number
  createdAt: Date,      // Auto-generated timestamp
  updatedAt: Date       // Auto-generated timestamp
}
```

## 📖 Zod Schemas

### User Registration

```typescript
const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  email: z
    .string()
    .min(1, "Email is required")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),
});
```

### User Login

```typescript
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
```

## 🚀 Usage Examples

### Frontend - Authentication

```typescript
import { authApi } from "../utils/api";

// Register
const registerData = {
  username: "john_doe",
  email: "john@example.com",
  password: "SecurePass123",
};
const authResponse = await authApi.register(registerData);

// Login
const loginData = {
  username: "john_doe",
  password: "SecurePass123",
};
const authResponse = await authApi.login(loginData);
```

### Frontend - Book Search

```typescript
// Get random books for landing page
const response = await fetch("/api/books/show");
const data = await response.json();
console.log(data.books); // Array of 10 random books

// Search books
const query = "harry potter";
const searchResponse = await fetch(
  `/api/books/search?q=${encodeURIComponent(query)}`
);
const searchData = await searchResponse.json();
console.log(searchData.books); // Array of search results
```

### Frontend - Protected Routes

```typescript
const token = "your-jwt-token";
const response = await fetch("/api/books/books", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

## 📋 Available Scripts

### Backend

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Frontend

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔧 Development

### Backend Features

- ✅ User registration with validation
- ✅ User login with password verification
- ✅ JWT token generation and validation
- ✅ Password hashing with bcrypt
- ✅ MongoDB integration with Mongoose
- ✅ Input validation with Zod
- ✅ Error handling and validation error responses
- ✅ CORS enabled for frontend integration
- ✅ Book search using Open Library API
- ✅ Random book recommendations
- ✅ Protected routes with authentication middleware

### Frontend Features

- ✅ Type-safe API calls with Zod validation
- ✅ Form validation with real-time error display
- ✅ Authentication state management
- ✅ Responsive design with modern UI
- ✅ Error handling and user feedback

## 📄 Documentation

- [Server Setup](./server/README.md) - Detailed server setup instructions
- [Book API Routes](./server/BOOK_ROUTES.md) - Complete book API documentation
- [Authentication Types](./client/src/types/auth.ts) - Zod schemas and TypeScript types

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.
