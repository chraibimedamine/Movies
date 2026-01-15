import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import api from '../services/api'

function ReviewSection({ movieId }) {
    const [reviews, setReviews] = useState([])
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [reviewText, setReviewText] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const { isAuthenticated } = useSelector((state) => state.auth)

    useEffect(() => {
        fetchReviews()
    }, [movieId])

    const fetchReviews = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/reviews/movie/${movieId}`)
            setReviews(response.data)
        } catch (error) {
            console.error('Failed to fetch reviews:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!rating || !reviewText.trim()) return

        setSubmitting(true)
        try {
            const response = await api.post(`/reviews/movie/${movieId}`, {
                rating,
                text: reviewText,
            })
            setReviews([response.data, ...reviews])
            setRating(0)
            setReviewText('')
        } catch (error) {
            console.error('Failed to submit review:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    return (
        <div className="reviews-section">
            <h2 className="movie-section-title">User Reviews</h2>

            {isAuthenticated ? (
                <form className="review-form" onSubmit={handleSubmit}>
                    <div className="review-form-header">
                        <span>Your Rating</span>
                        <div className="rating-input">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={star <= (hoverRating || rating) ? 'active' : ''}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                >
                                    <svg viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                </button>
                            ))}
                            {rating > 0 && <span style={{ marginLeft: '8px' }}>{rating}/10</span>}
                        </div>
                    </div>
                    <textarea
                        placeholder="Write your review..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting || !rating || !reviewText.trim()}
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            ) : (
                <div className="review-form" style={{ textAlign: 'center', padding: '32px' }}>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Please <a href="/login" style={{ color: 'var(--color-accent-primary)' }}>login</a> to write a review
                    </p>
                </div>
            )}

            {loading ? (
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <span>Loading reviews...</span>
                </div>
            ) : reviews.length > 0 ? (
                <div className="review-list">
                    {reviews.map((review, index) => (
                        <div key={review.id || index} className="review-card">
                            <div className="review-header">
                                <div className="review-user">
                                    <div className="review-avatar">
                                        {review.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <div className="review-username">{review.username || 'Anonymous'}</div>
                                        <div className="review-date">{formatDate(review.createdAt)}</div>
                                    </div>
                                </div>
                                <div className="review-rating">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                    <span>{review.rating}/10</span>
                                </div>
                            </div>
                            <p className="review-text">{review.text}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                    </svg>
                    <h3>No reviews yet</h3>
                    <p>Be the first to review this movie!</p>
                </div>
            )}
        </div>
    )
}

export default ReviewSection
