import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const session = req.neo4jDriver.session();

    try {
        // Check if user exists
        const existingUser = await session.run(
            'MATCH (u:User {email: $email}) RETURN u',
            { email }
        );

        if (existingUser.records.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = crypto.randomUUID();

        // Create user
        const result = await session.run(
            `CREATE (u:User {
        id: $userId,
        username: $username,
        email: $email,
        password: $hashedPassword,
        role: 'user',
        createdAt: datetime()
      }) RETURN u`,
            { userId, username, email, hashedPassword }
        );

        const user = result.records[0].get('u').properties;

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: user.id, username: user.username, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const session = req.neo4jDriver.session();

    try {
        const result = await session.run(
            'MATCH (u:User {email: $email}) RETURN u',
            { email }
        );

        if (result.records.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.records[0].get('u').properties;

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role || 'user' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username, email: user.email, role: user.role || 'user' }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Get current user
router.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const session = req.neo4jDriver.session();

        const result = await session.run(
            'MATCH (u:User {id: $userId}) RETURN u',
            { userId: decoded.userId }
        );

        await session.close();

        if (result.records.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.records[0].get('u').properties;
        res.json({ id: user.id, username: user.username, email: user.email, role: user.role || 'user' });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

export default router;
