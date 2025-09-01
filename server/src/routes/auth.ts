import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { validateBody } from '../middleware/validation';
import { 
  registerSchema, 
  loginSchema, 
  RegisterInput,
  LoginInput,
  AuthResponse,
  UserResponse
} from '../types/auth';
import { User, IUser } from '../models/User';

const router = Router();

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Helper function to create user response
const createUserResponse = (user: IUser): UserResponse => ({
  id: (user._id as any).toString(),
  username: user.username,
  email: user.email,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

// Register new user
router.post('/signup', validateBody(registerSchema), async (req, res) => {
  try {
    const { username, password, email }: RegisterInput = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
        errors: [
          {
            field: existingUser.username === username ? 'username' : 'email',
            message: `${existingUser.username === username ? 'Username' : 'Email'} already exists`
          }
        ]
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password, // Password will be hashed by the pre-save middleware
    });

    await user.save();

    // Generate JWT token
    const token = generateToken((user._id as any).toString());

    const response: AuthResponse = {
      user: createUserResponse(user),
      token,
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { username, password }: LoginInput = req.body;
    
    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username },
        { email: username.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
        errors: [
          {
            field: 'username',
            message: 'Username or password is incorrect'
          }
        ]
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
        errors: [
          {
            field: 'password',
            message: 'Username or password is incorrect'
          }
        ]
      });
    }

    // Generate JWT token
    const token = generateToken((user._id as any).toString());

    const response: AuthResponse = {
      user: createUserResponse(user),
      token,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
