import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from './StatCard';

describe('StatCard', () => {
  it('renders the label', () => {
    render(<StatCard label="Total Courses" value={10} />);
    expect(screen.getByText('Total Courses')).toBeInTheDocument();
  });

  it('renders a numeric value', () => {
    render(<StatCard label="Completed" value={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders a string value', () => {
    render(<StatCard label="Time Spent" value="12h" />);
    expect(screen.getByText('12h')).toBeInTheDocument();
  });

  it('renders a ReactNode value', () => {
    render(<StatCard label="Revenue" value={<span data-testid="rev">R100</span>} />);
    expect(screen.getByTestId('rev')).toBeInTheDocument();
    expect(screen.getByText('R100')).toBeInTheDocument();
  });

  it('renders zero as value', () => {
    render(<StatCard label="Certificates" value={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders label and value in the same card', () => {
    const { container } = render(<StatCard label="Total Courses" value={3} />);
    const card = container.firstChild as HTMLElement;
    expect(card).toBeInTheDocument();
    expect(card.textContent).toContain('Total Courses');
    expect(card.textContent).toContain('3');
  });
});