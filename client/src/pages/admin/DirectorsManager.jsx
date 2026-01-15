import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import DataTable from '../../components/admin/DataTable';
import EditModal from '../../components/admin/EditModal';

function DirectorsManager() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [directors, setDirectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // Safe error extraction
    const getErrorMessage = (error) => {
        return error.response?.data?.message || error.message || 'Unknown error';
    };

    const [editingDirector, setEditingDirector] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchDirectors();
    }, [user, navigate]);

    const fetchDirectors = async () => {
        try {
            const response = await api.get('/admin/directors');
            setDirectors(response.data);
        } catch (error) {
            console.error('Error fetching directors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/directors', { name: newName });
            setNewName('');
            setShowAddForm(false);
            fetchDirectors();
        } catch (error) {
            alert('Error adding director: ' + getErrorMessage(error));
        }
    };

    const handleEditClick = (director) => {
        setEditingDirector(director);
    };

    const handleEditSave = async (newName) => {
        if (newName && newName !== editingDirector.name) {
            try {
                await api.put('/admin/directors', { currentName: editingDirector.name, newName });
                fetchDirectors();
                setEditingDirector(null);
            } catch (error) {
                alert('Error updating director: ' + getErrorMessage(error));
            }
        } else {
            setEditingDirector(null);
        }
    };

    const handleDelete = async (director) => {
        if (window.confirm(`Delete director "${director.name}"?`)) {
            try {
                const response = await api.delete('/admin/directors', { params: { name: director.name } });
                if (response.data.deletedCount > 0) {
                    fetchDirectors();
                } else {
                    alert('Failed to delete: Director not found or already deleted.');
                }
            } catch (error) {
                alert('Error deleting director: ' + getErrorMessage(error));
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
                <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>Manage Directors</h1>
                <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? 'Cancel' : '+ Add Director'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAdd} style={{ marginBottom: 'var(--spacing-xl)', padding: 'var(--spacing-lg)', background: 'var(--color-bg-glass)', borderRadius: 'var(--border-radius-md)', border: 'var(--border-glass)' }}>
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Director name" required
                        style={{ width: '100%', padding: 'var(--spacing-sm)', background: 'var(--color-bg-secondary)', border: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }} />
                    <button type="submit" className="btn btn-primary">Add Director</button>
                </form>
            )}

            {loading ? <div className="loading">Loading directors...</div> : <DataTable data={directors} columns={columns} onEdit={handleEditClick} onDelete={handleDelete} />}

            <EditModal
                isOpen={!!editingDirector}
                onClose={() => setEditingDirector(null)}
                onSave={handleEditSave}
                title="Edit Director"
                initialValue={editingDirector?.name || ''}
            />
        </div>
    );
}

export default DirectorsManager;
