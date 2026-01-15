import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import DataTable from '../../components/admin/DataTable';
import EditModal from '../../components/admin/EditModal';

function GenresManager() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // Safe error extraction
    const getErrorMessage = (error) => {
        return error.response?.data?.message || error.message || 'Unknown error';
    };

    const [editingGenre, setEditingGenre] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchGenres();
    }, [user, navigate]);

    const fetchGenres = async () => {
        try {
            const response = await api.get('/admin/genres');
            setGenres(response.data);
        } catch (error) {
            console.error('Error fetching genres:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/genres', { name: newName });
            setNewName('');
            setShowAddForm(false);
            fetchGenres();
        } catch (error) {
            alert('Error adding genre: ' + getErrorMessage(error));
        }
    };

    const handleEditClick = (genre) => {
        setEditingGenre(genre);
    };

    const handleEditSave = async (newName) => {
        console.log('handleEditSave called with newName:', newName, 'editingGenre:', editingGenre);
        if (newName && newName !== editingGenre.name) {
            try {
                console.log('Updating genre:', editingGenre.name, 'to:', newName);
                await api.put('/admin/genres', { currentName: editingGenre.name, newName });
                console.log('Update successful');
                fetchGenres();
                setEditingGenre(null);
            } catch (error) {
                console.error('Update error:', error);
                alert('Error updating genre: ' + getErrorMessage(error));
            }
        } else {
            console.log('No changes, closing modal');
            setEditingGenre(null);
        }
    };

    const handleDelete = async (genre) => {
        console.log('handleDelete called with genre:', genre);
        if (window.confirm(`Delete genre "${genre.name}"?`)) {
            try {
                console.log('Deleting genre:', genre.name);
                const response = await api.delete('/admin/genres', { params: { name: genre.name } });

                if (response.data.deletedCount > 0) {
                    console.log('Delete successful');
                    fetchGenres();
                } else {
                    alert('Failed to delete: Genre not found or already deleted.');
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('Error deleting genre: ' + getErrorMessage(error));
            }
        }
    };

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'movieCount', label: 'Movies' }
    ];

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>Manage Genres</h1>
                <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? 'Cancel' : '+ Add Genre'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAdd} style={{ marginBottom: 'var(--spacing-xl)', padding: 'var(--spacing-lg)', background: 'var(--color-bg-glass)', borderRadius: 'var(--border-radius-md)', border: 'var(--border-glass)' }}>
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Genre name" required
                        style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-secondary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }} />
                    <button type="submit" className="btn btn-primary">Add Genre</button>
                </form>
            )}

            {loading ? <div className="loading">Loading genres...</div> : <DataTable data={genres} columns={columns} onEdit={handleEditClick} onDelete={handleDelete} />}

            <EditModal
                isOpen={!!editingGenre}
                onClose={() => setEditingGenre(null)}
                onSave={handleEditSave}
                title="Edit Genre"
                initialValue={editingGenre?.name || ''}
            />
        </div>
    );
}

export default GenresManager;
