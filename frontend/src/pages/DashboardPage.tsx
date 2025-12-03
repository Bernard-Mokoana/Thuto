import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { enrollmentAPI, progressAPI } from '../services/api';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Award, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

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

        // Calculate stats
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-lg text-white/70 mt-2">
            Continue your learning journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <div className="card p-6 hover-lift">
            <div className="flex items-center">
              <div className="p-2 bg-primary/20 rounded-lg">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Total Courses</p>
                <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 hover-lift">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completedCourses}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 hover-lift">
            <div className="flex items-center">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Time Spent</p>
                <p className="text-2xl font-bold text-white">{Math.round(stats.totalTimeSpent / 60)}h</p>
              </div>
            </div>
          </div>

          <div className="card p-6 hover-lift">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Award className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Certificates</p>
                <p className="text-2xl font-bold text-white">{stats.certificatesEarned}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <div className="glass rounded-lg">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">My Courses</h2>
              </div>
              <div className="p-6">
                {enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.map((enrollment, index) => {
                      const progressPercentage = getProgressPercentage(enrollment);
                      return (
                        <div key={enrollment._id} className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-all hover-lift animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                                  <BookOpen className="h-6 w-6 text-accent" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-white">
                                    {enrollment.course.title}
                                  </h3>
                                  <p className="text-sm text-white/70">
                                    {enrollment.course.level} • {enrollment.course.duration} min
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4">
                                <div className="flex items-center justify-between text-sm text-white/70 mb-2">
                                  <span>Progress</span>
                                  <span>{progressPercentage}%</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2">
                                  <div
                                    className="bg-accent h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            <div className="ml-4">
                              <Link
                                to={`/courses/${enrollment.course._id}`}
                                className="btn-primary px-4 py-2 inline-flex items-center text-sm"
                              >
                                <Play className="h-4 w-4 mr-1" />
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
                    <BookOpen className="h-12 w-12 text-white/40 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No courses yet</h3>
                    <p className="text-white/70 mb-4">
                      Start your learning journey by enrolling in a course
                    </p>
                    <Link
                      to="/courses"
                      className="btn-primary px-6 py-2 inline-flex items-center"
                    >
                      Browse Courses
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="glass rounded-lg">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  to="/courses"
                  className="flex items-center p-3 text-white/90 hover:bg-white/10 rounded-lg transition-colors hover-lift"
                >
                  <BookOpen className="h-5 w-5 mr-3 text-accent" />
                  <span>Browse Courses</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center p-3 text-white/90 hover:bg-white/10 rounded-lg transition-colors hover-lift"
                >
                  <Award className="h-5 w-5 mr-3 text-accent" />
                  <span>View Certificates</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center p-3 text-white/90 hover:bg-white/10 rounded-lg transition-colors hover-lift"
                >
                  <TrendingUp className="h-5 w-5 mr-3 text-accent" />
                  <span>View Progress</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-lg">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              </div>
              <div className="p-6">
                {enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.slice(0, 3).map((enrollment, index) => (
                      <div key={enrollment._id} className="flex items-center space-x-3 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                        <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                          <Play className="h-4 w-4 text-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            Enrolled in {enrollment.course.title}
                          </p>
                          <p className="text-xs text-white/60">
                            {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60 text-sm">No recent activity</p>
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
