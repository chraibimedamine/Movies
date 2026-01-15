import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import DataTable from '../../components/admin/DataTable';

function ReviewsManager() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchReviews();
    }, [user, navigate]);

    const fetchReviews = async () => {
        try {
            const response = await api.get('/admin/reviews');
            setReviews(response.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (review) => {
        if (window.confirm(`Delete review by ${review.username} for "${review.movieTitle}"?`)) {
            try {
                await api.delete(`/admin/reviews/${encodeURIComponent(review.id)}`);
                fetchReviews();
            } catch (error) {
                alert('Error deleting review: ' + error.response?.data?.message);
            }
        }
    };

    const columns = [
        { key: 'username', label: 'User' },
        { key: 'movieTitle', label: 'Movie' },
        { key: 'rating', label: 'Rating' },
        { key: 'text', label: 'Review' }
    ];

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>Manage Reviews</h1>
            </div>

            {loading ? <div className="loading">Loading reviews...</div> : <DataTable data={reviews} columns={columns} onDelete={handleDelete} />}
        </div>
    );
}

export default ReviewsManager;
