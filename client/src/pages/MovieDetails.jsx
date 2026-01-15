import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { fetchMovieById, clearCurrentMovie } from '../store/moviesSlice'
import ReviewSection from '../components/ReviewSection'


function MovieDetails() {
    const { id } = useParams()
    const dispatch = useDispatch()
    const { currentMovie: movie, loading, error } = useSelector((state) => state.movies)

    useEffect(() => {
        dispatch(fetchMovieById(id))
        return () => dispatch(clearCurrentMovie())
    }, [dispatch, id])

    if (loading) {
        return (
            <div className="container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <span>Loading movie details...</span>
                </div>
            </div>
        )
    }

    if (error || !movie) {
        return (
            <div className="container">
                <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <h3>Movie not found</h3>
                    <Link to="/" className="btn btn-primary">Back to Home</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container">
            <motion.div
                className="movie-details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Poster */}
                <div className="movie-poster-large">
                    <img
                        src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
                        alt={movie.title}
                    />
                </div>

                {/* Info */}
                <div className="movie-info">
                    <h1>{movie.title}</h1>

                    <div className="movie-meta-bar">
                        {(movie.avgRating || movie.rating) && (
                            <div className="movie-rating-large">
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                <span className="rating-value">
                                    {movie.avgRating?.toFixed(1) || movie.rating?.toFixed(1)}
                                </span>
                                <span className="rating-max">/10</span>
                                {movie.reviewCount > 0 && (
                                    <span style={{ marginLeft: '8px', color: 'var(--color-text-muted)' }}>
                                        ({movie.reviewCount} reviews)
                                    </span>
                                )}
                            </div>
                        )}
                        <span>{movie.releaseYear}</span>
                        {movie.runtime && <span>{movie.runtime} min</span>}
                        {movie.director && <span>Directed by {movie.director}</span>}
                    </div>

                    {/* Genres */}
                    {movie.genres && movie.genres.length > 0 && (
                        <div className="movie-card-genres" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            {movie.genres.map((genre) => (
                                <span key={genre} className="genre-tag">{genre}</span>
                            ))}
                        </div>
                    )}

                    {/* Plot */}
                    <p className="movie-plot">{movie.plot}</p>

                    {/* Cast Section */}
                    {movie.cast && movie.cast.length > 0 && (
                        <div className="movie-section">
                            <h2 className="movie-section-title">Cast</h2>
                            <div className="cast-grid">
                                {movie.cast.map((actor, index) => (
                                    <div key={index} className="cast-card">
                                        <div className="cast-avatar">
                                            {actor.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="cast-name">{actor.name}</div>
                                        <div className="cast-character">{actor.character}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}



                    {/* Reviews Section */}
                    <ReviewSection movieId={id} />
                </div>
            </motion.div>
        </div>
    )
}

export default MovieDetails
