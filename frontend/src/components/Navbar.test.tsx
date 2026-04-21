import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import * as useAuthModule from '../contexts/useAuth';

vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../contexts/useAuth');

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

beforeEach(() => {
  mockLogout.mockReset();
  mockNavigate.mockReset();
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const buildAuth = (overrides: Partial<ReturnType<typeof useAuthModule.useAuth>>) => ({
  user: null,
  loading: false,
  login: vi.fn(),
  register: vi.fn(),
  refreshUser: vi.fn(),
  logout: mockLogout,
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

const tutorUser = { ...studentUser, role: 'Tutor' as const, firstName: 'Bob' };
const adminUser = { ...studentUser, role: 'Admin' as const, firstName: 'Carol' };

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );

describe('Navbar - unauthenticated', () => {
  beforeEach(() => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(buildAuth({ isAuthenticated: false, user: null }));
  });

  it('renders Login and Sign Up links', () => {
    renderNavbar();
    expect(screen.getAllByRole('link', { name: 'Login' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Sign Up' }).length).toBeGreaterThan(0);
  });

  it('renders Courses link', () => {
    renderNavbar();
    const coursesLinks = screen.getAllByRole('link', { name: 'Courses' });
    expect(coursesLinks.length).toBeGreaterThan(0);
  });

  it('does not render Dashboard link', () => {
    renderNavbar();
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
  });

  it('logo links to /', () => {
    renderNavbar();
    const thutoLinks = screen.getAllByRole('link', { name: 'Thuto' });
    expect(thutoLinks[0]).toHaveAttribute('href', '/');
  });
});

describe('Navbar - authenticated Student', () => {
  beforeEach(() => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      buildAuth({ isAuthenticated: true, user: studentUser })
    );
  });

  it('renders Dashboard link for student', () => {
    renderNavbar();
    expect(screen.getAllByRole('link', { name: 'Dashboard' }).length).toBeGreaterThan(0);
  });

  it('does not render Login link', () => {
    renderNavbar();
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();
  });

  it('renders user name', () => {
    renderNavbar();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('logo links to /dashboard for student', () => {
    renderNavbar();
    const thutoLinks = screen.getAllByRole('link', { name: 'Thuto' });
    expect(thutoLinks[0]).toHaveAttribute('href', '/dashboard');
  });
});

describe('Navbar - authenticated Tutor', () => {
  beforeEach(() => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      buildAuth({ isAuthenticated: true, user: tutorUser })
    );
  });

  it('renders Teach link for tutor', () => {
    renderNavbar();
    expect(screen.getAllByRole('link', { name: 'Teach' }).length).toBeGreaterThan(0);
  });

  it('logo links to /tutor-dashboard', () => {
    renderNavbar();
    const thutoLinks = screen.getAllByRole('link', { name: 'Thuto' });
    expect(thutoLinks[0]).toHaveAttribute('href', '/tutor-dashboard');
  });
});

describe('Navbar - authenticated Admin', () => {
  beforeEach(() => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      buildAuth({ isAuthenticated: true, user: adminUser })
    );
  });

  it('renders Admin link', () => {
    renderNavbar();
    expect(screen.getAllByRole('link', { name: 'Admin' }).length).toBeGreaterThan(0);
  });

  it('renders Categories link for admin', () => {
    renderNavbar();
    expect(screen.getAllByRole('link', { name: 'Categories' }).length).toBeGreaterThan(0);
  });

  it('logo links to /admin-dashboard', () => {
    renderNavbar();
    const thutoLinks = screen.getAllByRole('link', { name: 'Thuto' });
    expect(thutoLinks[0]).toHaveAttribute('href', '/admin-dashboard');
  });
});

describe('Navbar - logout flow', () => {
  beforeEach(() => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      buildAuth({ isAuthenticated: true, user: studentUser })
    );
  });

  it('opens logout modal when logout button is clicked', async () => {
    const user = userEvent.setup();
    renderNavbar();

    // Click the desktop logout button (in the dropdown)
    const logoutBtns = screen.getAllByRole('button', { name: 'Logout' });
    await user.click(logoutBtns[0]);

    expect(screen.getByText('Are you sure you want to logout?')).toBeInTheDocument();
  });

  it('calls logout and navigates on confirm', async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getAllByRole('button', { name: 'Logout' })[0]);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('closes modal on cancel without calling logout', async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getAllByRole('button', { name: 'Logout' })[0]);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByText('Are you sure you want to logout?')).not.toBeInTheDocument();
    expect(mockLogout).not.toHaveBeenCalled();
  });
});

describe('Navbar - mobile menu', () => {
  beforeEach(() => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(buildAuth({ isAuthenticated: false, user: null }));
  });

  it('toggles mobile menu visibility on hamburger click', async () => {
    const user = userEvent.setup();
    renderNavbar();

    // Mobile menu initially hidden (md:hidden parent)
    const hamburger = screen.getAllByRole('button')[0];
    await user.click(hamburger);

    // After click, mobile nav links appear
    const mobileLogins = screen.getAllByRole('link', { name: 'Login' });
    expect(mobileLogins.length).toBeGreaterThan(1);
  });
});