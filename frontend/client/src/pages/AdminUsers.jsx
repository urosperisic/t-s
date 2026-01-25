// frontend/client/src/pages/AdminUsers.jsx

import { useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await authAPI.listUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Delete user ${username}?`)) {
      return;
    }

    try {
      await authAPI.deleteUser(userId);
      setMessage({ type: 'success', text: 'User deleted successfully' });
      fetchUsers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="loading" role="status" aria-live="polite">
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="message message-error" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-title">Users</h1>
      </header>

      {message.text && (
        <div
          className={`message message-${message.type}`}
          role="alert"
          aria-live="polite"
        >
          {message.text}
        </div>
      )}

      {users.length === 0 ? (
        <div className="empty-state">No users found.</div>
      ) : (
        <div className="users-list">
          {users.map((user) => (
            <div key={user.id} className="user-item">
              <span className="user-email">{user.email}</span>
              {user.id !== currentUser.id && (
                <button
                  onClick={() => handleDelete(user.id, user.username)}
                  className="btn btn-danger btn-small"
                  type="button"
                  aria-label={`Delete user ${user.username}`}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminUsers;