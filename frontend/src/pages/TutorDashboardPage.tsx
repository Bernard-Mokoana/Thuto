import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courseAPI } from '../services/api';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  duration: number;
  thumbnail?: string;
  isPublished: boolean;
  createdAt: string;
  enrollmentCount?: number;
  revenue?: number;
}

const TutorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        setLoading(true);
        const coursesResponse = await courseAPI.getCourses();
        const fetchedCourses = coursesResponse.data.course || [];
        setCourses(fetchedCourses);

        // Calculate stats from the fetched courses
        const totalCourses = fetchedCourses.length;
        const publishedCourses = fetchedCourses.filter(course => course.isPublished).length;
        const totalStudents = fetchedCourses.reduce((total, course) => total + (course.enrollmentCount || 0), 0);
        const totalRevenue = fetchedCourses.reduce((total, course) => total + (course.revenue || 0), 0);

        setStats({
          totalCourses,
          publishedCourses,
          totalStudents,
          totalRevenue,
        });
      } catch (error) {
        console.error('Error fetching tutor data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTutorData();
    }
  }, [user]);

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseAPI.deleteCourse(courseId);
        setCourses(courses.filter(course => course._id !== courseId));
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Instructor Dashboard
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Manage your courses and track your teaching progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm font-medium text-gray-500">Total Courses</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm font-medium text-gray-500">Published</p>
            <p className="text-2xl font-bold text-gray-900">{stats.publishedCourses}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm font-medium text-gray-500">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</p>
          </div>
        </div>

        {/* Courses Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
            <Link
              to="/courses/new"
              className="bg-blue-500 text-white px-4 py-2 rounded-md inline-flex items-center text-sm hover:bg-blue-600"
            >
              Create Course
            </Link>
          </div>
          
          <div className="p-6">
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-sm text-gray-500">{course.level}</span>
                      </div>

                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{course.duration} min</span>
                        <span>${course.price}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Link
                            to={`/courses/${course._id}`}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            title="View Course"
                          >
                            View
                          </Link>
                          <Link
                            to={`/courses/${course._id}/edit`}
                            className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                            title="Edit Course"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteCourse(course._id)}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                            title="Delete Course"
                          >
                            Delete
                          </button>
                        </div>

                        <div className="text-sm text-gray-500">
                          {course.enrollmentCount || 0} students
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-800 mb-2">No courses yet</h3>
                <p className="text-gray-500 mb-6">
                  Create your first course and start teaching students around the world
                </p>
                <Link
                  to="/courses/new"
                  className="bg-blue-500 text-white px-6 py-3 rounded-md inline-flex items-center hover:bg-blue-600"
                >
                  Create Your First Course
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600 mb-4">
              View detailed analytics for your courses and student engagement
            </p>
            <button className="text-blue-500 hover:text-blue-600 font-medium transition-colors">
              View Analytics →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Students</h3>
            <p className="text-gray-600 mb-4">
              Manage your students and track their progress
            </p>
            <button className="text-blue-500 hover:text-blue-600 font-medium transition-colors">
              Manage Students →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Certificates</h3>
            <p className="text-gray-600 mb-4">
              Generate and manage certificates for your students
            </p>
            <button className="text-blue-500 hover:text-blue-600 font-medium transition-colors">
              Manage Certificates →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboardPage;