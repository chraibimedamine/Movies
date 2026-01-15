import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchMovies, fetchTrending } from '../store/moviesSlice'
import MovieCard from '../components/MovieCard'
import TrendingSection from '../components/TrendingSection'

function Home() {
    const dispatch = useDispatch()
    const { movies, trending, loading } = useSelector((state) => state.movies)

    useEffect(() => {
        dispatch(fetchMovies({ limit: 12 }))
        dispatch(fetchTrending())
    }, [dispatch])

    // Get featured movie for hero
    const featuredMovie = trending.featured?.[0]; // Prioritize trending
    console.log('Featured Movie Source:', featuredMovie ? 'Trending' : 'None', featuredMovie);

    return (
        <div className="container">
            {/* Hero Section */}
            {featuredMovie && (
                <motion.section
                    key={featuredMovie.id}
                    className="hero"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="hero-backdrop">
                        <img
                            key={featuredMovie.backdrop}
                            src={featuredMovie.backdrop || featuredMovie.poster}
                            alt={featuredMovie.title}
                            onError={(e) => {
                                console.error('Error loading hero image:', e.target.src);
                                if (featuredMovie.poster && e.target.src !== featuredMovie.poster) {
                                    console.log('Falling back to poster');
                                    e.target.src = featuredMovie.poster;
                                } else {
                                    e.target.style.display = 'none';
                                }
                            }}
                        />
                    </div>
                    <div className="hero-content">
                        <span className="hero-badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
                            </svg>
                            Featured
                        </span>
                        <h1 className="hero-title">{featuredMovie.title}</h1>
                        <div className="hero-meta">
                            <span>{featuredMovie.releaseYear}</span>
                            {featuredMovie.runtime && <span>{featuredMovie.runtime} min</span>}
                            {featuredMovie.genres && (
                                <span>{featuredMovie.genres.slice(0, 3).join(' • ')}</span>
                            )}
                        </div>
                        <p className="hero-description">{featuredMovie.plot}</p>
                        <div className="hero-actions">
                            <Link to={`/movie/${featuredMovie.id}`} className="btn btn-primary">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                View Details
                            </Link>
                            <button className="btn btn-secondary">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                                Add to Favorites
                            </button>
                        </div>
                    </div>
                </motion.section>
            )}

            {/* Trending Section */}
            <TrendingSection trending={trending} />

            {/* All Movies Section */}
            <section className="section">
                <div className="section-header">
                    <h2 className="section-title">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                        </svg>
                        All Movies
                    </h2>
                    <Link to="/search" className="btn btn-ghost">
                        View All
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                    </Link>
                </div>

                {loading ? (
                    <div className="loading">
                        <div className="loading-spinner"></div>
                        <span>Loading movies...</span>
                    </div>
                ) : (
                    <motion.div
                        className="movie-grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        {movies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </motion.div>
                )}
            </section>
        </div>
    )
}

export default Home
