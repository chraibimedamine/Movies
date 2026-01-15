import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';

import MovieEditModal from '../../components/admin/MovieEditModal';

function MoviesManager() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [directors, setDirectors] = useState([]);
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);

    // Edit state
    const [editingMovie, setEditingMovie] = useState(null);

    const [newMovie, setNewMovie] = useState({
        title: '',
        plot: '',
        releaseYear: new Date().getFullYear(),
        runtime: '',
        rating: '',
        poster: '',
        backdrop: '',
        director: ''
    });

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchMovies();
        fetchDirectors();
        fetchGenres();
    }, [user, navigate]);

    const fetchMovies = async () => {
        try {
            const response = await api.get('/movies?limit=100');
            setMovies(response.data.movies || []);
        } catch (error) {
            console.error('Error fetching movies:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDirectors = async () => {
        try {
            const response = await api.get('/admin/directors');
            setDirectors(response.data || []);
        } catch (error) {
            console.error('Error fetching directors:', error);
        }
    };

    const fetchGenres = async () => {
        try {
            const response = await api.get('/admin/genres');
            setGenres(response.data || []);
        } catch (error) {
            console.error('Error fetching genres:', error);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const movieData = {
                ...newMovie,
                releaseYear: parseInt(newMovie.releaseYear),
                runtime: parseInt(newMovie.runtime),
                rating: parseFloat(newMovie.rating) || 0,
                genres: selectedGenres
            };
            await api.post('/movies', movieData);
            setNewMovie({
                title: '',
                plot: '',
                releaseYear: new Date().getFullYear(),
                runtime: '',
                rating: '',
                poster: '',
                backdrop: '',
                director: ''
            });
            setSelectedGenres([]);
            setShowAddForm(false);
            fetchMovies();
        } catch (error) {
            alert('Error adding movie: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditSave = async (updatedMovieData) => {
        try {
            await api.put(`/movies/${editingMovie.id}`, updatedMovieData);
            setEditingMovie(null);
            fetchMovies();
        } catch (error) {
            alert('Error updating movie: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (movie) => {
        if (window.confirm(`Delete "${movie.title}"? This will remove all relationships.`)) {
            try {
                const response = await api.delete(`/movies/${movie.id}`);
                if (response.data.deletedCount > 0 || response.data.message.includes('success')) {
                    fetchMovies();
                } else {
                    alert('Failed to delete: Movie not found or already deleted.');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
                alert(`Error deleting movie: ${errorMessage}`);
            }
        }
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <div>
                    <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>Manage Movies</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                        Total: {movies.length} movies
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Cancel' : '+ Add Movie'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAdd} style={{
                    marginBottom: 'var(--spacing-xl)',
                    padding: 'var(--spacing-lg)',
                    background: 'var(--color-bg-glass)',
                    borderRadius: 'var(--border-radius-md)',
                    border: 'var(--border-glass)'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>Title *</label>
                            <input type="text" value={newMovie.title} onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })} required
                                style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-secondary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>Director *</label>
                            <select value={newMovie.director} onChange={(e) => setNewMovie({ ...newMovie, director: e.target.value })} required
                                style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-secondary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)' }}>
                                <option value="">Select a director</option>
                                {directors.map(dir => (
                                    <option key={dir.name} value={dir.name}>{dir.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>Year *</label>
                            <input type="number" value={newMovie.releaseYear} onChange={(e) => setNewMovie({ ...newMovie, releaseYear: e.target.value })} required
                                style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-secondary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>Runtime (min) *</label>
                            <input type="number" value={newMovie.runtime} onChange={(e) => setNewMovie({ ...newMovie, runtime: e.target.value })} required
                                style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-secondary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>Rating (0-10)</label>
                            <input type="number" step="0.1" value={newMovie.rating} onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
                                style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-secondary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)' }} />
                        </div>
                    </div>
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>Genres * (select at least one)</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: 'var(--spacing-sm)',
                            padding: 'var(--spacing-md)',
                            background: 'var(--color-bg-secondary)',
                            borderRadius: 'var(--border-radius-sm)',
                            border: 'var(--border-glass)'
                        }}>
                            {genres.map(genre => (
                                <label key={genre.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedGenres.includes(genre.name)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedGenres([...selectedGenres, genre.name]);
                                            } else {
                                                setSelectedGenres(selectedGenres.filter(g => g !== genre.name));
                                            }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>{genre.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>Plot *</label>
                        <textarea value={newMovie.plot} onChange={(e) => setNewMovie({ ...newMovie, plot: e.target.value })} required rows="3"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-secondary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)', fontFamily: 'inherit' }} />
                    </div>
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>Poster URL</label>
                        <input type="url" value={newMovie.poster} onChange={(e) => setNewMovie({ ...newMovie, poster: e.target.value })} placeholder="https://image.tmdb.org/t/p/w500/..."
                            style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-secondary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)' }} />
                    </div>
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>Backdrop URL</label>
                        <input type="url" value={newMovie.backdrop} onChange={(e) => setNewMovie({ ...newMovie, backdrop: e.target.value })} placeholder="https://image.tmdb.org/t/p/original/..."
                            style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-secondary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>Add Movie</button>
                </form>
            )}

            {loading ? (
                <div className="loading">Loading movies...</div>
            ) : (
                <div className="movie-grid">
                    {movies.map((movie) => (
                        <div key={movie.id} className="movie-card" style={{ position: 'relative' }}>
                            <div className="movie-card-poster">
                                <img src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'} alt={movie.title} />
                            </div>

                            {movie.rating && (
                                <div className="movie-card-rating">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                    {movie.avgRating?.toFixed(1) || movie.rating?.toFixed(1)}
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

                                <div style={{
                                    marginTop: 'var(--spacing-md)',
                                    display: 'flex',
                                    gap: 'var(--spacing-sm)',
                                    flexWrap: 'wrap'
                                }}>
                                    <Link
                                        to={`/movie/${movie.id}`}
                                        className="btn btn-ghost"
                                        style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                                    >
                                        View
                                    </Link>
                                    <button
                                        onClick={() => setEditingMovie(movie)}
                                        className="btn btn-ghost"
                                        style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(movie)}
                                        className="btn btn-ghost"
                                        style={{
                                            fontSize: 'var(--font-size-xs)',
                                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                                            color: 'var(--color-error)'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <MovieEditModal
                isOpen={!!editingMovie}
                onClose={() => setEditingMovie(null)}
                onSave={handleEditSave}
                movie={editingMovie}
                directors={directors}
                genres={genres}
            />
        </div>
    );
}

export default MoviesManager;
