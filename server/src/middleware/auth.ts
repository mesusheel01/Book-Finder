import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Access denied. No token provided.',
        errors: [
          {
            field: 'authorization',
            message: 'Bearer token is required'
          }
        ]
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Find user by ID
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        message: 'Invalid token. User not found.',
        errors: [
          {
            field: 'token',
            message: 'User associated with this token no longer exists'
          }
        ]
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token.',
        errors: [
          {
            field: 'token',
            message: 'Token is invalid or expired'
          }
        ]
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired.',
        errors: [
          {
            field: 'token',
            message: 'Token has expired'
          }
        ]
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      message: 'Internal server error during authentication'
    });
  }
};

