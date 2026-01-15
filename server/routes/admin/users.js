import express from 'express';
import adminAuth from '../../middleware/adminAuth.js';

const router = express.Router();

// Get all users
router.get('/', adminAuth, async (req, res) => {
    const session = req.neo4jDriver.session();
    try {
        const result = await session.run(`
            MATCH (u:User)
            OPTIONAL MATCH (u)-[r:REVIEWED]->()
            WITH u, count(r) as reviewCount
            RETURN u, reviewCount
            ORDER BY u.createdAt DESC
        `);

        const users = result.records.map(record => {
            const user = record.get('u').properties;
            return {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'user',
                createdAt: user.createdAt,
                reviewCount: record.get('reviewCount').toNumber()
            };
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Update user role
router.put('/:id', adminAuth, async (req, res) => {
    const { id } = req.params;
    const { role, username, email } = req.body;
    const session = req.neo4jDriver.session();

    try {
        const updates = {};
        if (role) updates.role = role;
        if (username) updates.username = username;
        if (email) updates.email = email;

        const result = await session.run(`
            MATCH (u:User {id: $id})
            SET u += $updates
            RETURN u
        `, { id, updates });

        if (result.records.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.records[0].get('u').properties;
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role || 'user'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Delete user
router.delete('/:id', adminAuth, async (req, res) => {
    const { id } = req.params;
    console.log(`[Users] Deleting user: "${id}"`);
    const session = req.neo4jDriver.session();

    try {
        const result = await session.run(`
            MATCH (u:User {id: $id})
            DETACH DELETE u
        `, { id });

        const deletedCount = result.summary.counters.updates().nodesDeleted;
        console.log(`[Users] Deleted ${deletedCount} nodes for: "${id}"`);

        res.json({ message: 'User deleted successfully', deletedCount });
    } catch (error) {
        console.error('[Users] Delete error:', error);
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

export default router;
