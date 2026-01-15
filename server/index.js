import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import neo4j from 'neo4j-driver';

// Routes
import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';
import reviewRoutes from './routes/reviews.js';
import trendingRoutes from './routes/trending.js';
import adminActorsRoutes from './routes/admin/actors.js';
import adminDirectorsRoutes from './routes/admin/directors.js';
import adminGenresRoutes from './routes/admin/genres.js';
import adminUsersRoutes from './routes/admin/users.js';
import adminReviewsRoutes from './routes/admin/reviews.js';
import adminStatsRoutes from './routes/admin/stats.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Neo4j Connection
const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'password'
  )
);

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Make driver available to routes
app.use((req, res, next) => {
  req.neo4jDriver = driver;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/admin/actors', adminActorsRoutes);
app.use('/api/admin/directors', adminDirectorsRoutes);
app.use('/api/admin/genres', adminGenresRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/reviews', adminReviewsRoutes);
app.use('/api/admin/stats', adminStatsRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const session = driver.session();
    await session.run('RETURN 1');
    await session.close();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await driver.close();
  process.exit(0);
});
