import express from 'express';
import adminAuth from '../../middleware/adminAuth.js';

const router = express.Router();

// Get database statistics
router.get('/', adminAuth, async (req, res) => {
    const session = req.neo4jDriver.session();
    try {
        // Get basic counts
        const statsResult = await session.run(`
            MATCH (m:Movie) WITH count(m) as movies
            MATCH (a:Actor) WITH movies, count(a) as actors
            MATCH (d:Director) WITH movies, actors, count(d) as directors
            MATCH (g:Genre) WITH movies, actors, directors, count(g) as genres
            MATCH (u:User) WITH movies, actors, directors, genres, count(u) as users
            MATCH ()-[r:REVIEWED]->() WITH movies, actors, directors, genres, users, count(r) as reviews
            RETURN movies, actors, directors, genres, users, reviews
        `);

        const stats = statsResult.records[0];

        // Movies by year
        const moviesByYearResult = await session.run(`
            MATCH (m:Movie)
            WHERE m.releaseYear >= 2015
            RETURN m.releaseYear as year, count(m) as count
            ORDER BY year DESC
        `);

        const moviesByYear = moviesByYearResult.records.map(r => ({
            year: r.get('year'),
            count: r.get('count').toNumber()
        }));

        // Movies by genre
        const moviesByGenreResult = await session.run(`
            MATCH (m:Movie)-[:IN_GENRE]->(g:Genre)
            RETURN g.name as genre, count(m) as count
            ORDER BY count DESC
            LIMIT 10
        `);

        const moviesByGenre = moviesByGenreResult.records.map(r => ({
            genre: r.get('genre'),
            count: r.get('count').toNumber()
        }));

        // Top directors
        const topDirectorsResult = await session.run(`
            MATCH (m:Movie)-[:DIRECTED_BY]->(d:Director)
            RETURN d.name as director, count(m) as movieCount
            ORDER BY movieCount DESC
            LIMIT 10
        `);

        const topDirectors = topDirectorsResult.records.map(r => ({
            name: r.get('director'),
            movieCount: r.get('movieCount').toNumber()
        }));

        // Top rated movies
        const topRatedResult = await session.run(`
            MATCH (m:Movie)<-[r:REVIEWED]-()
            WITH m, avg(r.rating) as avgRating, count(r) as reviewCount
            WHERE reviewCount >= 2
            RETURN m.title as title, avgRating, reviewCount
            ORDER BY avgRating DESC
            LIMIT 10
        `);

        const topRated = topRatedResult.records.map(r => ({
            title: r.get('title'),
            rating: r.get('avgRating'),
            reviewCount: r.get('reviewCount').toNumber()
        }));

        res.json({
            totals: {
                movies: stats.get('movies').toNumber(),
                actors: stats.get('actors').toNumber(),
                directors: stats.get('directors').toNumber(),
                genres: stats.get('genres').toNumber(),
                users: stats.get('users').toNumber(),
                reviews: stats.get('reviews').toNumber()
            },
            charts: {
                moviesByYear,
                moviesByGenre,
                topDirectors,
                topRated
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

export default router;
