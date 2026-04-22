import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import * as useAuthModule from '../../contexts/useAuth';

vi.mock('../../contexts/useAuth');

const buildAuth = (overrides: Partial<ReturnType<typeof useAuthModule.useAuth>>) => ({
  user: null,
  loading: false,
  login: vi.fn(),
  register: vi.fn(),
  refreshUser: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: false,
  ...overrides,
});

const studentUser = {
  _id: '1',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  role: 'Student' as const,
  isVerified: true,
};

const renderRoute = (children: React.ReactNode, allowedRoles?: string[]) =>
  render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute allowedRoles={allowedRoles}>{children}</ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  it('shows loading spinner while auth is loading', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(buildAuth({ loading: true }));
    const { container } = renderRoute(<div>Protected Content</div>);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      buildAuth({ isAuthenticated: false, loading: false, user: null })
    );
    renderRoute(<div>Protected Content</div>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated and no role restriction', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      buildAuth({ isAuthenticated: true, loading: false, user: studentUser })
    );
    renderRoute(<div>Protected Content</div>);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when user role is in allowedRoles', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      buildAuth({ isAuthenticated: true, loading: false, user: studentUser })
    );
    renderRoute(<div>Student Area</div>, ['Student']);
    expect(screen.getByText('Student Area')).toBeInTheDocument();
  });

  it('redirects to / when user role is not in allowedRoles', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      buildAuth({
        isAuthenticated: true,
        loading: false,
        user: { ...studentUser, role: 'Student' },
      })
    );
    renderRoute(<div>Admin Area</div>, ['Admin']);
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Area')).not.toBeInTheDocument();
  });

  it('renders children for admin when Admin is in allowedRoles', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      buildAuth({
        isAuthenticated: true,
        loading: false,
        user: { ...studentUser, role: 'Admin' },
      })
    );
    renderRoute(<div>Admin Area</div>, ['Admin']);
    expect(screen.getByText('Admin Area')).toBeInTheDocument();
  });

  it('renders children when allowedRoles includes multiple roles and user matches', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      buildAuth({
        isAuthenticated: true,
        loading: false,
        user: { ...studentUser, role: 'Tutor' },
      })
    );
    renderRoute(<div>Tutor or Admin Area</div>, ['Tutor', 'Admin']);
    expect(screen.getByText('Tutor or Admin Area')).toBeInTheDocument();
  });

  it('redirects to /login after loading completes and user is unauthenticated', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      buildAuth({ loading: false, isAuthenticated: false, user: null })
    );
    renderRoute(<div>Protected Content</div>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});