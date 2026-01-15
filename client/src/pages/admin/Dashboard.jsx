import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';

function Dashboard() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, navigate]);

    if (loading) {
        return <div className="loading">Loading statistics...</div>;
    }

    return (
        <div className="container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <h1 style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-sm)' }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Manage your movie database
                    </p>
                </div>

                {/* Entity Management Cards */}
                <div className="admin-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-3xl)'
                }}>
                    <StatCard
                        title="Movies"
                        count={stats?.totals.movies || 0}
                        icon="🎬"
                        link="/admin/movies"
                    />
                    <StatCard
                        title="Actors"
                        count={stats?.totals.actors || 0}
                        icon="🎭"
                        link="/admin/actors"
                    />
                    <StatCard
                        title="Directors"
                        count={stats?.totals.directors || 0}
                        icon="🎬"
                        link="/admin/directors"
                    />
                    <StatCard
                        title="Genres"
                        count={stats?.totals.genres || 0}
                        icon="🏷️"
                        link="/admin/genres"
                    />
                    <StatCard
                        title="Users"
                        count={stats?.totals.users || 0}
                        icon="👤"
                        link="/admin/users"
                    />
                    <StatCard
                        title="Reviews"
                        count={stats?.totals.reviews || 0}
                        icon="⭐"
                        link="/admin/reviews"
                    />
                </div>

                {/* Charts Section */}
                {stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-xl)' }}>
                        <ChartCard title="Movies by Genre" data={stats.charts.moviesByGenre} type="genre" />
                        <ChartCard title="Movies by Year" data={stats.charts.moviesByYear} type="year" />
                        <ChartCard title="Top Directors" data={stats.charts.topDirectors} type="director" />
                        <ChartCard title="Top Rated Movies" data={stats.charts.topRated} type="rated" />
                    </div>
                )}
            </motion.div>
        </div>
    );
}

function StatCard({ title, count, icon, link }) {
    const navigate = useNavigate();

    return (
        <motion.div
            className="stat-card"
            onClick={() => navigate(link)}
            whileHover={{ scale: 1.02 }}
            style={{
                padding: 'var(--spacing-lg)',
                background: 'var(--color-bg-glass)',
                border: 'var(--border-glass)',
                borderRadius: 'var(--border-radius-md)',
                cursor: 'pointer',
                transition: 'var(--transition-normal)'
            }}
        >
            <div style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-sm)' }}>
                {icon}
            </div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '700', marginBottom: 'var(--spacing-xs)' }}>
                {count}
            </div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                {title}
            </div>
        </motion.div>
    );
}

function ChartCard({ title, data, type }) {
    const maxValue = Math.max(...data.map(item =>
        type === 'genre' || type === 'year' ? item.count :
            type === 'director' ? item.movieCount :
                type === 'rated' ? item.rating : 0
    ));

    return (
        <div style={{
            padding: 'var(--spacing-lg)',
            background: 'var(--color-bg-glass)',
            border: 'var(--border-glass)',
            borderRadius: 'var(--border-radius-md)'
        }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-lg)' }}>
                {title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {data.map((item, index) => {
                    const value = type === 'genre' || type === 'year' ? item.count :
                        type === 'director' ? item.movieCount :
                            type === 'rated' ? item.rating : 0;
                    const label = type === 'genre' ? item.genre :
                        type === 'year' ? item.year :
                            type === 'director' ? item.name :
                                type === 'rated' ? item.title : '';
                    const percentage = (value / maxValue) * 100;

                    return (
                        <div key={index} style={{ marginBottom: 'var(--spacing-xs)' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '4px',
                                fontSize: 'var(--font-size-sm)'
                            }}>
                                <span>{label}</span>
                                <span style={{ color: 'var(--color-accent-primary)' }}>
                                    {type === 'rated' ? value.toFixed(1) : value}
                                </span>
                            </div>
                            <div style={{
                                height: '8px',
                                background: 'var(--color-bg-secondary)',
                                borderRadius: 'var(--border-radius-full)',
                                overflow: 'hidden'
                            }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    style={{
                                        height: '100%',
                                        background: 'var(--color-accent-gradient)',
                                        borderRadius: 'var(--border-radius-full)'
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Dashboard;
