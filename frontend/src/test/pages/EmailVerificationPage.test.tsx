import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EmailVerificationPage from '../../pages/EmailVerificationPage';

const mockGet = vi.fn();

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

beforeEach(() => {
  mockGet.mockReset();
});

const renderWithToken = (token?: string) => {
  const search = token ? `?token=${token}` : '';
  return render(
    <MemoryRouter initialEntries={[`/verify-email${search}`]}>
      <Routes>
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('EmailVerificationPage', () => {
  it('shows verifying state initially when token is present', () => {
    mockGet.mockReturnValue(new Promise(() => {})); // never resolves
    renderWithToken('some-token');
    expect(screen.getByText('Verifying Email')).toBeInTheDocument();
    expect(screen.getByText('Verifying your email...')).toBeInTheDocument();
  });

  it('shows error when no token is in the URL', async () => {
    renderWithToken();
    await waitFor(() =>
      expect(screen.getByText('Verification Failed')).toBeInTheDocument()
    );
    expect(screen.getByText('No verification token found.')).toBeInTheDocument();
  });

  it('shows success state after successful verification', async () => {
    mockGet.mockResolvedValueOnce({ status: 200 });
    renderWithToken('valid-token');

    await waitFor(() =>
      expect(screen.getByText('Verification Successful')).toBeInTheDocument()
    );
    expect(
      screen.getByText('Your email has been verified successfully! You can now log in.')
    ).toBeInTheDocument();
  });

  it('shows Go to Login link on success', async () => {
    mockGet.mockResolvedValueOnce({ status: 200 });
    renderWithToken('valid-token');

    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Go to Login' })).toBeInTheDocument()
    );
  });

  it('shows error state when API returns error with server message', async () => {
    mockGet.mockRejectedValueOnce({
      response: { data: { message: 'Token expired' } },
    });
    renderWithToken('expired-token');

    await waitFor(() =>
      expect(screen.getByText('Verification Failed')).toBeInTheDocument()
    );
    expect(screen.getByText('Token expired')).toBeInTheDocument();
  });

  it('shows fallback error message when server message is absent', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network error'));
    renderWithToken('some-token');

    await waitFor(() =>
      expect(screen.getByText('An error occurred during verification.')).toBeInTheDocument()
    );
  });

  it('does not show Go to Login link in error state', async () => {
    mockGet.mockRejectedValueOnce(new Error('fail'));
    renderWithToken('bad-token');

    await waitFor(() =>
      expect(screen.getByText('Verification Failed')).toBeInTheDocument()
    );
    expect(screen.queryByRole('link', { name: 'Go to Login' })).not.toBeInTheDocument();
  });

  it('calls the verification API with the token from URL', async () => {
    mockGet.mockResolvedValueOnce({ status: 200 });
    renderWithToken('abc123');

    await waitFor(() => expect(mockGet).toHaveBeenCalledWith('/auth/verify-email?token=abc123'));
  });
});