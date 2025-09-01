# Book Finder - Authentication Types

This project uses Zod for runtime type validation and TypeScript for compile-time type checking. The authentication system includes validation schemas for user registration and login.

## Folder Structure

```
Book-Finder/
├── client/
│   ├── src/
│   │   ├── types/
│   │   │   ├── auth.ts          # Zod schemas and TypeScript types
│   │   │   └── index.ts         # Type exports
│   │   ├── components/
│   │   │   └── AuthForm.tsx     # Example React component using Zod validation
│   │   └── utils/
│   │       └── api.ts           # Type-safe API utilities
│   └── package.json
└── server/
    ├── src/
    │   ├── types/
    │   │   ├── auth.ts          # Zod schemas and TypeScript types
    │   │   └── index.ts         # Type exports
    │   ├── middleware/
    │   │   └── validation.ts    # Express validation middleware
    │   └── routes/
    │       └── auth.ts          # Example auth routes using Zod validation
    └── package.json
```

## Zod Schemas

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
  email: z.string().email("Invalid email address"),
});
```

### User Login

```typescript
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
```

## Usage Examples

### Frontend Form Validation

```typescript
import { registerSchema, RegisterInput } from "../types/auth";

const handleSubmit = (formData: Partial<RegisterInput>) => {
  try {
    const validatedData = registerSchema.parse(formData);
    // Data is now type-safe and validated
    await api.register(validatedData);
  } catch (error) {
    // Handle validation errors
    console.error("Validation failed:", error.errors);
  }
};
```

### Backend Route Validation

```typescript
import { validateBody } from "../middleware/validation";
import { registerSchema } from "../types/auth";

router.post("/register", validateBody(registerSchema), async (req, res) => {
  // req.body is now type-safe and validated
  const { username, password, email } = req.body;
  // ... implementation
});
```

### API Response Validation

```typescript
import { authResponseSchema, AuthResponse } from "../types/auth";

const response = await fetch("/api/auth/login", {
  method: "POST",
  body: JSON.stringify(credentials),
});

const data = await response.json();
const validatedData = authResponseSchema.parse(data);
// data is now type-safe and validated
```

## Type Exports

The following TypeScript types are automatically generated from Zod schemas:

- `RegisterInput` - Type for user registration data
- `LoginInput` - Type for user login data
- `UserResponse` - Type for user data in responses
- `AuthResponse` - Type for authentication responses
- `ErrorResponse` - Type for error responses

## Validation Features

1. **Runtime Validation**: All data is validated at runtime using Zod schemas
2. **Type Safety**: TypeScript types are automatically inferred from Zod schemas
3. **Error Handling**: Comprehensive error messages for validation failures
4. **Consistent Validation**: Same validation rules applied on both frontend and backend
5. **Extensible**: Easy to add new validation rules or modify existing ones

## Security Features

- **Strong Password Requirements**: Minimum 8 characters with lowercase, uppercase, and number
- **Username Restrictions**: Alphanumeric and underscores only, 3-20 characters
- **Email Validation**: Using Zod's built-in email validator

## Next Steps

1. Implement the actual authentication logic in the backend routes
2. Add JWT token generation and verification
3. Set up database models and connections
4. Add password hashing with bcrypt
5. Set up CORS configuration
6. Add environment variables for sensitive data
