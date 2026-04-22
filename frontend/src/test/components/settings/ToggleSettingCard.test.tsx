import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToggleSettingCard from '../../../components/settings/ToggleSettingCard';

const baseProps = {
  label: 'Email alerts',
  description: 'Receive email updates',
  enabled: true,
  onToggle: vi.fn(),
};

describe('ToggleSettingCard', () => {
  it('renders the label', () => {
    render(<ToggleSettingCard {...baseProps} />);
    expect(screen.getByText('Email alerts')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<ToggleSettingCard {...baseProps} />);
    expect(screen.getByText('Receive email updates')).toBeInTheDocument();
  });

  it('shows "Enabled" button text when enabled=true', () => {
    render(<ToggleSettingCard {...baseProps} enabled={true} />);
    expect(screen.getByRole('button', { name: 'Enabled' })).toBeInTheDocument();
  });

  it('shows "Disabled" button text when enabled=false', () => {
    render(<ToggleSettingCard {...baseProps} enabled={false} />);
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeInTheDocument();
  });

  it('applies green styling when enabled', () => {
    render(<ToggleSettingCard {...baseProps} enabled={true} />);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-green-100');
    expect(btn.className).toContain('text-green-800');
  });

  it('applies gray styling when disabled', () => {
    render(<ToggleSettingCard {...baseProps} enabled={false} />);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-gray-200');
    expect(btn.className).toContain('text-gray-700');
  });

  it('calls onToggle when the button is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<ToggleSettingCard {...baseProps} onToggle={onToggle} />);

    await user.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('does not call onToggle without a click', () => {
    const onToggle = vi.fn();
    render(<ToggleSettingCard {...baseProps} onToggle={onToggle} />);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('calls onToggle the correct number of times on multiple clicks', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<ToggleSettingCard {...baseProps} onToggle={onToggle} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('button', { name: 'Enabled' }));
    expect(onToggle).toHaveBeenCalledTimes(2);
  });
});