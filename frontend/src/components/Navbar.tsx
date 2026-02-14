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
      <nav className="sticky top-0 z-50 border-b border-slate-700/70 bg-slate-900/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={getLogoDestination()} className="flex items-center space-x-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/30 text-sm font-bold text-indigo-100">
              T
            </span>
            <span className="text-xl font-bold text-slate-100">Thuto</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/courses"
              className="rounded-md px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
            >
              Courses
            </Link>

            {isAuthenticated ? (
              <>
                {isStudent ? (
                  <Link
                    to="/dashboard"
                    className="rounded-md px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
                  >
                    Dashboard
                  </Link>
                ) : null}

                {isInstructor ? (
                  <Link
                    to="/tutor-dashboard"
                    className="rounded-md px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
                  >
                    Teach
                  </Link>
                ) : null}

                <div className="relative group">
                  <button className="flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-indigo-400/50 hover:text-white">
                    {user?.profileImage ? (
                      <img
                        src={`${user.profileImage}`}
                        alt={user.firstName}
                        className="h-8 w-8 rounded-full border border-slate-600 object-cover"
                      />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/30 text-indigo-200">
                        {user?.firstName?.charAt(0)}
                      </span>
                    )}
                    <span>
                      {user?.firstName} {user?.lastName}
                    </span>
                  </button>
                  
                  <div className="invisible absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-700 bg-slate-800 py-1 opacity-0 shadow-lg transition-all duration-300 group-hover:visible group-hover:opacity-100">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/80"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/80"
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
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_18px_rgba(99,102,241,0.45)] transition hover:bg-indigo-400"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-md p-2 text-slate-300 hover:text-white"
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

        {isMenuOpen && (
          <div className="border-t border-slate-700/70 bg-slate-900 md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              <Link
                to="/courses"
                className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Courses
              </Link>

              {isAuthenticated ? (
                <>
                  {isStudent ? (
                    <Link
                      to="/dashboard"
                      className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  ) : null}

                  {isInstructor ? (
                    <Link
                      to="/tutor-dashboard"
                      className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Teach
                    </Link>
                  ) : null}

                  <Link
                    to="/profile"
                    className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
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
