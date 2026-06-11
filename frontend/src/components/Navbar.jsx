import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `text-sm font-medium transition-colors ${
        isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
      }`
    }
  >
    {children}
  </NavLink>
);

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate   = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link to="/" className="flex items-center gap-2">
            <span className="text-primary-600 font-bold text-xl">MyEduConnect</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <NavItem to="/courses">Courses</NavItem>
            {isAuthenticated && !isAdmin && <NavItem to="/my-enrolments">My Learning</NavItem>}
            {isAdmin && <NavItem to="/admin">Admin</NavItem>}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <span className="text-sm text-gray-600 font-medium">{user?.username}</span>
                ) : (
                  <NavLink to="/profile" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                    {user?.username}
                  </NavLink>
                )}
                <button onClick={handleLogout} className="btn-secondary text-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn-secondary text-sm">Login</Link>
                <Link to="/register" className="btn-primary  text-sm">Sign Up</Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">Toggle menu</span>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-3 bg-white">
          <NavItem to="/courses">Courses</NavItem>
          {isAuthenticated && !isAdmin && <NavItem to="/my-enrolments">My Learning</NavItem>}
          {isAdmin && <NavItem to="/admin">Admin</NavItem>}
          {isAuthenticated ? (
            <>
              {!isAdmin && <NavItem to="/profile">Profile</NavItem>}
              <button onClick={handleLogout} className="text-left text-sm text-red-600 font-medium">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavItem to="/login">Login</NavItem>
              <NavItem to="/register">Sign Up</NavItem>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;


