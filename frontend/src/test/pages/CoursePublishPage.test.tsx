import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CoursePublishPage from '../../pages/CoursePublishPage';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockGetTutorCourse = vi.fn();
const mockUpdateCourse = vi.fn();

vi.mock('../../services/api', () => ({
  courseAPI: {
    getTutorCourse: (id: string) => mockGetTutorCourse(id),
    updateCourse: (id: string, data: unknown) => mockUpdateCourse(id, data),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockCourse = {
  _id: 'c1',
  title: 'TypeScript Fundamentals',
  description: 'Learn TypeScript',
  isPublished: false,
};

beforeEach(() => {
  mockGetTutorCourse.mockReset();
  mockUpdateCourse.mockReset();
  mockNavigate.mockReset();
});

const renderPage = (courseId = 'c1', locationState?: object) =>
  render(
    <MemoryRouter
      initialEntries={[{ pathname: `/courses/${courseId}/publish`, state: locationState }]}
    >
      <Routes>
        <Route path="/courses/:id/publish" element={<CoursePublishPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('CoursePublishPage', () => {
  it('shows loading spinner when no location state and fetching', () => {
    mockGetTutorCourse.mockReturnValue(new Promise(() => {}));
    const { container } = renderPage();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders course title when loaded from location state', () => {
    renderPage('c1', { course: mockCourse });
    expect(screen.getByText('TypeScript Fundamentals')).toBeInTheDocument();
  });

  it('fetches course when no location state is provided', async () => {
    mockGetTutorCourse.mockResolvedValueOnce({
      data: { course: mockCourse },
    });
    renderPage();

    await waitFor(() => expect(mockGetTutorCourse).toHaveBeenCalledWith('c1'));
  });

  it('shows error toast when fetching fails', async () => {
    const { toast } = await import('react-toastify');
    mockGetTutorCourse.mockRejectedValueOnce({
      response: { data: { message: 'Not found' } },
    });
    renderPage();

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Not found'));
  });

  it('displays Publish button when course is not published', () => {
    renderPage('c1', { course: mockCourse });
    expect(
      screen.getByRole('button', { name: /publish/i })
    ).toBeInTheDocument();
  });

  it('calls updateCourse with isPublished:true when Publish is clicked', async () => {
    const user = userEvent.setup();
    mockUpdateCourse.mockResolvedValueOnce({ data: { course: { ...mockCourse, isPublished: true } } });
    renderPage('c1', { course: mockCourse });

    const publishBtn = screen.getByRole('button', { name: /publish/i });
    await user.click(publishBtn);

    await waitFor(() =>
      expect(mockUpdateCourse).toHaveBeenCalledWith('c1', { isPublished: true })
    );
  });

  it('shows success toast when publish succeeds', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup();
    mockUpdateCourse.mockResolvedValueOnce({ data: {} });
    renderPage('c1', { course: mockCourse });

    await user.click(screen.getByRole('button', { name: /publish/i }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Course published successfully.')
    );
  });
});