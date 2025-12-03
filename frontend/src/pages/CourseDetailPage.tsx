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
            const userEnrollments = enrollmentsResponse.data.enrollments || [];
            const enrolled = userEnrollments.some((enrollment: any) =>
              enrollment.course._id === id
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Course not found</h2>
          <button
            onClick={() => navigate('/courses')}
            className="btn-primary px-6 py-2"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="glass rounded-lg p-6 mb-6 animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-sm text-accent font-medium">
                    {course.category?.name || 'General'}
                  </span>
                  <h1 className="text-3xl font-bold text-white mt-2">
                    {course.title}
                  </h1>
                  <p className="text-lg text-white/70 mt-2">
                    {course.description}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-white/60 hover:text-accent transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-white/60 hover:text-accent transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-white/70">
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
            <div className="glass rounded-lg mb-6">
              <div className="border-b border-white/10">
                <nav className="flex space-x-8 px-6">
                  {['overview', 'curriculum', 'instructor'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                        activeTab === tab
                          ? 'border-accent text-accent'
                          : 'border-transparent text-white/70 hover:text-white hover:border-white/30'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">What you'll learn</h3>
                      <ul className="space-y-2">
                        {course.learningOutcomes.map((outcome, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-white/90">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
                      <ul className="space-y-2">
                        {course.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start">
                            <ArrowRight className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-white/90">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {course.tags && course.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {course.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm border border-accent/30"
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
                  <div className="animate-fade-in">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Course Curriculum ({lessons.length} lessons)
                    </h3>
                    <div className="space-y-2">
                      {lessons.map((lesson, index) => (
                        <div key={lesson._id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-accent/20 text-accent rounded-full flex items-center justify-center text-sm font-medium mr-3">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{lesson.title}</h4>
                              <p className="text-sm text-white/60">{lesson.duration} minutes</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Play className="h-4 w-4 text-accent" />
                            <span className="text-sm text-white/70">Preview</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'instructor' && (
                  <div className="flex items-start space-x-4 animate-fade-in">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center border border-accent/30">
                      <span className="text-2xl font-bold text-accent">
                        {course.tutor.firstName[0]}{course.tutor.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {course.tutor.firstName} {course.tutor.lastName}
                      </h3>
                      <p className="text-white/70 mb-2">Course Instructor</p>
                      <p className="text-white/90">
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
              <div className="glass rounded-lg p-6 animate-slide-up">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-accent mb-2 animate-glow">
                    ${course.price}
                  </div>
                  <div className="text-sm text-white/60">One-time payment</div>
                </div>

                {isEnrolled ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-400 transition-all hover-lift flex items-center justify-center"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Continue Learning
                    </button>
                    <button className="w-full border border-white/20 text-white py-3 px-4 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center">
                      <Download className="h-5 w-5 mr-2" />
                      Download Certificate
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full btn-primary py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="font-semibold text-white mb-3">This course includes:</h4>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      {lessons.length} video lessons
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      Lifetime access
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      Certificate of completion
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
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
