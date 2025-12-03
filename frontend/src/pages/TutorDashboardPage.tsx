import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courseAPI } from '../services/api';
import { 
  BookOpen, 
  Plus, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Award,
  Edit,
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react';

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

        setCourses(coursesResponse.data.course || []);

        // Calculate stats from courses
        const totalCourses = courses.length;
        const publishedCourses = courses.filter(course => course.isPublished).length;
        const totalStudents = courses.reduce((total, course) => total + (course.enrollmentCount || 0), 0);
        const totalRevenue = courses.reduce((total, course) => total + (course.revenue || 0), 0);

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
            Instructor Dashboard
          </h1>
          <p className="text-lg text-white/70 mt-2">
            Manage your courses and track your teaching progress
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
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Published</p>
                <p className="text-2xl font-bold text-white">{stats.publishedCourses}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 hover-lift">
            <div className="flex items-center">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Total Students</p>
                <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 hover-lift">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Total Revenue</p>
                <p className="text-2xl font-bold text-white">${stats.totalRevenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="glass rounded-lg">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">My Courses</h2>
            <Link
              to="/courses/new"
              className="btn-primary px-4 py-2 inline-flex items-center hover-lift"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Link>
          </div>
          
          <div className="p-6">
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                  <div key={course._id} className="border border-white/10 rounded-lg overflow-hidden hover:bg-white/5 transition-all hover-lift animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-16 w-16 text-accent" />
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.isPublished
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-sm text-white/60">{course.level}</span>
                      </div>

                      <h3 className="font-semibold text-white mb-2 line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-sm text-white/70 mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                        <span>{course.duration} min</span>
                        <span>${course.price}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Link
                            to={`/courses/${course._id}`}
                            className="p-2 text-white/60 hover:text-white transition-colors"
                            title="View Course"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/courses/${course._id}/edit`}
                            className="p-2 text-white/60 hover:text-accent transition-colors"
                            title="Edit Course"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteCourse(course._id)}
                            className="p-2 text-white/60 hover:text-red-400 transition-colors"
                            title="Delete Course"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-sm text-white/60">
                          {course.enrollmentCount || 0} students
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No courses yet</h3>
                <p className="text-white/70 mb-6">
                  Create your first course and start teaching students around the world
                </p>
                <Link
                  to="/courses/new"
                  className="btn-primary px-6 py-3 inline-flex items-center hover-lift"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Course
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="glass rounded-lg p-6 hover-lift">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-8 w-8 text-accent mr-3" />
              <h3 className="text-lg font-semibold text-white">Analytics</h3>
            </div>
            <p className="text-white/70 mb-4">
              View detailed analytics for your courses and student engagement
            </p>
            <button className="text-accent hover:text-accent/80 font-medium transition-colors">
              View Analytics →
            </button>
          </div>

          <div className="glass rounded-lg p-6 hover-lift">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-accent mr-3" />
              <h3 className="text-lg font-semibold text-white">Students</h3>
            </div>
            <p className="text-white/70 mb-4">
              Manage your students and track their progress
            </p>
            <button className="text-accent hover:text-accent/80 font-medium transition-colors">
              Manage Students →
            </button>
          </div>

          <div className="glass rounded-lg p-6 hover-lift">
            <div className="flex items-center mb-4">
              <Award className="h-8 w-8 text-accent mr-3" />
              <h3 className="text-lg font-semibold text-white">Certificates</h3>
            </div>
            <p className="text-white/70 mb-4">
              Generate and manage certificates for your students
            </p>
            <button className="text-accent hover:text-accent/80 font-medium transition-colors">
              Manage Certificates →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboardPage;
