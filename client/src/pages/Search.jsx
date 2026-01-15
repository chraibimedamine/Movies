import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { fetchMovies, fetchGenres } from '../store/moviesSlice'
import MovieCard from '../components/MovieCard'

function Search() {
    const [searchParams, setSearchParams] = useSearchParams()
    const dispatch = useDispatch()
    const { movies, genres, loading, pagination } = useSelector((state) => state.movies)

    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
    const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '')
    const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || '')
    const [sortBy, setSortBy] = useState('releaseYear')

    useEffect(() => {
        dispatch(fetchGenres())
    }, [dispatch])

    useEffect(() => {
        const params = {}
        if (searchQuery) params.search = searchQuery
        if (selectedGenre) params.genre = selectedGenre
        if (selectedYear) params.year = selectedYear

        dispatch(fetchMovies(params))

        // Update URL params
        const newParams = new URLSearchParams()
        if (searchQuery) newParams.set('q', searchQuery)
        if (selectedGenre) newParams.set('genre', selectedGenre)
        if (selectedYear) newParams.set('year', selectedYear)
        setSearchParams(newParams)
    }, [dispatch, searchQuery, selectedGenre, selectedYear, setSearchParams])

    // Generate year options
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
    }

    const clearFilters = () => {
        setSearchQuery('')
        setSelectedGenre('')
        setSelectedYear('')
    }

    const sortedMovies = [...movies].sort((a, b) => {
        if (sortBy === 'releaseYear') return b.releaseYear - a.releaseYear
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
        if (sortBy === 'title') return a.title.localeCompare(b.title)
        return 0
    })

    return (
        <div className="container">
            <div className="search-page">
                {/* Filters Sidebar */}
                <aside className="search-filters">
                    <div className="filter-section">
                        <h3 className="filter-title">Search</h3>
                        <input
                            type="text"
                            placeholder="Search movies..."
                            value={searchQuery}
                            onChange={handleSearch}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                background: 'var(--color-bg-secondary)',
                                border: 'var(--border-glass)',
                                borderRadius: 'var(--border-radius-sm)',
                                color: 'var(--color-text-primary)',
                            }}
                        />
                    </div>

                    <div className="filter-section">
                        <h3 className="filter-title">Genre</h3>
                        <div className="filter-options">
                            <div className="filter-option">
                                <input
                                    type="radio"
                                    id="all-genres"
                                    name="genre"
                                    checked={!selectedGenre}
                                    onChange={() => setSelectedGenre('')}
                                />
                                <label htmlFor="all-genres">All Genres</label>
                            </div>
                            {genres.map((genre) => (
                                <div key={genre} className="filter-option">
                                    <input
                                        type="radio"
                                        id={`genre-${genre}`}
                                        name="genre"
                                        checked={selectedGenre === genre}
                                        onChange={() => setSelectedGenre(genre)}
                                    />
                                    <label htmlFor={`genre-${genre}`}>{genre}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3 className="filter-title">Year</h3>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                background: 'var(--color-bg-secondary)',
                                border: 'var(--border-glass)',
                                borderRadius: 'var(--border-radius-sm)',
                                color: 'var(--color-text-primary)',
                            }}
                        >
                            <option value="">All Years</option>
                            {years.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="btn btn-secondary"
                        onClick={clearFilters}
                        style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                    >
                        Clear Filters
                    </button>
                </aside>

                {/* Results */}
                <div className="search-results">
                    <div className="search-header">
                        <span className="search-count">
                            {loading ? 'Searching...' : `${pagination.total || movies.length} movies found`}
                        </span>
                        <div className="search-sort">
                            <label style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                Sort by:
                            </label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="releaseYear">Newest</option>
                                <option value="rating">Highest Rated</option>
                                <option value="title">Title (A-Z)</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading">
                            <div className="loading-spinner"></div>
                            <span>Searching movies...</span>
                        </div>
                    ) : sortedMovies.length > 0 ? (
                        <motion.div
                            className="movie-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {sortedMovies.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </motion.div>
                    ) : (
                        <div className="empty-state">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                            </svg>
                            <h3>No movies found</h3>
                            <p>Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Search
