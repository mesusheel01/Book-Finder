# Book Finder

A full-stack book discovery application built with React (frontend) and Node.js/Express (backend) using MongoDB.

## Features Implemented

- User authentication (register, login) with JWT tokens
- Book search via Open Library API
- Random book recommendations (10 books for landing page)
- TypeScript with Zod validation
- MongoDB database with Mongoose
- Password hashing with bcrypt
- Protected routes with authentication middleware
- Responsive UI with Tailwind CSS

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt
- **Validation**: Zod
- **API**: Open Library API

## Setup

1. **Backend**:

   - `cd server && npm install`
   - Create `.env` with PORT, MONGODB_URI, JWT_SECRET, CLIENT_URL
   - `npm run dev`

2. **Frontend**:
   - `cd client && npm install`
   - `npm run dev`

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/books/show` - Random books
- `GET /api/books/search?q=<query>` - Search books
- `GET /api/books/books` - Get books (protected)
- `POST /api/books/books` - Save favorite book (protected)
- `GET /api/books/books/:id` - check if book is favorite or not (protected)
- `DELETE /api/books/books/:id` - Delete book (protected)
