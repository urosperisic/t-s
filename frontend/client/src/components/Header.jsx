// frontend/client/src/components/Header.jsx

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          T-S
        </Link>

        {user && (
          <nav className="nav" aria-label="Main navigation">
            <Link
              to="/docs"
              className={`nav-link ${isActive('/docs') ? 'active' : ''}`}
            >
              Docs
            </Link>

            {isAdmin && (
              <>
                <Link
                  to="/admin/content"
                  className={`nav-link ${isActive('/admin/content') ? 'active' : ''}`}
                >
                  Add Content
                </Link>
                <Link
                  to="/admin/users"
                  className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`}
                >
                  Users
                </Link>
              </>
            )}

            <button onClick={handleLogout} className="nav-link docs-nav-link" type="button">
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;