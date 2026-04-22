import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CreateCoursePage from './CreateCoursePage';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockCreateCourse = vi.fn();
const mockGetCategories = vi.fn();
const mockCreateLesson = vi.fn();

vi.mock('../services/api', () => ({
  courseAPI: {
    createCourse: (data: unknown) => mockCreateCourse(data),
  },
  categoryAPI: {
    getCategories: () => mockGetCategories(),
  },
  lessonAPI: {
    createLesson: (courseId: string, data: unknown) => mockCreateLesson(courseId, data),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockCategory = { _id: 'cat-1', name: 'Programming' };

beforeEach(() => {
  mockCreateCourse.mockReset();
  mockGetCategories.mockReset();
  mockCreateLesson.mockReset();
  mockNavigate.mockReset();

  mockGetCategories.mockResolvedValue({ data: { categories: [mockCategory] } });
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <CreateCoursePage />
    </MemoryRouter>
  );

describe('CreateCoursePage', () => {
  it('renders the page heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Create a New Course' })).toBeInTheDocument();
  });

  it('renders Title label and input', () => {
    renderPage();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  it('fetches categories on mount', async () => {
    renderPage();
    await waitFor(() => expect(mockGetCategories).toHaveBeenCalled());
  });

  it('calls createCourse on form submission', async () => {
    const user = userEvent.setup();
    mockCreateCourse.mockResolvedValueOnce({ data: { course: { _id: 'new-course-1' } } });
    mockCreateLesson.mockResolvedValueOnce({ data: {} });
    renderPage();

    // Wait for categories to load
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Programming' })).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText('Title'), 'My Test Course');
    await user.type(screen.getByLabelText('Description'), 'A great course');
    await user.type(screen.getByLabelText('Price (R)'), '50');
    await user.selectOptions(screen.getByLabelText('Category'), 'cat-1');

    const submitBtn = screen.getByRole('button', { name: 'Create Course' });
    await user.click(submitBtn);

    await waitFor(() => expect(mockCreateCourse).toHaveBeenCalled());
  });

  it('shows error toast when category fetch fails', async () => {
    const { toast } = await import('react-toastify');
    mockGetCategories.mockRejectedValueOnce(new Error('Network error'));
    renderPage();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Could not fetch categories.')
    );
  });

  it('shows error toast when course creation fails with server message', async () => {
    const user = userEvent.setup();
    const { toast } = await import('react-toastify');
    mockCreateCourse.mockRejectedValueOnce({
      response: { data: { message: 'Title already exists' } },
    });
    renderPage();

    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Programming' })).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText('Title'), 'Duplicate');
    await user.type(screen.getByLabelText('Description'), 'Desc');
    await user.type(screen.getByLabelText('Price (R)'), '10');
    await user.selectOptions(screen.getByLabelText('Category'), 'cat-1');

    await user.click(screen.getByRole('button', { name: 'Create Course' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Title already exists')
    );
  });

  it('shows fallback error toast when no server message on creation failure', async () => {
    const user = userEvent.setup();
    const { toast } = await import('react-toastify');
    mockCreateCourse.mockRejectedValueOnce(new Error('Network error'));
    renderPage();

    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Programming' })).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText('Title'), 'Some Course');
    await user.type(screen.getByLabelText('Description'), 'Desc');
    await user.type(screen.getByLabelText('Price (R)'), '10');
    await user.selectOptions(screen.getByLabelText('Category'), 'cat-1');

    await user.click(screen.getByRole('button', { name: 'Create Course' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'An error occurred while creating the course.'
      )
    );
  });
});