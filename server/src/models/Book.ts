import mongoose, { Document, Schema } from 'mongoose';

// Book interface extending Document
export interface IBook extends Document {
  userId: mongoose.Types.ObjectId; // Foreign key reference to User
  bookId: string; // Open Library book ID (e.g., "/works/OL26656889W")
  title: string;
  author: string;
  year: number;
  cover: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Book schema
const bookSchema = new Schema<IBook>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    bookId: {
      type: String,
      required: [true, 'Book ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Book author is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Book year is required'],
    },
    cover: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Compound index to ensure a user can't save the same book twice
bookSchema.index({ userId: 1, bookId: 1 }, { unique: true });

// Index for better query performance
bookSchema.index({ userId: 1 });

// Virtual populate for user data
bookSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Ensure virtuals are included when converting to JSON
bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

// Create and export the Book model
export const Book = mongoose.model<IBook>('Book', bookSchema);

// Export the model type for use in other files
export type BookModel = typeof Book;
