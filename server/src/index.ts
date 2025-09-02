import express from 'express';
import cors from 'cors';
import { connectDB } from './db';
import { authRoutes, bookRoutes } from './routes';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL ,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Book Finder API is running' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Ensure a single database connection in a serverless environment
let hasConnectedToDb = false;
const ensureDbConnection = async (): Promise<void> => {
  if (!hasConnectedToDb) {
    await connectDB();
    hasConnectedToDb = true;
  }
};

// Vercel handler: no app.listen; delegate to Express
export default async function handler(req: any, res: any) {
  await ensureDbConnection();
  return app(req, res);
}

// Local development: run a server only when not on Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  (async () => {
    try {
      await ensureDbConnection();
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📡 API available at http://localhost:${PORT}/api`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  })();
}
// const PORT = process.env.PORT || 3001;

// // Start server
// const startServer = async () => {
//   try {
//     // Connect to database
//     await connectDB();
    
//     // Start listening
//     app.listen(PORT, () => {
//       console.log(`🚀 Server is running on port ${PORT}`);
//       console.log(`📡 API available at http://localhost:${PORT}/api`);
//     });
//   } catch (error) {
//     console.error('❌ Failed to start server:', error);
//     process.exit(1);
//   }
// };

// startServer();