import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import EmailNotificationsPage from './EmailNotificationsPage';
import * as useAuthModule from '../contexts/useAuth';

vi.mock('../contexts/useAuth');

const USER_ID = 'user-42';
const STORAGE_KEY = `userSettings:${USER_ID}`;

const buildAuth = (userId?: string) => ({
  user: userId
    ? {
        _id: userId,
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        role: 'Student' as const,
        isVerified: true,
      }
    : null,
  loading: false,
  login: vi.fn(),
  register: vi.fn(),
  refreshUser: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: !!userId,
});

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <EmailNotificationsPage />
    </MemoryRouter>
  );

describe('EmailNotificationsPage', () => {
  it('renders the title', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(buildAuth(USER_ID));
    renderPage();
    expect(screen.getByRole('heading', { name: 'Email Notifications' })).toBeInTheDocument();
  });

  it('renders the description', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(buildAuth(USER_ID));
    renderPage();
    expect(
      screen.getByText('Manage how we contact you about account updates')
    ).toBeInTheDocument();
  });

  it('shows Enabled button by default (emailNotifications defaults to true)', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(buildAuth(USER_ID));
    renderPage();
    expect(screen.getByRole('button', { name: 'Enabled' })).toBeInTheDocument();
  });

  it('shows description for enabled state by default', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(buildAuth(USER_ID));
    renderPage();
    expect(
      screen.getByText('You will receive course and account updates.')
    ).toBeInTheDocument();
  });

  it('toggles to Disabled when button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuthModule.useAuth).mockReturnValue(buildAuth(USER_ID));
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Enabled' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Disabled' })).toBeInTheDocument()
    );
  });

  it('shows disabled description after toggle', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuthModule.useAuth).mockReturnValue(buildAuth(USER_ID));
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Enabled' }));

    await waitFor(() =>
      expect(
        screen.getByText('Email notifications are currently disabled.')
      ).toBeInTheDocument()
    );
  });

  it('persists setting to localStorage on toggle', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuthModule.useAuth).mockReturnValue(buildAuth(USER_ID));
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Enabled' }));

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
      expect(stored.emailNotifications).toBe(false);
    });
  });

  it('loads stored disabled state from localStorage', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ emailNotifications: false, shareProfileData: false })
    );
    vi.mocked(useAuthModule.useAuth).mockReturnValue(buildAuth(USER_ID));
    renderPage();
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeInTheDocument();
  });

  it('renders Back to Profile link', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(buildAuth(USER_ID));
    renderPage();
    expect(screen.getByRole('link', { name: 'Back to Profile' })).toBeInTheDocument();
  });
});