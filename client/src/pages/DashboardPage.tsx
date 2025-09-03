import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';
import {motion} from 'motion/react'

interface User {
  id: string;
  username: string;
  email: string;
}

interface AddFavoriteBook {
  bookId: string;
  title: string;
  author: string;
  year: number;
  cover: string;
}


interface Book {
  id?: string;
  bookId?: string;
  title: string;
  author: string;
  imageUrl?: string; // mapped from cover
  publishedDate?: string; // mapped from year
}

interface SearchResult {
  books: {
    id: string;
    title: string;
    author: string;
    cover?: string;
    year?: number;
  }[];
  totalItems: number;
}

interface FavoriteBookResponse {
  id: string;
  userId: string;
  bookId: string;
  title: string;
  author: string;
  year: number;
  cover: string;
  createdAt: string;
  updatedAt: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>('search');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/signin');
      return;
    }

    setUser(JSON.parse(userData));
    loadFavorites();
  }, [navigate]);

  const loadFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/books/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {

        const data = await response.json();
        console.log(data)
        // Map bookId to id for consistency with search results
        const mappedFavorites = (data.books || []).map((book: FavoriteBookResponse) => ({
          id: book.bookId, // Use bookId as id for consistency
          title: book.title,
          author: book.author,
          imageUrl: book.cover || '', // Map cover to imageUrl for image display
          publishedDate: book.year ? String(book.year) : undefined,
        }));
        setFavorites(mappedFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const searchBooks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/books/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
       
      if (response.ok) {
        const data: SearchResult = await response.json();
        
        const books: Book[] = data.books?.map((item) => ({
          id: item.id,
          title: item.title,
          author: item.author,
          imageUrl: item.cover || '',
          publishedDate: item.year ? String(item.year) : undefined,
        })) || [];
        
        setSearchResults(books);
      }
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = async (book: Book) => {
    if (!book.id) {
      console.error('Book ID is required to add to favorites');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const body: AddFavoriteBook = {
        bookId: book.id,
        title: book.title,
        author: book.author,
        year: Number(book.publishedDate) || 2020,
        cover: book.imageUrl || '',
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/books/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await loadFavorites();
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const removeFromFavorites = async (bookId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/books/favorites/${encodeURIComponent(bookId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        await loadFavorites();
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const isFavorite = (bookId: string) => {
    return favorites.some(book => book.id === bookId);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchBooks(searchQuery);
  };

  const BookCard: React.FC<{ book: Book ; showFavoriteButton?: boolean }> = ({ book, showFavoriteButton = true }) => (
    <motion.div 
    initial={{
      y:-10,
      opacity: 0
    }}
    animate ={{
      y:0,
      opacity:1
    }}
    transition={{
      duration:.3,
      ease:"easeInOut"
    }}
    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="flex">
        {book.imageUrl && (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-24 h-32 object-cover"
          />
        )}
        <div className="flex-1 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{book.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">by {book.author}</p>
          {book.publishedDate && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Published: {book.publishedDate}</p>
          )}
          {showFavoriteButton && (
            <button
              onClick={() => {
                const idToCheck = book.id || '';
                if (isFavorite(idToCheck)) {
                  removeFromFavorites(idToCheck);
                } else {
                  addToFavorites(book);
                }
              }}

              className={`mt-3 px-3 py-1 text-sm rounded-md transition-colors duration-300${
                isFavorite(book.id || '')
                  ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50'
                  : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50'
              }`}
            >
              {isFavorite(book.id || '') ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (!user) {
    return <div>Loading...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">BookFinder</h1>
            </div>
            <div className="flex items-center space-x-4">
              <DarkModeToggle />
              <span className="text-gray-700 dark:text-gray-300">Welcome, {user.username}!</span>
              <button
                onClick={handleLogout}
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Search Books
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'favorites'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              My Favorites ({favorites.length})
            </button>
          </nav>
        </div>

        {activeTab === 'search' && (
          <div>
            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for books by title, author, or keywords..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Search Results ({searchResults.length})
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </div>
            )}

            {searchQuery && !isLoading && searchResults.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No books found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">My Favorite Books</h2>
            {favorites.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {favorites.map((book) => (
                  <BookCard key={book.id} book={book} showFavoriteButton={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">You haven't added any books to your favorites yet.</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Start Searching
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
