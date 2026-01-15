import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import crypto from 'crypto';

const router = express.Router();

// Get all movies with pagination
router.get('/', async (req, res) => {
    const { page = 1, limit = 12, genre, year, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;
    const session = req.neo4jDriver.session();

    try {
        let whereClause = '';
        const params = {};

        if (search) {
            whereClause = 'WHERE toLower(m.title) CONTAINS toLower($search) OR toLower(m.plot) CONTAINS toLower($search)';
            params.search = search;
        }
        if (genre) {
            whereClause += (whereClause ? ' AND ' : 'WHERE ') + 'EXISTS { (m)-[:IN_GENRE]->(:Genre {name: $genre}) }';
            params.genre = genre;
        }
        if (year) {
            whereClause += (whereClause ? ' AND ' : 'WHERE ') + 'm.releaseYear = $year';
            params.year = parseInt(year);
        }

        const query = `
      MATCH (m:Movie)
      ${whereClause}
      OPTIONAL MATCH (m)-[:DIRECTED_BY]->(d:Director)
      OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
      WITH m, d, collect(DISTINCT g.name) as genres
      RETURN m, d.name as director, genres
      ORDER BY m.releaseYear DESC
      SKIP ${skipNum} LIMIT ${limitNum}
    `;

        const result = await session.run(query, params);

        const movies = result.records.map(record => ({
            ...record.get('m').properties,
            director: record.get('director'),
            genres: record.get('genres')
        }));

        // Get total count
        const countQuery = `
      MATCH (m:Movie)
      ${whereClause}
      RETURN count(m) as total
    `;
        const countResult = await session.run(countQuery, params);
        const total = countResult.records[0].get('total').toNumber();

        res.json({
            movies,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Get all genres - MUST be before /:id route
router.get('/meta/genres', async (req, res) => {
    const session = req.neo4jDriver.session();

    try {
        const result = await session.run('MATCH (g:Genre) RETURN g.name as name ORDER BY name');
        const genres = result.records.map(r => r.get('name'));
        res.json(genres);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Get single movie with full details
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const session = req.neo4jDriver.session();

    try {
        const result = await session.run(`
      MATCH (m:Movie {id: $id})
      OPTIONAL MATCH (m)-[:DIRECTED_BY]->(d:Director)
      OPTIONAL MATCH (m)-[ha:HAS_ACTOR]->(a:Actor)
      OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
      OPTIONAL MATCH (m)<-[r:REVIEWED]-(u:User)
      WITH m, d, 
           collect(DISTINCT {name: a.name, character: ha.character}) as cast,
           collect(DISTINCT g.name) as genres,
           avg(r.rating) as avgRating,
           count(r) as reviewCount
      RETURN m, d.name as director, cast, genres, avgRating, reviewCount
    `, { id });

        if (result.records.length === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        const record = result.records[0];
        const movie = {
            ...record.get('m').properties,
            director: record.get('director'),
            cast: record.get('cast'),
            genres: record.get('genres'),
            avgRating: record.get('avgRating'),
            reviewCount: record.get('reviewCount')?.toNumber() || 0
        };

        res.json(movie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Get movie connections graph
router.get('/:id/connections', async (req, res) => {
    const { id } = req.params;
    const session = req.neo4jDriver.session();

    try {
        const result = await session.run(`
      MATCH (m:Movie {id: $id})
      OPTIONAL MATCH (m)-[:HAS_ACTOR]->(a:Actor)<-[:HAS_ACTOR]-(related:Movie)
      WHERE related.id <> m.id
      WITH m, related, count(a) as sharedActors
      ORDER BY sharedActors DESC LIMIT 5
      OPTIONAL MATCH (m)-[:DIRECTED_BY]->(d:Director)<-[:DIRECTED_BY]-(sameDirector:Movie)
      WHERE sameDirector.id <> m.id
      RETURN m, collect(DISTINCT {movie: related, sharedActors: sharedActors}) as relatedByActors,
             collect(DISTINCT sameDirector) as relatedByDirector
    `, { id });

        if (result.records.length === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        const record = result.records[0];
        const mainMovie = record.get('m').properties;

        // Build graph nodes and edges
        const nodes = [{ id: mainMovie.id, label: mainMovie.title, type: 'main' }];
        const edges = [];

        record.get('relatedByActors').forEach(rel => {
            if (rel.movie) {
                const movie = rel.movie.properties;
                if (!nodes.find(n => n.id === movie.id)) {
                    nodes.push({ id: movie.id, label: movie.title, type: 'related' });
                }
                edges.push({
                    source: mainMovie.id,
                    target: movie.id,
                    label: `${rel.sharedActors} shared actors`
                });
            }
        });

        record.get('relatedByDirector').forEach(movie => {
            const props = movie.properties;
            if (!nodes.find(n => n.id === props.id)) {
                nodes.push({ id: props.id, label: props.title, type: 'sameDirector' });
            }
            if (!edges.find(e => e.source === mainMovie.id && e.target === props.id)) {
                edges.push({
                    source: mainMovie.id,
                    target: props.id,
                    label: 'Same director'
                });
            }
        });

        res.json({ nodes, edges });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Add a new movie (Admin only)
router.post('/', adminAuth, async (req, res) => {
    const movieData = req.body;
    const session = req.neo4jDriver.session();
    const movieId = movieData.id || crypto.randomUUID();

    try {
        const result = await session.run(`
            CREATE (m:Movie {
                id: $id,
                title: $title,
                plot: $plot,
                releaseYear: $releaseYear,
                runtime: $runtime,
                rating: $rating,
                poster: $poster,
                backdrop: $backdrop
            })
            RETURN m
        `, { ...movieData, id: movieId });

        // Handle relationships (director, genres, cast) if provided
        if (movieData.director) {
            await session.run(`
                MATCH (m:Movie {id: $movieId})
                MERGE (d:Director {name: $directorName})
                MERGE (m)-[:DIRECTED_BY]->(d)
            `, { movieId, directorName: movieData.director });
        }

        if (movieData.genres && Array.isArray(movieData.genres)) {
            for (const genre of movieData.genres) {
                await session.run(`
                    MATCH (m:Movie {id: $movieId})
                    MERGE (g:Genre {name: $genreName})
                    MERGE (m)-[:IN_GENRE]->(g)
                `, { movieId, genreName: genre });
            }
        }

        res.status(201).json(result.records[0].get('m').properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Update a movie (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const session = req.neo4jDriver.session();

    try {
        // Update basic properties
        const result = await session.run(`
            MATCH (m:Movie {id: $id})
            SET m += $props
            RETURN m
        `, {
            id,
            props: {
                title: updateData.title,
                plot: updateData.plot,
                releaseYear: parseInt(updateData.releaseYear),
                runtime: parseInt(updateData.runtime),
                rating: parseFloat(updateData.rating),
                poster: updateData.poster,
                backdrop: updateData.backdrop
            }
        });

        if (result.records.length === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        // Update Director Relationship
        if (updateData.director) {
            await session.run(`
                MATCH (m:Movie {id: $id})
                OPTIONAL MATCH (m)-[r:DIRECTED_BY]->()
                DELETE r
                WITH m
                MATCH (d:Director {name: $directorName})
                MERGE (m)-[:DIRECTED_BY]->(d)
            `, { id, directorName: updateData.director });
        }

        // Update Genres Relationship
        if (updateData.genres && Array.isArray(updateData.genres)) {
            await session.run(`
                MATCH (m:Movie {id: $id})
                OPTIONAL MATCH (m)-[r:IN_GENRE]->()
                DELETE r
            `, { id });

            for (const genre of updateData.genres) {
                await session.run(`
                    MATCH (m:Movie {id: $id})
                    MATCH (g:Genre {name: $genreName})
                    MERGE (m)-[:IN_GENRE]->(g)
                `, { id, genreName: genre });
            }
        }

        res.json(result.records[0].get('m').properties);
    } catch (error) {
        console.error('Update movie error:', error);
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

// Delete a movie (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    const { id } = req.params;
    const session = req.neo4jDriver.session();

    try {
        const result = await session.run(`
            MATCH (m:Movie {id: $id})
            DETACH DELETE m
            RETURN count(m) as deletedCount
        `, { id });

        res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
});

export default router;

