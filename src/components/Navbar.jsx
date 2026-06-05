// Navbar — top navigation bar with links and auth actions
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Leaf, Menu, X, LogOut, LayoutDashboard, PlusCircle, List } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  // Helper to apply active link styles
  const linkClass = (path) =>
    `text-sm font-medium transition-colors duration-150 ${
      location.pathname === path
        ? 'text-primary-700 font-semibold'
        : 'text-neutral-600 hover:text-primary-700'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setMenuOpen(false)}>
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-neutral-900">
              Food<span className="text-primary-600">Bridge</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className={linkClass('/')}>Home</Link>
            <Link to="/listings" className={linkClass('/listings')}>Available Food</Link>

            {/* Provider links */}
            {user?.role === 'provider' && (
              <Link to="/donate" className={linkClass('/donate')}>Donate Food</Link>
            )}

            {/* NGO links */}
            {user?.role === 'ngo' && (
              <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
            )}
          </nav>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Role badge */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  user.role === 'provider'
                    ? 'bg-accent-100 text-accent-700'
                    : 'bg-primary-100 text-primary-700'
                }`}>
                  {user.role === 'provider' ? 'Provider' : 'NGO'}
                </span>
                <span className="text-sm text-neutral-700 font-medium">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-neutral-600 hover:text-primary-700 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pb-4 pt-2 space-y-1">
          <MobileLink to="/" icon={<Leaf className="w-4 h-4" />} onClick={() => setMenuOpen(false)}>Home</MobileLink>
          <MobileLink to="/listings" icon={<List className="w-4 h-4" />} onClick={() => setMenuOpen(false)}>Available Food</MobileLink>

          {user?.role === 'provider' && (
            <MobileLink to="/donate" icon={<PlusCircle className="w-4 h-4" />} onClick={() => setMenuOpen(false)}>Donate Food</MobileLink>
          )}
          {user?.role === 'ngo' && (
            <MobileLink to="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} onClick={() => setMenuOpen(false)}>Dashboard</MobileLink>
          )}

          <div className="pt-2 border-t border-neutral-100">
            {user ? (
              <div className="space-y-2">
                <p className="text-sm text-neutral-500 px-3">Signed in as <strong>{user.name}</strong></p>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link to="/login" className="btn-secondary text-center text-sm" onClick={() => setMenuOpen(false)}>Log in</Link>
                <Link to="/register" className="btn-primary text-center text-sm" onClick={() => setMenuOpen(false)}>Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// Helper component for mobile nav items
function MobileLink({ to, icon, children, onClick }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-primary-50 text-primary-700' : 'text-neutral-700 hover:bg-neutral-50'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
