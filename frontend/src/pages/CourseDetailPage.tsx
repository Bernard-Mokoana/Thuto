import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI, enrollmentAPI, lessonAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  CheckCircle, 
  ArrowRight,
  Download,
  Share2,
  Heart
} from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  duration: number;
  thumbnail?: string;
  category: {
    name: string;
  };
  tutor: {
    firstName: string;
    lastName: string;
    _id: string;
  };
  isPublished: boolean;
  requirements: string[];
  learningOutcomes: string[];
  tags: string[];
}

interface Lesson {
  _id: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  duration: number;
}

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const [courseResponse, lessonsResponse] = await Promise.all([
          courseAPI.getCourse(id!),
          lessonAPI.getLessons(id!)
        ]);
        
        setCourse(courseResponse.data);
        setLessons(lessonsResponse.data.data || lessonsResponse.data);
        
        // Check if user is enrolled
        if (isAuthenticated && user) {
          try {
            const enrollmentsResponse = await enrollmentAPI.getEnrollments();
            const userEnrollments = enrollmentsResponse.data.data || enrollmentsResponse.data;
            const enrolled = userEnrollments.some((enrollment: any) => 
              enrollment.course._id === id && enrollment.student._id === user._id
            );
            setIsEnrolled(enrolled);
          } catch (error) {
            console.error('Error checking enrollment:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseData();
    }
  }, [id, isAuthenticated, user, navigate]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      await enrollmentAPI.createEnrollment({
        course: id!,
        student: user!._id
      });
      setIsEnrolled(true);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <button
            onClick={() => navigate('/courses')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-sm text-primary-600 font-medium">
                    {course.category?.name || 'General'}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900 mt-2">
                    {course.title}
                  </h1>
                  <p className="text-lg text-gray-600 mt-2">
                    {course.description}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Heart className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>4.8 (1,234 reviews)</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>2,456 students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{course.duration} minutes</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>{lessons.length} lessons</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {['overview', 'curriculum', 'instructor'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                        activeTab === tab
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">What you'll learn</h3>
                      <ul className="space-y-2">
                        {course.learningOutcomes.map((outcome, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                      <ul className="space-y-2">
                        {course.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start">
                            <ArrowRight className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {course.tags && course.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {course.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Course Curriculum ({lessons.length} lessons)
                    </h3>
                    <div className="space-y-2">
                      {lessons.map((lesson, index) => (
                        <div key={lesson._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                              <p className="text-sm text-gray-600">{lesson.duration} minutes</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Play className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">Preview</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'instructor' && (
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-600">
                        {course.tutor.firstName[0]}{course.tutor.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {course.tutor.firstName} {course.tutor.lastName}
                      </h3>
                      <p className="text-gray-600 mb-2">Course Instructor</p>
                      <p className="text-gray-700">
                        Experienced instructor with expertise in this field. 
                        Dedicated to helping students achieve their learning goals.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    ${course.price}
                  </div>
                  <div className="text-sm text-gray-500">One-time payment</div>
                </div>

                {isEnrolled ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Continue Learning
                    </button>
                    <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                      <Download className="h-5 w-5 mr-2" />
                      Download Certificate
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {enrolling ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <BookOpen className="h-5 w-5 mr-2" />
                        Enroll Now
                      </>
                    )}
                  </button>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">This course includes:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {lessons.length} video lessons
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Lifetime access
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Certificate of completion
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Mobile and desktop access
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
