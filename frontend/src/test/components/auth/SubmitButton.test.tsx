import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SubmitButton from '../../../components/auth/SubmitButton';

describe('SubmitButton', () => {
  it('renders label text when not loading', () => {
    render(<SubmitButton loading={false} label="Sign in" />);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders spinner and not label text when loading', () => {
    render(<SubmitButton loading={true} label="Sign in" />);
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
    // spinner div is present
    const button = screen.getByRole('button');
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('button has type="submit"', () => {
    render(<SubmitButton loading={false} label="Submit" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('is disabled when loading=true', () => {
    render(<SubmitButton loading={true} label="Submit" />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is not disabled when loading=false', () => {
    render(<SubmitButton loading={false} label="Submit" />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('renders different labels correctly', () => {
    const { rerender } = render(<SubmitButton loading={false} label="Send Reset Link" />);
    expect(screen.getByText('Send Reset Link')).toBeInTheDocument();

    rerender(<SubmitButton loading={false} label="Create Account" />);
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });
});