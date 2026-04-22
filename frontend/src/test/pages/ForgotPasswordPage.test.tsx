import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPasswordPage from '../../pages/ForgotPasswordPage';

const mockPost = vi.fn();

vi.mock('../../services/api', () => ({
  default: {
    post: (...args: unknown[]) => mockPost(...args),
    get: vi.fn(),
  },
}));

beforeEach(() => {
  mockPost.mockReset();
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <ForgotPasswordPage />
    </MemoryRouter>
  );

describe('ForgotPasswordPage', () => {
  it('renders the heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Forgot Your Password?' })).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    renderPage();
    expect(
      screen.getByText(/Enter your email address/)
    ).toBeInTheDocument();
  });

  it('renders email input', () => {
    renderPage();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
  });

  it('renders Send Reset Link button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument();
  });

  it('renders Back to login link', () => {
    renderPage();
    expect(screen.getByRole('link', { name: 'Back to login' })).toBeInTheDocument();
  });

  it('shows success message after successful submission', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValueOnce({ data: {} });
    renderPage();

    await user.type(screen.getByPlaceholderText('Email address'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Send Reset Link' }));

    await waitFor(() =>
      expect(
        screen.getByText('Password reset link sent to your email.')
      ).toBeInTheDocument()
    );
  });

  it('calls api.post with correct args on submit', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValueOnce({ data: {} });
    renderPage();

    await user.type(screen.getByPlaceholderText('Email address'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Send Reset Link' }));

    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'user@example.com',
      })
    );
  });

  it('shows error message from server on failure', async () => {
    const user = userEvent.setup();
    mockPost.mockRejectedValueOnce({
      response: { data: { message: 'Email not found' } },
    });
    renderPage();

    await user.type(screen.getByPlaceholderText('Email address'), 'missing@example.com');
    await user.click(screen.getByRole('button', { name: 'Send Reset Link' }));

    await waitFor(() =>
      expect(screen.getByText('Email not found')).toBeInTheDocument()
    );
  });

  it('shows fallback error when server message is absent', async () => {
    const user = userEvent.setup();
    mockPost.mockRejectedValueOnce(new Error('Network error'));
    renderPage();

    await user.type(screen.getByPlaceholderText('Email address'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Send Reset Link' }));

    await waitFor(() =>
      expect(
        screen.getByText('An error occurred. Please try again.')
      ).toBeInTheDocument()
    );
  });

  it('does not show success or error messages initially', () => {
    renderPage();
    expect(
      screen.queryByText('Password reset link sent to your email.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('An error occurred. Please try again.')
    ).not.toBeInTheDocument();
  });
});