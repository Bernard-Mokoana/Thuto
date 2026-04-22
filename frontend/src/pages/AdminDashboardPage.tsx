import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  categoryAPI,
  courseAPI,
  transactionAPI,
  userAPI,
} from "../services/api";
import type { Course, User, UserRole, TransactionRecord, DeleteTarget } from "../types/models";



const AdminDashboardPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [processingCourseId, setProcessingCourseId] = useState<string | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [usersResponse, coursesResponse, categoriesResponse, transactionsResponse] =
        await Promise.all([
          userAPI.getUsers(),
          courseAPI.getAdminCourses(),
          categoryAPI.getCategories(),
          transactionAPI.getTransactions(),
        ]);

      setUsers(usersResponse.data.users || []);
      setCourses(coursesResponse.data.courses || []);
      setCategoriesCount((categoriesResponse.data.categories || []).length);
      setTransactions(transactionsResponse.data.transaction || []);
    } catch (error) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || "Failed to load admin dashboard"
        : "Failed to load admin dashboard";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const publishedCourses = courses.filter((item) => item.isPublished).length;
    const students = users.filter((item) => item.role === "Student").length;
    const tutors = users.filter((item) => item.role === "Tutor").length;
    const admins = users.filter((item) => item.role === "Admin").length;
    const successfulRevenue = transactions
      .filter((item) => item.status === "success")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      totalUsers: users.length,
      students,
      tutors,
      admins,
      totalCourses: courses.length,
      publishedCourses,
      draftCourses: courses.length - publishedCourses,
      categoriesCount,
      successfulRevenue,
      totalTransactions: transactions.length,
    };
  }, [users, courses, categoriesCount, transactions]);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      setProcessingUserId(userId);
      await userAPI.updateUserRole(userId, role);
      setUsers((prev) =>
        prev.map((item) => (item._id === userId ? { ...item, role } : item))
      );
      toast.success("User role updated");
    } catch (error) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || "Failed to update user role"
        : "Failed to update user role";
      toast.error(message);
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleDelete = (type: NonNullable<DeleteTarget>["type"], id: string) => {
    setDeleteTarget({ type, id });
  };

  const cancelDelete = () => {
    if (processingUserId || processingCourseId) {
      return;
    }
    setDeleteTarget(null);
  };

  const confirmUserDelete = async (userId: string) => {
    try {
      setProcessingUserId(userId);
      await userAPI.deleteUser(userId);
      setUsers((prev) => prev.filter((item) => item._id !== userId));
      toast.success("User deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || "Failed to delete user"
        : "Failed to delete user";
      toast.error(message);
    } finally {
      setProcessingUserId(null);
    }
  };

  const confirmCourseDelete = async (courseId: string) => {
    try {
      setProcessingCourseId(courseId);
      await courseAPI.deleteCourse(courseId);
      setCourses((prev) => prev.filter((item) => item._id !== courseId));
      toast.success("Course deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || "Failed to delete course"
        : "Failed to delete course";
      toast.error(message);
    } finally {
      setProcessingCourseId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    if (deleteTarget.type === "user") {
      await confirmUserDelete(deleteTarget.id);
      return;
    }

    await confirmCourseDelete(deleteTarget.id);
  };

  const handleTogglePublish = async (courseId: string, nextStatus: boolean) => {
    try {
      setProcessingCourseId(courseId);
      await courseAPI.adminTogglePublish(courseId, nextStatus);
      setCourses((prev) =>
        prev.map((item) =>
          item._id === courseId ? { ...item, isPublished: nextStatus } : item
        )
      );
      toast.success(
        nextStatus ? "Course published successfully" : "Course unpublished"
      );
    } catch (error) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || "Failed to update course status"
        : "Failed to update course status";
      toast.error(message);
    } finally {
      setProcessingCourseId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Full platform control over users, courses, categories, and
                operations.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/categories/new"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
              >
                Create Category
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-5">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.students} Students, {stats.tutors} Tutors, {stats.admins} Admins
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5">
            <p className="text-sm text-gray-500">Total Courses</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalCourses}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.publishedCourses} Published, {stats.draftCourses} Draft
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.categoriesCount}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5">
            <p className="text-sm text-gray-500">Transactions</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalTransactions}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5">
            <p className="text-sm text-gray-500">Revenue (Success)</p>
            <p className="text-2xl font-bold text-gray-900">
              R{stats.successfulRevenue.toFixed(2)}
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Manage Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item._id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-800">
                      {item.firstName} {item.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={item.role}
                        onChange={(event) =>
                          handleRoleChange(item._id, event.target.value as UserRole)
                        }
                        disabled={processingUserId === item._id}
                        className="px-2 py-1 border border-gray-300 rounded-md"
                      >
                        <option value="Student">Student</option>
                        <option value="Tutor">Tutor</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete("user", item._id)}
                        disabled={processingUserId === item._id}
                        className="px-3 py-1 text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Manage Courses
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Tutor
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((item) => (
                  <tr key={item._id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-800">{item.title}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.tutor
                        ? `${item.tutor.firstName} ${item.tutor.lastName}`
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">R{item.price}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleTogglePublish(item._id, !item.isPublished)
                          }
                          disabled={processingCourseId === item._id}
                          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-60"
                        >
                          {item.isPublished ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => handleDelete("course", item._id)}
                          disabled={processingCourseId === item._id}
                          className="px-3 py-1 text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="px-6 pt-6 pb-5 text-center">
              <h3 className="text-2xl font-bold text-gray-700">
                Delete {deleteTarget.type === "user" ? "User" : "Course"}
              </h3>
              <p className="mt-3 text-lg text-gray-700">
                Are you sure you want to delete this {deleteTarget.type}?
              </p>
            </div>
            <div className="flex border-t border-gray-200">
              <button
                onClick={cancelDelete}
                disabled={Boolean(processingUserId || processingCourseId)}
                className="w-1/2 border-r border-gray-200 py-3 text-xl font-medium text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={Boolean(processingUserId || processingCourseId)}
                className="w-1/2 py-3 text-xl font-semibold text-red-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
