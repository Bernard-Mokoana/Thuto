import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, BookOpen, GraduationCap, Settings, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-dark shadow-2xl sticky top-0 z-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover-lift">
            <GraduationCap className="h-8 w-8 text-primary animate-glow" />
            <span className="text-xl font-bold text-white">Thuto</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/courses"
              className="text-white/80 hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-all hover-lift"
            >
              Courses
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-white/80 hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-all hover-lift"
                >
                  Dashboard
                </Link>

                {user?.role === 'Tutor' || user?.role === 'Admin' ? (
                  <Link
                    to="/tutor-dashboard"
                    className="text-white/80 hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-all hover-lift"
                  >
                    Teach
                  </Link>
                ) : null}

                {/* User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-white/80 hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-all hover-lift">
                    <User className="h-5 w-5" />
                    <span>{user?.firstName}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 glass rounded-md shadow-2xl py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 animate-slide-up">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-accent transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-accent transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white/80 hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-all hover-lift"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/80 hover:text-accent p-2 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass border-t border-white/10">
              <Link
                to="/courses"
                className="block px-3 py-2 text-base font-medium text-white/90 hover:text-accent hover:bg-white/10 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Courses
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-base font-medium text-white/90 hover:text-accent hover:bg-white/10 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>

                  {user?.role === 'Tutor' || user?.role === 'Admin' ? (
                    <Link
                      to="/tutor-dashboard"
                      className="block px-3 py-2 text-base font-medium text-white/90 hover:text-accent hover:bg-white/10 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Teach
                    </Link>
                  ) : null}

                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-base font-medium text-white/90 hover:text-accent hover:bg-white/10 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-white/90 hover:text-accent hover:bg-white/10 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-base font-medium text-white/90 hover:text-accent hover:bg-white/10 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-base font-medium text-white/90 hover:text-accent hover:bg-white/10 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
