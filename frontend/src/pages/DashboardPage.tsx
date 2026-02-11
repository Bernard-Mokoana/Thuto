import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { enrollmentAPI } from '../services/api';

interface Enrollment {
  _id: string;
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
    duration: number;
    level: string;
  };
  progress: Array<{
    lesson: string;
    completed: boolean;
    completedAt?: string;
  }>;
  enrolledAt: string;
  certificateUrl?: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalTimeSpent: 0,
    certificatesEarned: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await enrollmentAPI.getEnrollments();
        const userEnrollments = response.data.enrollments || [];
        setEnrollments(userEnrollments);

        const totalCourses = userEnrollments.length;
        const completedCourses = userEnrollments.filter((enrollment: Enrollment) => 
          enrollment.certificateUrl
        ).length;
        const totalTimeSpent = userEnrollments.reduce((total: number, enrollment: Enrollment) => 
          total + enrollment.course.duration, 0
        );
        const certificatesEarned = completedCourses;

        setStats({
          totalCourses,
          completedCourses,
          totalTimeSpent,
          certificatesEarned,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getProgressPercentage = (enrollment: Enrollment) => {
    if (enrollment.progress.length === 0) return 0;
    const completedLessons = enrollment.progress.filter(p => p.completed).length;
    return Math.round((completedLessons / enrollment.progress.length) * 100);
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
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Continue your learning journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Time Spent</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(stats.totalTimeSpent / 60)}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.certificatesEarned}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
              </div>
              <div className="p-6">
                {enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.map((enrollment) => {
                      const progressPercentage = getProgressPercentage(enrollment);
                      return (
                        <div key={enrollment._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-800">
                                    {enrollment.course.title}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {enrollment.course.level} • {enrollment.course.duration} min
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4">
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                                  <span>Progress</span>
                                  <span>{progressPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            <div className="ml-4">
                              <Link
                                to={`/courses/${enrollment.course._id}`}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md inline-flex items-center text-sm hover:bg-blue-600"
                              >
                                Continue
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No courses yet</h3>
                    <p className="text-gray-500 mb-4">
                      Start your learning journey by enrolling in a course
                    </p>
                    <Link
                      to="/courses"
                      className="bg-blue-500 text-white px-6 py-2 rounded-md inline-flex items-center hover:bg-blue-600"
                    >
                      Browse Courses
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  to="/courses"
                  className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span>Browse Courses</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span>View Certificates</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span>View Progress</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                {enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.slice(0, 3).map((enrollment) => (
                      <div key={enrollment._id} className="flex items-center space-x-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            Enrolled in {enrollment.course.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;