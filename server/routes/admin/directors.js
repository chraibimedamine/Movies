import express from 'express';
import adminAuth from '../../middleware/adminAuth.js';

const router = express.Router();

// Get all directors with their movie count
router.get('/', adminAuth, async (req, res) => {
    const session = req.neo4jDriver.session();
    try {
        const result = await session.run(`
            MATCH (d:Director)
            OPTIONAL MATCH (m:Movie)-[:DIRECTED_BY]->(d)
            WITH d, count(m) as movieCount
            RETURN d, movieCount
            ORDER BY d.name
        `);

        const directors = result.records.map(record => ({
            ...record.get('d').properties,
            movieCount: record.get('movieCount').toNumber()
        }));

        res.json(directors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Create a new director
router.post('/', adminAuth, async (req, res) => {
    const { name } = req.body;
    const session = req.neo4jDriver.session();

    try {
        const result = await session.run(`
            CREATE (d:Director {name: $name})
            RETURN d
        `, { name });

        res.status(201).json(result.records[0].get('d').properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Update a director
router.put('/', adminAuth, async (req, res) => {
    const { currentName, newName } = req.body;
    const session = req.neo4jDriver.session();

    try {
        const result = await session.run(`
            MATCH (d:Director {name: $currentName})
            SET d.name = $newName
            RETURN d
        `, { currentName, newName });

        if (result.records.length === 0) {
            return res.status(404).json({ message: 'Director not found' });
        }

        res.json(result.records[0].get('d').properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Delete a director
router.delete('/', adminAuth, async (req, res) => {
    const { name } = req.query;
    console.log(`[Directors] Deleting director: "${name}"`);
    const session = req.neo4jDriver.session();

    try {
        const result = await session.run(`
            MATCH (d:Director {name: $name})
            DETACH DELETE d
        `, { name });

        const deletedCount = result.summary.counters.updates().nodesDeleted;
        console.log(`[Directors] Deleted ${deletedCount} nodes for: "${name}"`);

        res.json({ message: 'Director deleted successfully', deletedCount });
    } catch (error) {
        console.error('[Directors] Delete error:', error);
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

export default router;
