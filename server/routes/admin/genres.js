import express from 'express';
import adminAuth from '../../middleware/adminAuth.js';

const router = express.Router();

// Get all genres with their movie count
router.get('/', adminAuth, async (req, res) => {
    const session = req.neo4jDriver.session();
    try {
        const result = await session.run(`
            MATCH (g:Genre)
            OPTIONAL MATCH (m:Movie)-[:IN_GENRE]->(g)
            WITH g, count(m) as movieCount
            RETURN g, movieCount
            ORDER BY g.name
        `);

        const genres = result.records.map(record => ({
            ...record.get('g').properties,
            movieCount: record.get('movieCount').toNumber()
        }));

        res.json(genres);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Create a new genre
router.post('/', adminAuth, async (req, res) => {
    const { name } = req.body;
    const session = req.neo4jDriver.session();

    try {
        const result = await session.run(`
            CREATE (g:Genre {name: $name})
            RETURN g
        `, { name });

        res.status(201).json(result.records[0].get('g').properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Update a genre
router.put('/', adminAuth, async (req, res) => {
    const { currentName, newName } = req.body;
    const session = req.neo4jDriver.session();

    try {
        const result = await session.run(`
            MATCH (g:Genre {name: $currentName})
            SET g.name = $newName
            RETURN g
        `, { currentName, newName });

        if (result.records.length === 0) {
            return res.status(404).json({ message: 'Genre not found' });
        }

        res.json(result.records[0].get('g').properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Delete a genre
router.delete('/', adminAuth, async (req, res) => {
    const { name } = req.query;
    console.log(`[Genres] Deleting genre: "${name}"`);
    const session = req.neo4jDriver.session();

    try {
        const result = await session.run(`
            MATCH (g:Genre {name: $name})
            DETACH DELETE g
        `, { name });

        const deletedCount = result.summary.counters.updates().nodesDeleted;
        console.log(`[Genres] Deleted ${deletedCount} nodes for: "${name}"`);

        res.json({ message: 'Genre deleted successfully', deletedCount });
    } catch (error) {
        console.error('[Genres] Delete error:', error);
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

export default router;
