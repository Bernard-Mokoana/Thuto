import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordInput from '../../../components/auth/PasswordInput';

const defaultProps = {
  id: 'password',
  name: 'password',
  value: 'secret',
  placeholder: 'Enter password',
  onChange: vi.fn(),
};

describe('PasswordInput', () => {
  it('renders the input with type="password" by default', () => {
    render(<PasswordInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Enter password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders with the provided value', () => {
    render(<PasswordInput {...defaultProps} value="mypassword" />);
    expect(screen.getByPlaceholderText('Enter password')).toHaveValue('mypassword');
  });

  it('renders show password button with correct aria-label', () => {
    render(<PasswordInput {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument();
  });

  it('toggles input type to "text" when show button is clicked', async () => {
    const user = userEvent.setup();
    render(<PasswordInput {...defaultProps} />);

    const toggle = screen.getByRole('button', { name: 'Show password' });
    await user.click(toggle);

    const input = screen.getByPlaceholderText('Enter password');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('changes aria-label to "Hide password" after showing', async () => {
    const user = userEvent.setup();
    render(<PasswordInput {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
  });

  it('toggles back to type="password" on second click', async () => {
    const user = userEvent.setup();
    render(<PasswordInput {...defaultProps} />);

    const toggle = screen.getByRole('button', { name: 'Show password' });
    await user.click(toggle);
    await user.click(screen.getByRole('button', { name: 'Hide password' }));

    expect(screen.getByPlaceholderText('Enter password')).toHaveAttribute('type', 'password');
  });

  it('calls onChange when input value changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PasswordInput {...defaultProps} value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Enter password');
    await user.type(input, 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('applies the className prop to the input', () => {
    render(<PasswordInput {...defaultProps} className="custom-class" />);
    expect(screen.getByPlaceholderText('Enter password')).toHaveClass('custom-class');
  });

  it('sets required attribute when required=true', () => {
    render(<PasswordInput {...defaultProps} required />);
    expect(screen.getByPlaceholderText('Enter password')).toBeRequired();
  });

  it('does not set required by default', () => {
    render(<PasswordInput {...defaultProps} />);
    expect(screen.getByPlaceholderText('Enter password')).not.toBeRequired();
  });

  it('sets autoComplete attribute when provided', () => {
    render(<PasswordInput {...defaultProps} autoComplete="current-password" />);
    expect(screen.getByPlaceholderText('Enter password')).toHaveAttribute(
      'autocomplete',
      'current-password'
    );
  });

  it('renders button as type="button" to avoid form submission', () => {
    render(<PasswordInput {...defaultProps} />);
    const btn = screen.getByRole('button', { name: 'Show password' });
    expect(btn).toHaveAttribute('type', 'button');
  });
});