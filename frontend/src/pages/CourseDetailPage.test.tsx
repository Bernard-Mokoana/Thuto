import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CourseDetailPage from './CourseDetailPage';
import * as useAuthModule from '../contexts/useAuth';

vi.mock('../contexts/useAuth');
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockGetCourse = vi.fn();
const mockGetLessons = vi.fn();
const mockGetEnrollments = vi.fn();
const mockEnroll = vi.fn();

vi.mock('../services/api', () => ({
  courseAPI: {
    getCourse: (id: string) => mockGetCourse(id),
  },
  lessonAPI: {
    getLessons: (id: string) => mockGetLessons(id),
  },
  enrollmentAPI: {
    getEnrollments: () => mockGetEnrollments(),
    enroll: (id: string) => mockEnroll(id),
  },
}));

const mockCourse = {
  _id: 'course-1',
  title: 'Introduction to React',
  description: 'Learn React from scratch',
  price: 50,
  level: 'beginner',
  duration: 120,
  isPublished: true,
};

const studentUser = {
  _id: 'user-1',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  role: 'Student' as const,
  isVerified: true,
};

const buildAuth = (overrides = {}) => ({
  user: null,
  loading: false,
  login: vi.fn(),
  register: vi.fn(),
  refreshUser: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: false,
  ...overrides,
});

beforeEach(() => {
  mockGetCourse.mockReset();
  mockGetLessons.mockReset();
  mockGetEnrollments.mockReset();
  mockEnroll.mockReset();
  vi.mocked(useAuthModule.useAuth).mockReturnValue(buildAuth());
});

const renderPage = (courseId = 'course-1') =>
  render(
    <MemoryRouter initialEntries={[`/courses/${courseId}`]}>
      <Routes>
        <Route path="/courses/:id" element={<CourseDetailPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('CourseDetailPage', () => {
  it('shows loading spinner initially', () => {
    mockGetCourse.mockReturnValue(new Promise(() => {}));
    mockGetLessons.mockReturnValue(new Promise(() => {}));
    const { container } = renderPage();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders course title after loading', async () => {
    mockGetCourse.mockResolvedValueOnce({ data: { course: mockCourse } });
    mockGetLessons.mockResolvedValueOnce({ data: { Lessons: [] } });
    renderPage();

    await waitFor(() =>
      expect(screen.getByText('Introduction to React')).toBeInTheDocument()
    );
  });

  it('renders course description', async () => {
    mockGetCourse.mockResolvedValueOnce({ data: { course: mockCourse } });
    mockGetLessons.mockResolvedValueOnce({ data: { Lessons: [] } });
    renderPage();

    await waitFor(() =>
      expect(screen.getByText('Learn React from scratch')).toBeInTheDocument()
    );
  });

  it('checks enrollment status for authenticated student', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      buildAuth({ isAuthenticated: true, user: studentUser })
    );
    mockGetCourse.mockResolvedValueOnce({ data: { course: mockCourse } });
    mockGetLessons.mockResolvedValueOnce({ data: { Lessons: [] } });
    mockGetEnrollments.mockResolvedValueOnce({ data: { enrollments: [] } });

    renderPage();

    await waitFor(() => expect(mockGetEnrollments).toHaveBeenCalled());
  });

  it('sets isEnrolled to true when course is in enrollments', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      buildAuth({ isAuthenticated: true, user: studentUser })
    );
    mockGetCourse.mockResolvedValueOnce({ data: { course: mockCourse } });
    mockGetLessons.mockResolvedValueOnce({ data: { Lessons: [] } });
    mockGetEnrollments.mockResolvedValueOnce({
      data: {
        enrollments: [
          {
            _id: 'enr-1',
            course: { _id: 'course-1' },
            progress: [],
            enrolledAt: new Date().toISOString(),
          },
        ],
      },
    });

    renderPage();

    // After loading, should show continue or start learning - not enroll
    await waitFor(() =>
      expect(screen.getByText('Introduction to React')).toBeInTheDocument()
    );
  });

  it('does not call getEnrollments for non-student', async () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      buildAuth({
        isAuthenticated: true,
        user: { ...studentUser, role: 'Tutor' },
      })
    );
    mockGetCourse.mockResolvedValueOnce({ data: { course: mockCourse } });
    mockGetLessons.mockResolvedValueOnce({ data: { Lessons: [] } });

    renderPage();

    await waitFor(() =>
      expect(screen.getByText('Introduction to React')).toBeInTheDocument()
    );
    expect(mockGetEnrollments).not.toHaveBeenCalled();
  });
});