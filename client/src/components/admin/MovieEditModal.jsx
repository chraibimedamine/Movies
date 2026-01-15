import React, { useState, useEffect } from 'react';

function MovieEditModal({ isOpen, onClose, onSave, movie, directors, genres }) {
    const [formData, setFormData] = useState({
        title: '',
        plot: '',
        releaseYear: new Date().getFullYear(),
        runtime: '',
        rating: '',
        poster: '',
        backdrop: '',
        director: '',
        genres: []
    });

    useEffect(() => {
        if (movie) {
            setFormData({
                title: movie.title || '',
                plot: movie.plot || '',
                releaseYear: movie.releaseYear || new Date().getFullYear(),
                runtime: movie.runtime || '',
                rating: movie.rating || '',
                poster: movie.poster || '',
                backdrop: movie.backdrop || '',
                director: movie.director || '',
                genres: movie.genres || []
            });
        }
    }, [movie, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            releaseYear: parseInt(formData.releaseYear),
            runtime: parseInt(formData.runtime),
            rating: parseFloat(formData.rating) || 0
        });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'var(--color-bg-secondary)',
                padding: 'var(--spacing-xl)',
                borderRadius: 'var(--border-radius-lg)',
                border: 'var(--border-glass)',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}>
                <h2 style={{ marginBottom: 'var(--spacing-lg)', fontSize: 'var(--font-size-xl)' }}>Edit Movie</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>Title *</label>
                            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required
                                style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-primary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>Director *</label>
                            <select value={formData.director} onChange={(e) => setFormData({ ...formData, director: e.target.value })} required
                                style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-primary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)' }}>
                                <option value="">Select a director</option>
                                {directors.map(dir => (
                                    <option key={dir.name} value={dir.name}>{dir.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>Year *</label>
                            <input type="number" value={formData.releaseYear} onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })} required
                                style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-primary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>Runtime (min) *</label>
                            <input type="number" value={formData.runtime} onChange={(e) => setFormData({ ...formData, runtime: e.target.value })} required
                                style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-primary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>Rating (0-10)</label>
                            <input type="number" step="0.1" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-primary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)' }} />
                        </div>
                    </div>

                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>Genres *</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                            gap: 'var(--spacing-sm)',
                            padding: 'var(--spacing-md)',
                            background: 'var(--color-bg-primary)',
                            borderRadius: 'var(--border-radius-sm)',
                            border: 'var(--border-glass)',
                            maxHeight: '150px',
                            overflowY: 'auto'
                        }}>
                            {genres.map(genre => (
                                <label key={genre.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.genres.includes(genre.name)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFormData({ ...formData, genres: [...formData.genres, genre.name] });
                                            } else {
                                                setFormData({ ...formData, genres: formData.genres.filter(g => g !== genre.name) });
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
                        <textarea value={formData.plot} onChange={(e) => setFormData({ ...formData, plot: e.target.value })} required rows="3"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-primary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)', fontFamily: 'inherit' }} />
                    </div>

                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>Poster URL</label>
                        <input type="url" value={formData.poster} onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                            style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-primary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)' }} />
                    </div>

                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>Backdrop URL</label>
                        <input type="url" value={formData.backdrop} onChange={(e) => setFormData({ ...formData, backdrop: e.target.value })}
                            style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-primary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                        <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MovieEditModal;
