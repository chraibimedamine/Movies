import express from 'express';

const router = express.Router();

// Get trending movies
router.get('/', async (req, res) => {
    const { type = 'all' } = req.query;
    const session = req.neo4jDriver.session();

    try {
        let results = {};

        // Highest rated movies (with at least 1 review)
        if (type === 'all' || type === 'rated') {
            const ratedResult = await session.run(`
        MATCH (m:Movie)<-[r:REVIEWED]-(u:User)
        WITH m, avg(r.rating) as avgRating, count(r) as reviewCount
        WHERE reviewCount >= 1
        OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
        WITH m, avgRating, reviewCount, collect(DISTINCT g.name) as genres
        RETURN m, avgRating, reviewCount, genres
        ORDER BY avgRating DESC, reviewCount DESC
        LIMIT 10
      `);

            results.highestRated = ratedResult.records.map(record => ({
                ...record.get('m').properties,
                avgRating: record.get('avgRating'),
                reviewCount: record.get('reviewCount').toNumber(),
                genres: record.get('genres')
            }));
        }

        // Most viewed movies (based on view count)
        if (type === 'all' || type === 'viewed') {
            const viewedResult = await session.run(`
        MATCH (m:Movie)<-[v:VIEWED]-(u:User)
        WITH m, count(v) as viewCount
        OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
        WITH m, viewCount, collect(DISTINCT g.name) as genres
        RETURN m, viewCount, genres
        ORDER BY viewCount DESC
        LIMIT 10
      `);

            results.mostViewed = viewedResult.records.map(record => ({
                ...record.get('m').properties,
                viewCount: record.get('viewCount').toNumber(),
                genres: record.get('genres')
            }));
        }

        // Recently released with high engagement
        if (type === 'all' || type === 'recent') {
            const recentResult = await session.run(`
        MATCH (m:Movie)
        WHERE m.releaseYear >= 2024
        OPTIONAL MATCH (m)<-[r:REVIEWED]-(u:User)
        OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
        WITH m, avg(r.rating) as avgRating, count(r) as reviewCount, collect(DISTINCT g.name) as genres
        RETURN m, avgRating, reviewCount, genres
        ORDER BY m.releaseYear DESC, avgRating DESC
        LIMIT 10
      `);

            results.recentReleases = recentResult.records.map(record => ({
                ...record.get('m').properties,
                avgRating: record.get('avgRating'),
                reviewCount: record.get('reviewCount')?.toNumber() || 0,
                genres: record.get('genres')
            }));
        }

        // Featured/Popular (combined score)
        if (type === 'all' || type === 'featured') {
            const featuredResult = await session.run(`
        MATCH (m:Movie)
        OPTIONAL MATCH (m)<-[r:REVIEWED]-(u:User)
        OPTIONAL MATCH (m)<-[v:VIEWED]-(u2:User)
        OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
        WITH m, 
             coalesce(avg(r.rating), 0) as avgRating, 
             count(DISTINCT r) as reviewCount,
             count(DISTINCT v) as viewCount,
             collect(DISTINCT g.name) as genres
        WITH m, avgRating, reviewCount, viewCount, genres,
             (avgRating * 0.5) + (reviewCount * 0.3) + (viewCount * 0.2) as trendScore
        RETURN m, avgRating, reviewCount, viewCount, genres, trendScore
        ORDER BY trendScore DESC
        LIMIT 10
      `);

            results.featured = featuredResult.records.map(record => ({
                ...record.get('m').properties,
                avgRating: record.get('avgRating'),
                reviewCount: record.get('reviewCount').toNumber(),
                viewCount: record.get('viewCount').toNumber(),
                genres: record.get('genres'),
                trendScore: record.get('trendScore')
            }));
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Track movie view
router.post('/view/:movieId', async (req, res) => {
    const { movieId } = req.params;
    const session = req.neo4jDriver.session();

    try {
        // Create anonymous view or use user if authenticated
        const authHeader = req.headers.authorization;
        let userId = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const jwt = await import('jsonwebtoken');
                const token = authHeader.split(' ')[1];
                const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'secret');
                userId = decoded.userId;
            } catch (e) {
                // Token invalid, continue without user
            }
        }

        if (userId) {
            await session.run(`
        MATCH (u:User {id: $userId}), (m:Movie {id: $movieId})
        MERGE (u)-[v:VIEWED]->(m)
        ON CREATE SET v.date = datetime(), v.count = 1
        ON MATCH SET v.date = datetime(), v.count = coalesce(v.count, 0) + 1
      `, { userId, movieId });
        } else {
            // Track anonymous views on the movie itself
            await session.run(`
        MATCH (m:Movie {id: $movieId})
        SET m.anonymousViews = coalesce(m.anonymousViews, 0) + 1
      `, { movieId });
        }

        res.json({ message: 'View tracked' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

export default router;
