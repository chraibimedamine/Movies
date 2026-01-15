import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import DataTable from '../../components/admin/DataTable';
import EditModal from '../../components/admin/EditModal';

function UsersManager() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Safe error extraction
    const getErrorMessage = (error) => {
        return error.response?.data?.message || error.message || 'Unknown error';
    };

    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [user, navigate]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (userData) => {
        setEditingUser(userData);
    };

    const handleEditSave = async (newRole) => {
        if (newRole && newRole !== editingUser.role) {
            try {
                await api.put(`/admin/users/${encodeURIComponent(editingUser.id)}`, { role: newRole });
                fetchUsers();
                setEditingUser(null);
            } catch (error) {
                alert('Error updating user: ' + getErrorMessage(error));
            }
        } else {
            setEditingUser(null);
        }
    };

    const handleDelete = async (userData) => {
        if (window.confirm(`Delete user "${userData.username}"? This will remove all their reviews.`)) {
            try {
                const response = await api.delete(`/admin/users/${encodeURIComponent(userData.id)}`);
                if (response.data.deletedCount > 0) {
                    fetchUsers();
                } else {
                    alert('Failed to delete: User not found or already deleted.');
                }
            } catch (error) {
                alert('Error deleting user: ' + getErrorMessage(error));
            }
        }
    };


    const columns = [
        { key: 'username', label: 'Username' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'reviewCount', label: 'Reviews' }
    ];

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>Manage Users</h1>
            </div>

            {loading ? <div className="loading">Loading users...</div> : <DataTable data={users} columns={columns} onEdit={handleEditClick} onDelete={handleDelete} />}

            <EditModal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                onSave={handleEditSave}
                title={`Edit Role for ${editingUser?.username}`}
                initialValue={editingUser?.role || 'user'}
                type="select"
                options={[
                    { value: 'user', label: 'User' },
                    { value: 'admin', label: 'Admin' }
                ]}
            />
        </div>
    );
}

export default UsersManager;
