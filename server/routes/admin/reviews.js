import express from 'express';
import adminAuth from '../../middleware/adminAuth.js';

const router = express.Router();

// Get all reviews
router.get('/', adminAuth, async (req, res) => {
    const session = req.neo4jDriver.session();
    try {
        const result = await session.run(`
            MATCH (u:User)-[r:REVIEWED]->(m:Movie)
            RETURN r, u.username as username, u.email as userEmail, m.title as movieTitle, m.id as movieId
            ORDER BY r.createdAt DESC
        `);

        const reviews = result.records.map(record => {
            const review = record.get('r').properties;
            return {
                id: review.id,
                rating: review.rating,
                text: review.text,
                createdAt: review.createdAt,
                username: record.get('username'),
                userEmail: record.get('userEmail'),
                movieTitle: record.get('movieTitle'),
                movieId: record.get('movieId')
            };
        });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Delete review
router.delete('/:id', adminAuth, async (req, res) => {
    const { id } = req.params;
    const session = req.neo4jDriver.session();

    try {
        await session.run(`
            MATCH ()-[r:REVIEWED {id: $id}]->()
            DELETE r
        `, { id });

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

export default router;
