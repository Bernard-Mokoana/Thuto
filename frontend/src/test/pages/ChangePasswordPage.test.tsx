import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ChangePasswordPage from '../../pages/ChangePasswordPage';
import * as useAuthModule from '../../contexts/useAuth';

vi.mock('../../contexts/useAuth');
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

const mockUpdateUser = vi.fn();

vi.mock('../../services/api', () => ({
  userAPI: {
    updateUser: (...args: unknown[]) => mockUpdateUser(...args),
  },
}));

const studentUser = {
  _id: 'user-1',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  role: 'Student' as const,
  isVerified: true,
};

const buildAuth = () => ({
  user: studentUser,
  loading: false,
  login: vi.fn(),
  register: vi.fn(),
  refreshUser: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuthModule.useAuth).mockReturnValue(buildAuth());
  mockUpdateUser.mockReset();
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <ChangePasswordPage />
    </MemoryRouter>
  );

describe('ChangePasswordPage', () => {
  it('renders the page heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
  });

  it('renders New Password and Confirm Password fields', () => {
    renderPage();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('renders Update Password button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Update Password' })).toBeInTheDocument();
  });

  it('renders Back to Profile link', () => {
    renderPage();
    expect(screen.getByRole('link', { name: 'Back to Profile' })).toBeInTheDocument();
  });

  it('shows warning if password is shorter than 6 characters', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('New Password'), 'abc');
    await user.type(screen.getByLabelText('Confirm Password'), 'abc');
    await user.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(toast.warn).toHaveBeenCalledWith('Password must be at least 6 characters.');
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('shows warning when passwords do not match', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('New Password'), 'password1');
    await user.type(screen.getByLabelText('Confirm Password'), 'password2');
    await user.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(toast.warn).toHaveBeenCalledWith('Password do not match.');
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('calls userAPI.updateUser with user id and FormData on valid submission', async () => {
    const user = userEvent.setup();
    mockUpdateUser.mockResolvedValueOnce({ data: {} });
    renderPage();

    await user.type(screen.getByLabelText('New Password'), 'newpassword');
    await user.type(screen.getByLabelText('Confirm Password'), 'newpassword');
    await user.click(screen.getByRole('button', { name: 'Update Password' }));

    await waitFor(() =>
      expect(mockUpdateUser).toHaveBeenCalledWith('user-1', expect.any(FormData))
    );
  });

  it('shows success toast on successful update', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup();
    mockUpdateUser.mockResolvedValueOnce({ data: {} });
    renderPage();

    await user.type(screen.getByLabelText('New Password'), 'newpassword');
    await user.type(screen.getByLabelText('Confirm Password'), 'newpassword');
    await user.click(screen.getByRole('button', { name: 'Update Password' }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Password updated successfully!')
    );
  });

  it('shows error toast when API throws', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup();
    mockUpdateUser.mockRejectedValueOnce(new Error('Network error'));
    renderPage();

    await user.type(screen.getByLabelText('New Password'), 'newpassword');
    await user.type(screen.getByLabelText('Confirm Password'), 'newpassword');
    await user.click(screen.getByRole('button', { name: 'Update Password' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to update password. Please try again.'
      )
    );
  });
});
