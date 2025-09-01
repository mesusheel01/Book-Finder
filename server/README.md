# Book Finder Server

This is the backend server for the Book Finder application with user authentication.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Server Configuration
PORT=3001

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/book-finder

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Environment
NODE_ENV=development
```

### 3. Database Setup

Make sure MongoDB is running locally or update the `MONGODB_URI` to point to your MongoDB instance.

### 4. Start Development Server

```bash
npm run dev
```

## API Endpoints

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

**Response:**

```json
{
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
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

**Response:**

```json
{
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

## Database Schema

### User Model

```typescript
{
  username: string,     // Unique, 3-20 chars, alphanumeric + underscore
  email: string,        // Unique, valid email format
  password: string,     // Hashed, min 8 chars, lowercase + uppercase + number
  createdAt: Date,      // Auto-generated timestamp
  updatedAt: Date       // Auto-generated timestamp
}
```

## Features

- ✅ User registration with validation
- ✅ User login with password verification
- ✅ JWT token generation
- ✅ Password hashing with bcrypt
- ✅ MongoDB integration with Mongoose
- ✅ Input validation with Zod
- ✅ Error handling and validation error responses
- ✅ CORS enabled for frontend integration

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 12
- **JWT Tokens**: Secure token-based authentication with 7-day expiration
- **Input Validation**: Comprehensive validation using Zod schemas
- **Database Validation**: Mongoose schema validation matching Zod rules
- **Error Handling**: Secure error responses without exposing sensitive information

## Development

### Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### File Structure

```
server/
├── src/
│   ├── db/
│   │   └── index.ts          # Database connection
│   ├── models/
│   │   ├── User.ts           # User model and schema
│   │   └── index.ts          # Model exports
│   ├── routes/
│   │   └── auth.ts           # Authentication routes
│   ├── middleware/
│   │   └── validation.ts     # Zod validation middleware
│   ├── types/
│   │   ├── auth.ts           # Zod schemas and types
│   │   └── index.ts          # Type exports
│   └── index.ts              # Main server file
├── package.json
└── tsconfig.json
```
