// frontend/client/src/pages/HomePage.jsx

import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';

function HomePage() {
  const { user, isAdmin, onlineUsers } = useAuth();
  const [animatingUsers, setAnimatingUsers] = useState(new Set());
  const prevUsersRef = useRef([]);

  useEffect(() => {
    // Pronađi nove usere (koji su se upravo ulogovali)
    const prevUserIds = new Set(prevUsersRef.current.map(u => u.id));
    const newUsers = onlineUsers.filter(u => !prevUserIds.has(u.id));

    if (newUsers.length > 0) {
      // Dodaj nove usere u animating set
      const newAnimatingSet = new Set(animatingUsers);
      newUsers.forEach(u => newAnimatingSet.add(u.id));
      setAnimatingUsers(newAnimatingSet);

      // Ukloni iz animating seta posle 800ms (dužina animacije)
      const timeout = setTimeout(() => {
        setAnimatingUsers(new Set());
      }, 800);

      return () => clearTimeout(timeout);
    }

    // Update previous users
    prevUsersRef.current = onlineUsers;
  }, [onlineUsers]);

  return (
    <div className="welcome">
      <h1 className="welcome-title">
        Welcome, {user?.username}
        {isAdmin && ' (Admin)'}
      </h1>
      <p className="welcome-text">
        {isAdmin
          ? 'You have full access to manage content and users.'
          : 'Browse the documentation to learn more.'}
      </p>
      
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>
          Online Users ({onlineUsers.length})
        </h2>
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
                  {onlineUser.role === 'admin' && ' (Admin)'}
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