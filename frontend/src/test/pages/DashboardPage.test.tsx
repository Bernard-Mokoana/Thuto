import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import DashboardPage from '../../pages/DashboardPage';
import * as useAuthModule from '../../contexts/useAuth';

vi.mock('../../contexts/useAuth');
vi.mock('../../services/api', () => ({
  enrollmentAPI: {
    getEnrollments: vi.fn(),
  },
}));

import { enrollmentAPI } from '../../services/api';

const mockEnrollmentAPI = vi.mocked(enrollmentAPI);

const createEnrollmentsResponse = (
  enrollments: unknown[]
): AxiosResponse<{ enrollments: unknown[] }> => ({
  data: { enrollments },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as InternalAxiosRequestConfig,
});

const studentUser = {
  _id: '1',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  role: 'Student' as const,
  isVerified: true,
};

const buildAuth = () => ({
  user: studentUser,
  loading: false,
  login: vi.fn(),
  register: vi.fn(),
  refreshUser: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true,
});

beforeEach(() => {
  vi.mocked(useAuthModule.useAuth).mockReturnValue(buildAuth());
  mockEnrollmentAPI.getEnrollments.mockReset();
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );

describe('DashboardPage', () => {
  it('shows loading spinner initially', () => {
    mockEnrollmentAPI.getEnrollments.mockReturnValue(new Promise(() => {}));
    const { container } = renderPage();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders welcome message with user first name', async () => {
    mockEnrollmentAPI.getEnrollments.mockResolvedValueOnce(createEnrollmentsResponse([]));
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Welcome back, Alice!')).toBeInTheDocument()
    );
  });

  it('renders stat cards after load', async () => {
    mockEnrollmentAPI.getEnrollments.mockResolvedValueOnce(createEnrollmentsResponse([]));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Total Courses')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Time Spent')).toBeInTheDocument();
      expect(screen.getByText('Certificates')).toBeInTheDocument();
    });
  });

  it('shows No courses yet when enrollments are empty', async () => {
    mockEnrollmentAPI.getEnrollments.mockResolvedValueOnce(createEnrollmentsResponse([]));
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('No courses yet')).toBeInTheDocument()
    );
  });

  it('renders enrollment when data is returned', async () => {
    const enrollment = {
      _id: 'enr1',
      course: {
        _id: 'c1',
        title: 'React Basics',
        description: 'Learn React',
        thumbnail: undefined,
        duration: 120,
        level: 'beginner',
      },
      progress: [],
      enrolledAt: new Date().toISOString(),
    };
    mockEnrollmentAPI.getEnrollments.mockResolvedValueOnce(
      createEnrollmentsResponse([enrollment])
    );
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('React Basics')).toBeInTheDocument()
    );
  });

  it('shows correct Total Courses count', async () => {
    const enrollment = {
      _id: 'enr1',
      course: {
        _id: 'c1',
        title: 'React Basics',
        description: 'desc',
        thumbnail: undefined,
        duration: 60,
        level: 'beginner',
      },
      progress: [],
      enrolledAt: new Date().toISOString(),
    };
    mockEnrollmentAPI.getEnrollments.mockResolvedValueOnce(
      createEnrollmentsResponse([enrollment])
    );
    renderPage();
    await waitFor(() => {
      // StatCard for Total Courses should show 1
      const totalCoursesStat = screen.getByText('Total Courses');
      const card = totalCoursesStat.closest('div');
      expect(card?.textContent).toContain('1');
    });
  });

  it('renders Browse Courses link', async () => {
    mockEnrollmentAPI.getEnrollments.mockResolvedValueOnce(createEnrollmentsResponse([]));
    renderPage();
    await waitFor(() => {
      const browseLinks = screen.getAllByRole('link', { name: 'Browse Courses' });
      expect(browseLinks.length).toBeGreaterThan(0);
    });
  });
});
