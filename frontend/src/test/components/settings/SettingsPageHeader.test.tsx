import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SettingsPageHeader from '../../../components/settings/SettingsPageHeader';

const renderWithRouter = (ui: React.ReactNode) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('SettingsPageHeader', () => {
  it('renders the title', () => {
    renderWithRouter(
      <SettingsPageHeader title="Email Notifications" description="Manage emails" />
    );
    expect(
      screen.getByRole('heading', { name: 'Email Notifications' })
    ).toBeInTheDocument();
  });

  it('renders the description', () => {
    renderWithRouter(
      <SettingsPageHeader title="Privacy" description="Control your data" />
    );
    expect(screen.getByText('Control your data')).toBeInTheDocument();
  });

  it('renders a "Back to Profile" link pointing to /profile', () => {
    renderWithRouter(
      <SettingsPageHeader title="Settings" description="Manage settings" />
    );
    const link = screen.getByRole('link', { name: 'Back to Profile' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/profile');
  });

  it('renders both title and description', () => {
    renderWithRouter(
      <SettingsPageHeader title="Security" description="Change your password" />
    );
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Change your password')).toBeInTheDocument();
  });
});