// Navbar — top navigation bar with notification center, profile modal, and role dashboards
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationCenter from './NotificationCenter.jsx';
import ProfileModal from './ProfileModal.jsx';
import {
  Leaf, Menu, X, LogOut, PlusCircle,
  List, Heart, User
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const linkClass = (path) =>
    `text-sm font-medium transition-all duration-150 px-2.5 py-1.5 rounded-lg ${
      location.pathname === path
        ? 'text-primary-700 bg-primary-50 font-bold'
        : 'text-neutral-600 hover:text-primary-700 hover:bg-neutral-50'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group"
              onClick={() => setMenuOpen(false)}
            >
              <div className="w-9 h-9 bg-gradient-to-tr from-primary-700 to-primary-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-extrabold text-neutral-900 leading-tight">
                  Food<span className="text-primary-600">Bridge</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">
                  2.0 Live Network
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-2">
              <Link to="/" className={linkClass('/')}>
                Home
              </Link>
              <Link to="/listings" className={linkClass('/listings')}>
                Available Food
              </Link>
              <Link to="/requests" className={linkClass('/requests')}>
                Food Requests
              </Link>

              {/* Provider Links */}
              {user?.role === 'provider' && (
                <>
                  <Link to="/donate" className={linkClass('/donate')}>
                    + Post Food
                  </Link>
                  <Link to="/provider-dashboard" className={linkClass('/provider-dashboard')}>
                    Provider Dashboard
                  </Link>
                </>
              )}

              {/* NGO Links */}
              {user?.role === 'ngo' && (
                <Link to="/dashboard" className={linkClass('/dashboard')}>
                  NGO Dashboard
                </Link>
              )}
            </nav>

            {/* Desktop Auth & Actions */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  {/* Notification Center Popover */}
                  <NotificationCenter />

                  {/* Profile Trigger */}
                  <button
                    onClick={() => setProfileOpen(true)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-neutral-200 hover:border-primary-400 hover:bg-neutral-50 transition-all text-left"
                    title="Edit Profile & Impact"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-800 leading-tight max-w-[120px] truncate">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                        {user.role}
                      </span>
                    </div>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-neutral-700 hover:text-primary-700 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4 shadow-sm">
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions: Notifications + Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              {user && <NotificationCenter />}
              <button
                className="p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white px-4 pb-6 pt-3 space-y-1.5 animate-fadeIn">
            <MobileLink to="/" icon={<Leaf className="w-4 h-4" />} onClick={() => setMenuOpen(false)}>
              Home
            </MobileLink>
            <MobileLink
              to="/listings"
              icon={<List className="w-4 h-4" />}
              onClick={() => setMenuOpen(false)}
            >
              Available Food
            </MobileLink>
            <MobileLink
              to="/requests"
              icon={<Heart className="w-4 h-4" />}
              onClick={() => setMenuOpen(false)}
            >
              Community Food Requests
            </MobileLink>

            {user?.role === 'provider' && (
              <>
                <MobileLink
                  to="/donate"
                  icon={<PlusCircle className="w-4 h-4" />}
                  onClick={() => setMenuOpen(false)}
                >
                  Post Food Donation
                </MobileLink>
                <MobileLink
                  to="/provider-dashboard"
                  icon={<LayoutDashboard className="w-4 h-4" />}
                  onClick={() => setMenuOpen(false)}
                >
                  Provider Dashboard
                </MobileLink>
              </>
            )}

            {user?.role === 'ngo' && (
              <MobileLink
                to="/dashboard"
                icon={<LayoutDashboard className="w-4 h-4" />}
                onClick={() => setMenuOpen(false)}
              >
                NGO Dashboard
              </MobileLink>
            )}

            <div className="pt-3 border-t border-neutral-100">
              {user ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setProfileOpen(true);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm bg-neutral-50 rounded-xl text-neutral-800 font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary-600" />
                      {user.name} ({user.role})
                    </span>
                    <span className="text-xs text-primary-600 font-semibold">Edit Profile →</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    to="/login"
                    className="btn-secondary text-center text-sm py-2.5"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-center text-sm py-2.5"
                    onClick={() => setMenuOpen(false)}
                  >
                    Join FoodBridge
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Profile Modal */}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </>
  );
}

function MobileLink({ to, icon, children, onClick }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
        active ? 'bg-primary-50 text-primary-700' : 'text-neutral-700 hover:bg-neutral-50'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
