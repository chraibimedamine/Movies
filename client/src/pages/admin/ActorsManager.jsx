import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import DataTable from '../../components/admin/DataTable';
import EditModal from '../../components/admin/EditModal';

function ActorsManager() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [actors, setActors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingActor, setEditingActor] = useState(null);
    const [newActorName, setNewActorName] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchActors();
    }, [user, navigate]);

    const fetchActors = async () => {
        try {
            const response = await api.get('/admin/actors');
            setActors(response.data);
        } catch (error) {
            console.error('Error fetching actors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/actors', { name: newActorName });
            setNewActorName('');
            setShowAddForm(false);
            fetchActors();
        } catch (error) {
            alert('Error adding actor: ' + error.response?.data?.message);
        }
    };

    const handleEditClick = (actor) => {
        setEditingActor(actor);
    };

    const handleEditSave = async (newName) => {
        if (newName && newName !== editingActor.name) {
            try {
                await api.put(`/admin/actors/${encodeURIComponent(editingActor.name)}`, { newName });
                fetchActors();
                setEditingActor(null);
            } catch (error) {
                alert('Error updating actor: ' + error.response?.data?.message);
            }
        } else {
            setEditingActor(null);
        }
    };

    const handleDelete = async (actor) => {
        if (window.confirm(`Delete actor "${actor.name}"? This will remove all relationships.`)) {
            try {
                await api.delete(`/admin/actors/${encodeURIComponent(actor.name)}`);
                fetchActors();
            } catch (error) {
                alert('Error deleting actor: ' + error.response?.data?.message);
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
                <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>Manage Actors</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Cancel' : '+ Add Actor'}
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
                    <input
                        type="text"
                        value={newActorName}
                        onChange={(e) => setNewActorName(e.target.value)}
                        placeholder="Actor name"
                        required
                        style={{
                            width: '100%',
                            padding: 'var(--spacing-sm)',
                            background: 'var(--color-bg-secondary)',
                            border: 'var(--border-glass)',
                            borderRadius: 'var(--border-radius-sm)',
                            color: 'var(--color-text-primary)',
                            marginBottom: 'var(--spacing-sm)'
                        }}
                    />
                    <button type="submit" className="btn btn-primary">Add Actor</button>
                </form>
            )}

            {loading ? (
                <div className="loading">Loading actors...</div>
            ) : (
                <DataTable
                    data={actors}
                    columns={columns}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                />
            )}

            <EditModal
                isOpen={!!editingActor}
                onClose={() => setEditingActor(null)}
                onSave={handleEditSave}
                title="Edit Actor"
                initialValue={editingActor?.name || ''}
            />
        </div>
    );
}

export default ActorsManager;
