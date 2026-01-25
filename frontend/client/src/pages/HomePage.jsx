// frontend/client/src/pages/HomePage.jsx

import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { user, isAdmin } = useAuth();

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
      <p>Djole, jesi li to ti 😅</p>
    </div>
  );
}

export default HomePage;