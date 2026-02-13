import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const isStudent = user?.role === 'Student';
  const isInstructor = user?.role === 'Tutor' || user?.role === 'Admin';

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    logout();
    toast.success('User logout successfully.');
    setIsLogoutModalOpen(false);
    navigate('/');
  };

  const cancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const getLogoDestination = () => {
    const role = user?.role;

    if (role === 'Student') return '/dashboard';
    if (role === 'Tutor' || role === 'Admin') return '/tutor-dashboard';
    return '/';
  };

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={getLogoDestination()} className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-800">Thuto</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/courses"
              className="text-gray-600 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
            >
              Courses
            </Link>

            {isAuthenticated ? (
              <>
                {isStudent ? (
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                ) : null}

                {isInstructor ? (
                  <Link
                    to="/tutor-dashboard"
                    className="text-gray-600 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Teach
                  </Link>
                ) : null}

                {/* User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium">
                    {user?.profileImage ? (
                      <img
                        src={`${user.profileImage}`}
                        alt={user.firstName}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        {user?.firstName?.charAt(0)}
                      </span>
                    )}
                    <span>
                      {user?.firstName} {user?.lastName}
                    </span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600"
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
              className="text-gray-600 hover:text-blue-500 p-2"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/courses"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-500 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Courses
              </Link>

              {isAuthenticated ? (
                <>
                  {isStudent ? (
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-500 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  ) : null}

                  {isInstructor ? (
                    <Link
                      to="/tutor-dashboard"
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-500 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Teach
                    </Link>
                  ) : null}

                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-500 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-500 hover:bg-gray-50 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-500 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-500 hover:bg-gray-50 rounded-md"
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

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="px-6 pt-6 pb-5 text-center">
              <h3 className="text-2xl font-bold text-red-500">Logout</h3>
              <p className="mt-3 text-lg text-gray-700">Are you sure you want to logout?</p>
            </div>
            <div className="flex border-t border-gray-200">
              <button
                onClick={cancelLogout}
                className="w-1/2 border-r border-gray-200 py-3 text-xl font-medium text-gray-500 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="w-1/2 py-3 text-xl font-semibold text-indigo-500 transition-colors hover:bg-gray-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
