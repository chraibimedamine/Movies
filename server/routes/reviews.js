import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Get reviews for a movie
router.get('/movie/:movieId', async (req, res) => {
    const { movieId } = req.params;
    const session = req.neo4jDriver.session();

    try {
        const result = await session.run(`
      MATCH (u:User)-[r:REVIEWED]->(m:Movie {id: $movieId})
      RETURN r, u.username as username, u.id as oderId
      ORDER BY r.createdAt DESC
    `, { movieId });

        const reviews = result.records.map(record => ({
            ...record.get('r').properties,
            username: record.get('username'),
            userId: record.get('userId')
        }));

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Create a review (requires auth)
router.post('/movie/:movieId', verifyToken, async (req, res) => {
    const { movieId } = req.params;
    const { rating, text } = req.body;
    const userId = req.userId;
    const session = req.neo4jDriver.session();

    try {
        // Check if user already reviewed this movie
        const existing = await session.run(`
      MATCH (u:User {id: $userId})-[r:REVIEWED]->(m:Movie {id: $movieId})
      RETURN r
    `, { userId, movieId });

        if (existing.records.length > 0) {
            // Update existing review
            const result = await session.run(`
        MATCH (u:User {id: $userId})-[r:REVIEWED]->(m:Movie {id: $movieId})
        SET r.rating = $rating, r.text = $text, r.updatedAt = datetime()
        RETURN r, u.username as username
      `, { userId, movieId, rating: parseFloat(rating), text });

            const record = result.records[0];
            res.json({
                ...record.get('r').properties,
                username: record.get('username')
            });
        } else {
            // Create new review
            const result = await session.run(`
        MATCH (u:User {id: $userId}), (m:Movie {id: $movieId})
        CREATE (u)-[r:REVIEWED {
          id: randomUUID(),
          rating: $rating,
          text: $text,
          createdAt: datetime()
        }]->(m)
        RETURN r, u.username as username
      `, { userId, movieId, rating: parseFloat(rating), text });

            const record = result.records[0];
            res.status(201).json({
                ...record.get('r').properties,
                username: record.get('username')
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Delete a review (requires auth)
router.delete('/:reviewId', verifyToken, async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.userId;
    const session = req.neo4jDriver.session();

    try {
        const result = await session.run(`
      MATCH (u:User {id: $userId})-[r:REVIEWED {id: $reviewId}]->(m:Movie)
      DELETE r
      RETURN count(r) as deleted
    `, { userId, reviewId });

        const deleted = result.records[0].get('deleted').toNumber();

        if (deleted === 0) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

export default router;
