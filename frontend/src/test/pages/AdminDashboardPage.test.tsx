import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboardPage from '../../pages/AdminDashboardPage';

vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockGetUsers = vi.fn();
const mockGetAdminCourses = vi.fn();
const mockGetCategories = vi.fn();
const mockGetTransactions = vi.fn();
const mockDeleteUser = vi.fn();
const mockDeleteCourse = vi.fn();
const mockAdminTogglePublish = vi.fn();

vi.mock('../../services/api', () => ({
  userAPI: {
    getUsers: () => mockGetUsers(),
    deleteUser: (id: string) => mockDeleteUser(id),
    updateUserRole: vi.fn(),
  },
  courseAPI: {
    getAdminCourses: () => mockGetAdminCourses(),
    deleteCourse: (id: string) => mockDeleteCourse(id),
    adminTogglePublish: (id: string, published: boolean) =>
      mockAdminTogglePublish(id, published),
  },
  categoryAPI: {
    getCategories: () => mockGetCategories(),
  },
  transactionAPI: {
    getTransactions: () => mockGetTransactions(),
  },
}));

const mockUser = {
  _id: 'u1',
  firstName: 'Bob',
  lastName: 'Jones',
  email: 'bob@example.com',
  role: 'Student' as const,
  isVerified: true,
};

const mockCourse = {
  _id: 'c1',
  title: 'React Course',
  description: 'Learn React',
  price: 100,
  level: 'beginner',
  duration: 60,
  isPublished: false,
};

const mockTransaction = {
  _id: 't1',
  amount: 50,
  status: 'success' as const,
};

beforeEach(() => {
  mockGetUsers.mockReset();
  mockGetAdminCourses.mockReset();
  mockGetCategories.mockReset();
  mockGetTransactions.mockReset();
  mockDeleteUser.mockReset();
  mockDeleteCourse.mockReset();
  mockAdminTogglePublish.mockReset();

  mockGetUsers.mockResolvedValue({ data: { users: [mockUser] } });
  mockGetAdminCourses.mockResolvedValue({ data: { courses: [mockCourse] } });
  mockGetCategories.mockResolvedValue({ data: { categories: [] } });
  mockGetTransactions.mockResolvedValue({
    data: { transaction: [mockTransaction] },
  });
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminDashboardPage />
    </MemoryRouter>
  );

describe('AdminDashboardPage', () => {
  it('shows loading spinner initially', () => {
    mockGetUsers.mockReturnValue(new Promise(() => {}));
    const { container } = renderPage();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders user table after loading', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    );
  });

  it('renders course table after loading', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('React Course')).toBeInTheDocument()
    );
  });

  it('calls deleteUser when delete button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    mockDeleteUser.mockResolvedValueOnce({ data: {} });
    renderPage();

    await waitFor(() => expect(screen.getByText('Bob Jones')).toBeInTheDocument());

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    // First delete button should be for the user
    await user.click(deleteButtons[0]);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => expect(mockDeleteUser).toHaveBeenCalledWith('u1'));
  });

  it('does not call deleteUser when delete is cancelled', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => expect(screen.getByText('Bob Jones')).toBeInTheDocument());

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockDeleteUser).not.toHaveBeenCalled();
  });

  it('calls deleteCourse when course delete button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    mockDeleteCourse.mockResolvedValueOnce({ data: {} });
    renderPage();

    await waitFor(() => expect(screen.getByText('React Course')).toBeInTheDocument());

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    // Last delete button is for the course
    await user.click(deleteButtons[deleteButtons.length - 1]);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => expect(mockDeleteCourse).toHaveBeenCalledWith('c1'));
  });

  it('calls adminTogglePublish when publish button is clicked', async () => {
    const user = userEvent.setup();
    mockAdminTogglePublish.mockResolvedValueOnce({ data: {} });
    renderPage();

    await waitFor(() => expect(screen.getByText('React Course')).toBeInTheDocument());

    const publishBtn = screen.getByRole('button', { name: 'Publish' });
    await user.click(publishBtn);

    await waitFor(() =>
      expect(mockAdminTogglePublish).toHaveBeenCalledWith('c1', true)
    );
  });
});
