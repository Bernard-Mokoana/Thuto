import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthPageShell from './AuthPageShell';

describe('AuthPageShell', () => {
  it('renders the title', () => {
    render(<AuthPageShell title="Sign In" />);
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<AuthPageShell title="Sign In" subtitle="Welcome back" />);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });

  it('does not render subtitle container when subtitle is omitted', () => {
    const { container } = render(<AuthPageShell title="Sign In" />);
    // subtitle div should not be present
    const subtitleDiv = container.querySelector('.mt-2.text-sm.text-gray-600');
    expect(subtitleDiv).not.toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(<AuthPageShell title="Sign In" footer={<a href="/login">Back to login</a>} />);
    expect(screen.getByRole('link', { name: 'Back to login' })).toBeInTheDocument();
  });

  it('does not render footer container when footer is omitted', () => {
    const { container } = render(<AuthPageShell title="Sign In" />);
    const footerDiv = container.querySelector('.text-sm.text-center');
    expect(footerDiv).not.toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <AuthPageShell title="Sign In">
        <form data-testid="login-form">
          <button type="submit">Submit</button>
        </form>
      </AuthPageShell>
    );
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('renders ReactNode subtitle (JSX)', () => {
    render(
      <AuthPageShell
        title="Sign In"
        subtitle={<span data-testid="custom-subtitle">Or create an account</span>}
      />
    );
    expect(screen.getByTestId('custom-subtitle')).toBeInTheDocument();
  });

  it('renders subtitle and footer and children together', () => {
    render(
      <AuthPageShell
        title="Register"
        subtitle="Create account"
        footer={<span>Already have an account?</span>}
      >
        <p data-testid="child">Form content</p>
      </AuthPageShell>
    );
    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByText('Create account')).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});