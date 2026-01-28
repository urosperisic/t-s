// frontend/client/src/pages/HomePage.jsx

import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';

function HomePage() {
  const { user, isAdmin, onlineUsers } = useAuth();
  const [animatingUsers, setAnimatingUsers] = useState(new Set());
  const prevUsersRef = useRef([]);

  useEffect(() => {
    const prevUserIds = new Set(prevUsersRef.current.map(u => u.id));
    const newUsers = onlineUsers.filter(u => !prevUserIds.has(u.id));

    if (newUsers.length > 0) {
      const newAnimatingSet = new Set(animatingUsers);
      newUsers.forEach(u => newAnimatingSet.add(u.id));
      setAnimatingUsers(newAnimatingSet);

      const timeout = setTimeout(() => {
        setAnimatingUsers(new Set());
      }, 800);

      return () => clearTimeout(timeout);
    }

    // Update previous users
    prevUsersRef.current = onlineUsers;
  }, [onlineUsers]);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Home</h1>
      </header>

      <div className="welcome">
        <p className="welcome-text" style={{ fontSize: '1.6rem', marginBottom: '0.8rem' }}>
          Welcome, {user?.username}
          {isAdmin && ' - admin'}
        </p>
        <p className="welcome-text">
          {isAdmin
            ? 'You have full access to manage content and users.'
            : 'Browse the documentation to learn more.'}
        </p>
      </div>
      
      <div style={{ marginTop: '3rem' }}>
        <p style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>
          Online users {onlineUsers.length}
        </p>
        {onlineUsers.length === 0 ? (
          <div className="empty-state">No users online</div>
        ) : (
          <div className="users-list">
            {onlineUsers.map((onlineUser) => (
              <div 
                key={onlineUser.id} 
                className={`user-item ${animatingUsers.has(onlineUser.id) ? 'new-user' : ''}`}
              >
                <span className="user-email">
                  {onlineUser.username}
                  {onlineUser.role === 'admin' && ' - admin'}
                </span>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: 'var(--c-accent)', 
                  borderRadius: '50%',
                  display: 'inline-block'
                }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;