import { Router } from 'express';
import { authenticateUser } from '../middleware';
import { validateBody } from '../middleware/validation';
import { addFavoriteSchema, AddFavoriteInput, BookResponse } from '../types/auth';
import { Book, IBook } from '../models/Book';
import axios from 'axios';

const bookRouter = Router();

// Get random 10 books for landing page
bookRouter.get('/show', async (req, res) => {
  try {
    // Popular book titles for random selection
    const popularBooks = [
      'The Great Gatsby',
      'To Kill a Mockingbird', 
      '1984',
      'Pride and Prejudice',
      'The Catcher in the Rye',
      'Lord of the Flies',
      'Animal Farm',
      'The Hobbit',
      'Brave New World',
      'The Alchemist',
      'The Little Prince',
      'The Book Thief',
      'The Kite Runner',
      'Life of Pi',
      'The Road',
      'The Help',
      'Gone Girl',
      'The Fault in Our Stars',
      'The Hunger Games',
      'Harry Potter'
    ];

    // Get 10 random books from the list
    const randomBooks = [];
    const shuffled = [...popularBooks].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < 10; i++) {
      const bookTitle = shuffled[i];
      
      try {
        const response = await axios.get('https://openlibrary.org/search.json', {
          params: { 
            q: bookTitle,
            limit: 1,
            fields: 'title,author_name,first_publish_year,cover_i'
          }
        });

        if (response.data.docs && response.data.docs.length > 0) {
          const book = response.data.docs[0];
          randomBooks.push({
            title: book.title,
            author: book.author_name ? book.author_name.join(', ') : 'Unknown Author',
            year: book.first_publish_year || 2024,
            cover: book.cover_i 
              ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
              : null,
            id: book.key || `book-${i}`
          });
        }
      } catch (error) {
        // If API call fails for a specific book, add a fallback
        randomBooks.push({
          title: bookTitle,
          author: 'Unknown Author',
          year: 2024,
          cover: null,
          id: `fallback-${i}`
        });
      }
    }

    res.json({ 
      books: randomBooks,
      message: 'Random books for landing page'
    });
  } catch (error) {
    console.error('Error fetching random books:', error);
    res.status(500).json({ 
      error: 'Failed to fetch random books',
      message: 'Please try again later'
    });
  }
});

// Search books route - improved version
bookRouter.get('/search', authenticateUser, async (req, res) => {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ 
      error: 'Query parameter is required',
      message: 'Please provide a search query'
    });
  }

  try {
    const response = await axios.get('https://openlibrary.org/search.json', {
      params: { 
        q, 
        limit: 20,
        fields: 'title,author_name,first_publish_year,cover_i,key'
      }
    });

    const books = response.data.docs.map((book: any) => ({
      id: book.key,
      title: book.title,
      author: book.author_name ? book.author_name.join(', ') : 'Unknown Author',
      year: book.first_publish_year || 2024,
      cover: book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : null
    }));

    res.json({ 
      books,
      total: response.data.numFound,
      query: q,
      message: `Found ${books.length} books for "${q}"`
    });
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ 
      error: 'Failed to search books',
      message: 'Please try again later'
    });
  }
});

// Get user's favorite books - requires authentication
bookRouter.get('/favorites', authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const favoriteBooks = await Book.find({ userId }).populate('user', 'username email').sort({ createdAt: -1 });

    const books: BookResponse[] = favoriteBooks.map((book: IBook) => ({
      id: (book._id as any).toString(),
      userId: book.userId.toString(),
      bookId: book.bookId,
      title: book.title,
      author: book.author,
      year: book.year,
      cover: book.cover,
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
    }));

    res.json({
      books,
      message: `Found ${books.length} favorite books`
    });
  } catch (error) {
    console.error('Error fetching favorite books:', error);
    res.status(500).json({
      error: 'Failed to fetch favorite books',
      message: 'Please try again later'
    });
  }
});

// Add book to favorites - requires authentication
bookRouter.post('/favorites', authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const bookData: AddFavoriteInput = req.body;
    console.log(req.body)
    // Check if book is already favorited
    const existingBook = await Book.findOne({ userId, bookId: bookData.bookId });
    
    if (existingBook) {
      return res.status(400).json({
        message: 'Book is already in your favorites',
        errors: [
          {
            field: 'bookId',
            message: 'This book is already in your favorites'
          }
        ]
      });
    }

    // Create new favorite book
    const book = new Book({
      userId,
      bookId: bookData.bookId,
      title: bookData.title,
      author: bookData.author,
      year: bookData.year,
      cover: bookData.cover || null,
    });

    await book.save();

    const bookResponse: BookResponse = {
      id: (book._id as any).toString(),
      userId: book.userId.toString(),
      bookId: book.bookId,
      title: book.title,
      author: book.author,
      year: book.year,
      cover: book.cover,
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
    };

    res.status(201).json({
      book: bookResponse,
      message: 'Book added to favorites successfully'
    });
  } catch (error: any) {
    console.error('Error adding book to favorites:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Book is already in your favorites',
        errors: [
          {
            field: 'bookId',
            message: 'This book is already in your favorites'
          }
        ]
      });
    }

    res.status(500).json({
      error: 'Failed to add book to favorites',
      message: 'Please try again later'
    });
  }
});

// Remove book from favorites - requires authentication
bookRouter.delete('/favorites/:bookId', authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.params;

    const book = await Book.findOneAndDelete({ userId, bookId });

    if (!book) {
      return res.status(404).json({
        message: 'Book not found in favorites',
        errors: [
          {
            field: 'bookId',
            message: 'This book is not in your favorites'
          }
        ]
      });
    }

    res.json({
      message: 'Book removed from favorites successfully',
      removedBook: {
        id: (book._id as any).toString(),
        bookId: book.bookId,
        title: book.title,
        author: book.author
      }
    });
  } catch (error) {
    console.error('Error removing book from favorites:', error);
    res.status(500).json({
      error: 'Failed to remove book from favorites',
      message: 'Please try again later'
    });
  }
});

// Check if book is favorited - requires authentication
bookRouter.get('/favorites/check/:bookId', authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.params;

    const book = await Book.findOne({ userId, bookId });

    res.json({
      isFavorited: !!book,
      book: book ? {
        id: (book._id as any).toString(),
        bookId: book.bookId,
        title: book.title,
        author: book.author
      } : null
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({
      error: 'Failed to check favorite status',
      message: 'Please try again later'
    });
  }
});

export default bookRouter;
