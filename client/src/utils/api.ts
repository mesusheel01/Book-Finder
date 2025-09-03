import type {
  RegisterInput,
  LoginInput,
  AuthResponse,
  Book
} from '../types/auth';
import { authResponseSchema } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const handleResponse = async <T>(response: Response, schema?: unknown): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || 'Request failed');
  }

  const data = await response.json();
  
  if (schema) {
    try {
      return (schema as { parse: (data: unknown) => T }).parse(data);
    } catch {
      throw new Error('Invalid response format');
    }
  }

  return data;
};

export const authApi = {
  // Register new user
  async register(userData: RegisterInput): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    return handleResponse<AuthResponse>(response, authResponseSchema);
  },

  // Login user
  async login(credentials: LoginInput): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    return handleResponse<AuthResponse>(response, authResponseSchema);
  },
};

export const booksApi = {
  // Get random books for landing page
  async getRandomBooks(): Promise<Book[]> {
    const response = await fetch(`${API_BASE_URL}/books/show`);
    const data = await handleResponse<{ books: Book[] }>(response);
    return data.books;
  },
};
