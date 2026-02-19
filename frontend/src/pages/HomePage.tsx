import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { categoryAPI, courseAPI } from "../services/api";
import type { Category, Course } from "../types/models";

const HomePage: React.FC = () => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError("");

        const [coursesResponse, categoriesResponse] = await Promise.all([
          courseAPI.getCourses(),
          categoryAPI.getCategories(),
        ]);

        const allCourses = (coursesResponse.data.course || []) as Course[];
        const publishedCourses = allCourses.filter((course) => course.isPublished);
        const sortedCourses = [...publishedCourses].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        setAllCourses(publishedCourses);
        setFeaturedCourses(sortedCourses.slice(0, 6));
        setCategories((categoriesResponse.data.categories || []) as Category[]);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
        setError("We could not load homepage data right now.");
        setAllCourses([]);
        setFeaturedCourses([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const stats = useMemo(() => {
    const totalCourses = allCourses.length;
    const uniqueInstructors = new Set(
      allCourses
        .map((course) => course.tutor?._id || `${course.tutor?.firstName}-${course.tutor?.lastName}`)
        .filter(Boolean)
    ).size;
    const avgDuration =
      totalCourses > 0
        ? Math.round(
            allCourses.reduce((sum, course) => sum + (course.duration || 0), 0) /
              totalCourses
          )
        : 0;

    return {
      totalCourses,
      categories: categories.length,
      instructors: uniqueInstructors,
      avgDuration,
    };
  }, [allCourses, categories]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.1),_transparent_35%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 relative">
          <div className="max-w-3xl">
            <p className="text-blue-500 text-sm tracking-[0.24em] uppercase mb-4">
              Learn Smarter
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-gray-800">
              Build practical skills with courses that move your career forward.
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl">
              Explore up-to-date content from expert tutors and start learning with a clear path.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/courses"
                className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-all inline-flex items-center justify-center"
              >
                Explore Courses
              </Link>
              <Link
                to="/register"
                className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-300 transition-all inline-flex items-center justify-center border border-gray-300"
              >
                Join for Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="text-3xl font-bold text-gray-800">
                {loading ? "..." : stats.totalCourses}
              </div>
              <div className="text-gray-600">Published Courses</div>
            </div>
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="text-3xl font-bold text-gray-800">
                {loading ? "..." : stats.categories}
              </div>
              <div className="text-gray-600">Learning Categories</div>
            </div>
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="text-3xl font-bold text-gray-800">
                {loading ? "..." : stats.instructors}
              </div>
              <div className="text-gray-600">Active Instructors</div>
            </div>
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="text-3xl font-bold text-gray-800">
                {loading ? "..." : `${stats.avgDuration} min`}
              </div>
              <div className="text-gray-600">Average Course Duration</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Featured Courses
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Start with high-impact courses built to help you ship projects, land roles, and grow faster.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden bg-white border border-gray-200 animate-pulse"
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-amber-500/10 border border-amber-400/30 text-amber-200 p-4 rounded-xl">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <div
                  key={course._id}
                  className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-lg shadow-slate-200/70 hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="h-48 bg-slate-100 flex items-center justify-center">
                    {course.thumbnail?.trim() ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-slate-500">No Image</span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs tracking-wide uppercase text-blue-600 font-semibold">
                        {course.category?.name || "General"}
                      </span>
                      <span className="text-sm text-slate-500 capitalize">{course.level}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-slate-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-slate-500">
                        {course.duration} min
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(course.price)}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">
                      by {course.tutor?.firstName} {course.tutor?.lastName}
                    </p>
                    <div className="mt-4">
                      <Link
                        to={`/courses/${course._id}`}
                        className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-lg inline-flex items-center justify-center hover:bg-blue-600"
                      >
                        View Course
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
              className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg inline-flex items-center hover:bg-blue-600"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-8 text-gray-600">
            Join thousands of students who are already learning with us
          </p>
          <Link
            to="/register"
            className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-all inline-flex items-center"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
