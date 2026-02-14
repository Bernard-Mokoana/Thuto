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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_34%,rgba(79,70,229,0.35),transparent_34%),radial-gradient(circle_at_72%_28%,rgba(56,189,248,0.2),transparent_28%),linear-gradient(130deg,#0b1020_0%,#111827_45%,#0f172a_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-xs uppercase tracking-[0.28em] text-cyan-300/90">Thuto Roadmaps</p>
            <h1 className="mb-5 text-4xl font-extrabold leading-tight md:text-6xl">
              <span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                Learn Better.
              </span>
              <br />
              <span>Ship Skills Faster.</span>
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-slate-300">
              Structured learning tracks trusted by students and mentors to turn consistency
              into real career outcomes.
            </p>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-500 px-7 py-3.5 text-base font-semibold text-white shadow-[0_8px_30px_rgba(99,102,241,0.45)] transition-all hover:-translate-y-0.5 hover:bg-indigo-400"
              >
                Start Learning
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-600 bg-slate-900/70 px-7 py-3.5 text-base font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:text-white"
              >
                Browse Courses
              </Link>
            </div>
            <div className="max-w-sm rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-2xl shadow-slate-950">
              <p className="mb-3 text-sm font-semibold text-white">Continue</p>
              <div className="mb-3 flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2">
                <span className="text-sm font-semibold text-slate-200">Frontend Interview Pack</span>
                <span className="text-xs text-slate-400">20/75</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                <div className="h-full w-[27%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300" />
              </div>
              <p className="mt-3 text-sm text-slate-400">Next: Advanced React Patterns</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-indigo-500/20 blur-2xl" />
            <div className="absolute -right-6 bottom-16 h-20 w-20 rounded-full bg-cyan-400/20 blur-2xl" />
            <div className="relative rounded-3xl border border-slate-700 bg-slate-900/70 p-6 backdrop-blur-sm">
              <svg className="absolute inset-0 h-full w-full text-slate-300/70" viewBox="0 0 560 380" fill="none">
                <path d="M280 58 L280 95" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M280 95 C220 95 200 120 200 145" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M280 95 C340 95 360 120 360 145" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M200 175 C200 220 280 210 280 250" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M360 175 C360 220 280 210 280 250" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M280 280 L280 315" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M280 315 C235 315 220 328 220 345" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M280 315 C325 315 340 328 340 345" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>

              <div className="relative z-10 min-h-[380px]">
                <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white">
                  Foundations
                </div>
                <div className="absolute left-[22%] top-24 -translate-x-1/2 rounded-lg bg-fuchsia-500 px-4 py-2 text-xs font-semibold text-white">
                  HTML + CSS
                </div>
                <div className="absolute left-[78%] top-24 -translate-x-1/2 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white">
                  JavaScript
                </div>
                <div className="absolute left-[22%] top-52 -translate-x-1/2 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white">
                  React
                </div>
                <div className="absolute left-[78%] top-52 -translate-x-1/2 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white">
                  APIs
                </div>
                <div className="absolute left-1/2 top-[15.1rem] -translate-x-1/2 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white">
                  Projects
                </div>
                <div className="absolute left-[26%] top-[21.5rem] -translate-x-1/2 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white">
                  Testing
                </div>
                <div className="absolute left-[74%] top-[21.5rem] -translate-x-1/2 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white">
                  Deploy
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-800 bg-slate-950 py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
              <div className="text-3xl font-bold text-white">
                {loading ? "..." : stats.totalCourses}
              </div>
              <div className="text-slate-400">Published Courses</div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
              <div className="text-3xl font-bold text-white">
                {loading ? "..." : stats.categories}
              </div>
              <div className="text-slate-400">Learning Categories</div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
              <div className="text-3xl font-bold text-white">
                {loading ? "..." : stats.instructors}
              </div>
              <div className="text-slate-400">Active Instructors</div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
              <div className="text-3xl font-bold text-white">
                {loading ? "..." : `${stats.avgDuration} min`}
              </div>
              <div className="text-slate-400">Average Course Duration</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Featured Courses
            </h2>
            <p className="max-w-2xl text-lg text-slate-300">
              Start with high-impact courses built to help you ship projects, land roles, and grow faster.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 animate-pulse"
                >
                  <div className="h-48 bg-slate-800"></div>
                  <div className="p-6">
                    <div className="mb-2 h-4 rounded bg-slate-700"></div>
                    <div className="mb-4 h-4 w-3/4 rounded bg-slate-700"></div>
                    <div className="h-4 w-1/2 rounded bg-slate-700"></div>
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
                  className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/95 shadow-xl shadow-slate-950 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex h-48 items-center justify-center bg-slate-800">
                    {course.thumbnail?.trim() ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-slate-400">No Image</span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                        {course.category?.name || "General"}
                      </span>
                      <span className="text-sm capitalize text-slate-400">{course.level}</span>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-slate-100 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="mb-4 text-slate-300 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-slate-400">
                        {course.duration} min
                      </div>
                      <div className="text-2xl font-bold text-indigo-300">
                        {formatCurrency(course.price)}
                      </div>
                    </div>
                    <p className="mb-4 text-sm text-slate-400">
                      by {course.tutor?.firstName} {course.tutor?.lastName}
                    </p>
                    <div className="mt-4">
                      <Link
                        to={`/courses/${course._id}`}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-white transition hover:bg-indigo-400"
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
              className="inline-flex items-center rounded-xl border border-slate-600 px-8 py-3 text-lg text-slate-200 transition hover:border-cyan-300/60 hover:text-white"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-950 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to Start Learning?
          </h2>
          <p className="mb-8 text-xl text-slate-300">
            Join thousands of students who are already learning with us
          </p>
          <Link
            to="/register"
            className="inline-flex items-center rounded-2xl bg-indigo-500 px-8 py-3 text-lg font-semibold text-white shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition hover:bg-indigo-400"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
