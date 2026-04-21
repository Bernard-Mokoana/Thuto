import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import * as useAuthModule from '../contexts/useAuth';

vi.mock('../contexts/useAuth');
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockLogin = vi.fn();

const buildAuth = () => ({
  user: null,
  loading: false,
  login: mockLogin,
  register: vi.fn(),
  refreshUser: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: false,
});

beforeEach(() => {
  vi.mocked(useAuthModule.useAuth).mockReturnValue(buildAuth());
  mockLogin.mockReset();
  mockNavigate.mockReset();
  localStorage.clear();
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

describe('LoginPage', () => {
  it('renders the heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Sign in to your account' })).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    renderPage();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('renders Sign in submit button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders a link to register', () => {
    renderPage();
    expect(screen.getByRole('link', { name: 'create a new account' })).toBeInTheDocument();
  });

  it('renders forgot password link', () => {
    renderPage();
    expect(screen.getByRole('link', { name: 'Forgot your password?' })).toBeInTheDocument();
  });

  it('calls login with email and password on submit', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);
    renderPage();

    await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('navigates to /dashboard after Student login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);
    localStorage.setItem('user', JSON.stringify({ role: 'Student' }));
    renderPage();

    await user.type(screen.getByPlaceholderText('Email address'), 'student@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'pass');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
  });

  it('navigates to /tutor-dashboard after Tutor login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);
    localStorage.setItem('user', JSON.stringify({ role: 'Tutor' }));
    renderPage();

    await user.type(screen.getByPlaceholderText('Email address'), 'tutor@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'pass');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/tutor-dashboard'));
  });

  it('navigates to /admin-dashboard after Admin login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);
    localStorage.setItem('user', JSON.stringify({ role: 'Admin' }));
    renderPage();

    await user.type(screen.getByPlaceholderText('Email address'), 'admin@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'pass');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard'));
  });

  it('shows error message when login fails', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });
    renderPage();

    await user.type(screen.getByPlaceholderText('Email address'), 'bad@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() =>
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    );
  });

  it('shows fallback error when login fails without server message', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Network error'));
    renderPage();

    await user.type(screen.getByPlaceholderText('Email address'), 'bad@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() =>
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument()
    );
  });

  it('does not show error message initially', () => {
    renderPage();
    expect(screen.queryByText('Login failed. Please try again.')).not.toBeInTheDocument();
  });
});