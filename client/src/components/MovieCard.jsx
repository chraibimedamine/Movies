import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

function MovieCard({ movie }) {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/movie/${movie.id}`)
    }

    return (
        <motion.div
            className="movie-card"
            onClick={handleClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="movie-card-poster">
                <img
                    src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
                    alt={movie.title}
                    loading="lazy"
                />
                <div className="movie-card-overlay">
                    <button className="btn btn-primary">View Details</button>
                </div>
            </div>

            {(movie.rating || movie.avgRating) && (
                <div className="movie-card-rating">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    {typeof movie.avgRating === 'number' ? movie.avgRating.toFixed(1) :
                        typeof movie.rating === 'number' ? movie.rating.toFixed(1) :
                            movie.avgRating || movie.rating}
                </div>
            )}

            <div className="movie-card-info">
                <h3 className="movie-card-title">{movie.title}</h3>
                <div className="movie-card-meta">
                    <span>{movie.releaseYear}</span>
                    {movie.runtime && <span>• {movie.runtime} min</span>}
                </div>
                {movie.genres && movie.genres.length > 0 && (
                    <div className="movie-card-genres">
                        {movie.genres.slice(0, 2).map((genre) => (
                            <span key={genre} className="genre-tag">{genre}</span>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default MovieCard
