import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormMessage from '../../../components/auth/FormMessage';

describe('FormMessage', () => {
  it('renders the message text', () => {
    render(<FormMessage variant="error" message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('applies error styling for error variant', () => {
    const { container } = render(
      <FormMessage variant="error" message="Error occurred" />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('bg-red-100');
    expect(div.className).toContain('border-red-400');
    expect(div.className).toContain('text-red-700');
  });

  it('applies success styling for success variant', () => {
    const { container } = render(
      <FormMessage variant="success" message="Operation successful" />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('bg-green-100');
    expect(div.className).toContain('border-green-400');
    expect(div.className).toContain('text-green-700');
  });

  it('does not apply error styles to success variant', () => {
    const { container } = render(
      <FormMessage variant="success" message="All good" />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.className).not.toContain('bg-red-100');
  });

  it('does not apply success styles to error variant', () => {
    const { container } = render(
      <FormMessage variant="error" message="Fail" />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.className).not.toContain('bg-green-100');
  });

  it('renders an empty string message', () => {
    const { container } = render(<FormMessage variant="error" message="" />);
    const div = container.firstChild as HTMLElement;
    expect(div.textContent).toBe('');
  });
});