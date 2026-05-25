import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isAuthenticated = Boolean(localStorage.getItem('authToken'));

  const closeMenu = () => setIsOpen(false);

  const handleAuthClick = () => {
    if (isAuthenticated) {
      localStorage.removeItem('authToken');
      window.dispatchEvent(new Event('auth:changed'));
      closeMenu();
      navigate('/');
      return;
    }

    closeMenu();
    navigate('/login');
  };

  return (
    <div className="nav-shell">
      <nav className="navbar glass-panel">
        <div className="navbar-brand">
          <Link to="/" className="brand-link" onClick={closeMenu}>
            Audio Player
          </Link>
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`navbar-links ${isOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>
            Home
          </Link>
          <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
            Dashboard
          </Link>
          <button
            type="button"
            className="glass-button glass-button-primary"
            onClick={handleAuthClick}
          >
            {isAuthenticated ? 'Logout' : 'Login'}
          </button>
        </div>
      </nav>
    </div>
  );
};