import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CoursesPage from '../../pages/CoursesPage';

const mockGetCourses = vi.fn();
const mockGetCategories = vi.fn();

vi.mock('../../services/api', () => ({
  courseAPI: {
    getCourses: (params: unknown) => mockGetCourses(params),
  },
  categoryAPI: {
    getCategories: () => mockGetCategories(),
  },
}));

const mockCourse = {
  _id: 'c1',
  title: 'React for Beginners',
  description: 'Learn React',
  price: 0,
  level: 'beginner',
  duration: 60,
  isPublished: true,
};

beforeEach(() => {
  mockGetCourses.mockReset();
  mockGetCategories.mockReset();
  mockGetCategories.mockResolvedValue({ data: { categories: [] } });
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <CoursesPage />
    </MemoryRouter>
  );

describe('CoursesPage', () => {
  it('renders the All Courses heading', async () => {
    mockGetCourses.mockResolvedValueOnce({ data: { course: [] } });
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'All Courses' })).toBeInTheDocument()
    );
  });

  it('renders courses after loading', async () => {
    mockGetCourses.mockResolvedValueOnce({ data: { course: [mockCourse] } });
    renderPage();

    await waitFor(() =>
      expect(screen.getByText('React for Beginners')).toBeInTheDocument()
    );
  });

  it('renders search input', async () => {
    mockGetCourses.mockResolvedValueOnce({ data: { course: [] } });
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByPlaceholderText(/search/i)
      ).toBeInTheDocument()
    );
  });

  it('calls getCourses with search term after typing', async () => {
    const user = userEvent.setup();
    mockGetCourses.mockResolvedValue({ data: { course: [] } });
    renderPage();

    const searchInput = await screen.findByPlaceholderText(/search/i);
    await user.type(searchInput, 'React');

    await waitFor(() => {
      const calls = mockGetCourses.mock.calls;
      const lastCall = calls[calls.length - 1][0] as Record<string, unknown>;
      expect(lastCall?.search).toBe('React');
    });
  });

  it('shows empty state when no courses returned', async () => {
    mockGetCourses.mockResolvedValueOnce({ data: { course: [] } });
    renderPage();

    await waitFor(() => {
      expect(screen.queryByText('React for Beginners')).not.toBeInTheDocument();
    });
  });

  it('calls getCourses initially', async () => {
    mockGetCourses.mockResolvedValueOnce({ data: { course: [] } });
    renderPage();

    await waitFor(() => expect(mockGetCourses).toHaveBeenCalled());
  });
});