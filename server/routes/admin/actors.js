import express from 'express';
import adminAuth from '../../middleware/adminAuth.js';

const router = express.Router();

// Get all actors with their movie count
router.get('/', adminAuth, async (req, res) => {
    const session = req.neo4jDriver.session();
    try {
        const result = await session.run(`
            MATCH (a:Actor)
            OPTIONAL MATCH (m:Movie)-[:HAS_ACTOR]->(a)
            WITH a, count(m) as movieCount
            RETURN a, movieCount
            ORDER BY a.name
        `);

        const actors = result.records.map(record => ({
            ...record.get('a').properties,
            movieCount: record.get('movieCount').toNumber()
        }));

        res.json(actors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Create a new actor
router.post('/', adminAuth, async (req, res) => {
    const { name } = req.body;
    const session = req.neo4jDriver.session();

    try {
        const result = await session.run(`
            CREATE (a:Actor {name: $name})
            RETURN a
        `, { name });

        res.status(201).json(result.records[0].get('a').properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Update an actor
router.put('/:name', adminAuth, async (req, res) => {
    const { name } = req.params;
    const { newName } = req.body;
    const session = req.neo4jDriver.session();

    try {
        const result = await session.run(`
            MATCH (a:Actor {name: $name})
            SET a.name = $newName
            RETURN a
        `, { name, newName });

        if (result.records.length === 0) {
            return res.status(404).json({ message: 'Actor not found' });
        }

        res.json(result.records[0].get('a').properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Delete an actor
router.delete('/:name', adminAuth, async (req, res) => {
    const { name } = req.params;
    const session = req.neo4jDriver.session();

    try {
        await session.run(`
            MATCH (a:Actor {name: $name})
            DETACH DELETE a
        `, { name });

        res.json({ message: 'Actor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

export default router;
