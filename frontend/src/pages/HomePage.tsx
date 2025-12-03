import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { Play, Star, Users, Award, ArrowRight, BookOpen, Clock, Globe } from 'lucide-react';

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
  };
}

const HomePage: React.FC = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const response = await courseAPI.getCourses({ limit: 6 });
        setFeaturedCourses(response.data.course || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setFeaturedCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-accent to-primary bg-clip-text text-transparent animate-glow">
              Learn Without Limits
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/80">
              Start, switch, or advance your career with more than 5,000 courses, Professional Certificates, and degrees from world-class universities and companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/courses"
                className="glass text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/20 transition-all hover-lift inline-flex items-center justify-center border border-white/20"
              >
                Explore Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center"
              >
                Join for Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 glass-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center animate-fade-in">
            <div className="flex flex-col items-center hover-lift p-6 rounded-lg">
              <Users className="h-12 w-12 text-accent mb-4 animate-glow" />
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-white/70">Students</div>
            </div>
            <div className="flex flex-col items-center hover-lift p-6 rounded-lg">
              <BookOpen className="h-12 w-12 text-accent mb-4 animate-glow" />
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-white/70">Courses</div>
            </div>
            <div className="flex flex-col items-center hover-lift p-6 rounded-lg">
              <Award className="h-12 w-12 text-accent mb-4 animate-glow" />
              <div className="text-3xl font-bold text-white">100+</div>
              <div className="text-white/70">Instructors</div>
            </div>
            <div className="flex flex-col items-center hover-lift p-6 rounded-lg">
              <Globe className="h-12 w-12 text-accent mb-4 animate-glow" />
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-white/70">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Featured Courses
            </h2>
            <p className="text-xl text-white/70">
              Discover our most popular courses and start your learning journey today
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card rounded-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-slate-700"></div>
                  <div className="p-6">
                    <div className="h-4 bg-slate-600 rounded mb-2"></div>
                    <div className="h-4 bg-slate-600 rounded mb-4 w-3/4"></div>
                    <div className="h-4 bg-slate-600 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course, index) => (
                <div key={course._id} className="card rounded-lg overflow-hidden hover-lift animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
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
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-accent font-medium">
                        {course.category?.name || 'General'}
                      </span>
                      <span className="text-sm text-white/60">{course.level}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-white/70 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-white/60">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.duration} min
                      </div>
                      <div className="text-2xl font-bold text-accent">
                        ${course.price}
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link
                        to={`/courses/${course._id}`}
                        className="w-full btn-primary py-2 px-4 inline-flex items-center justify-center"
                      >
                        View Course
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/courses"
              className="btn-primary px-8 py-3 text-lg inline-flex items-center hover-lift"
            >
              View All Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-8 text-white/70">
            Join thousands of students who are already learning with us
          </p>
          <Link
            to="/register"
            className="glass text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all hover-lift inline-flex items-center"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
