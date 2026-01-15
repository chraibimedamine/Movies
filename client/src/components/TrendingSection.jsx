import { useState } from 'react'
import MovieCard from './MovieCard'
import { motion, AnimatePresence } from 'framer-motion'

function TrendingSection({ trending }) {
    const [activeTab, setActiveTab] = useState('featured')

    const tabs = [
        { id: 'featured', label: 'Featured' },
        { id: 'highestRated', label: 'Top Rated' },
        { id: 'recentReleases', label: 'New Releases' },
        { id: 'mostViewed', label: 'Most Viewed' },
    ]

    const getMovies = () => {
        return trending[activeTab] || []
    }

    return (
        <section className="section">
            <div className="section-header">
                <h2 className="section-title">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
                    </svg>
                    Trending Movies
                </h2>
                <div className="trending-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`trending-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    className="trending-carousel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {getMovies().length > 0 ? (
                        getMovies().map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))
                    ) : (
                        <div className="empty-state" style={{ width: '100%' }}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                            </svg>
                            <h3>No trending movies yet</h3>
                            <p>Check back soon for trending content!</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </section>
    )
}

export default TrendingSection
