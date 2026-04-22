import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { enrollmentAPI } from "../services/api";
import type { Enrollment } from "../types/models";

const ProgressPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await enrollmentAPI.getEnrollments();
        const items = Array.isArray(response.data?.enrollments)
          ? response.data.enrollments.filter(
              (item: Enrollment | null): item is Enrollment => Boolean(item?._id && item?.course)
            )
          : [];
        setEnrollments(items);
      } catch (error) {
        const message = axios.isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message || "Failed to load learning progress."
          : "Failed to load learning progress.";
        setError(message);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const summary = useMemo(() => {
    const completed = enrollments.filter((enrollment) =>
      enrollment.progress?.length
        ? enrollment.progress.every((item) => item.completed)
        : false
    ).length;

    return {
      totalCourses: enrollments.length,
      completedCourses: completed,
    };
  }, [enrollments]);

  const getProgressPercentage = (enrollment: Enrollment) => {
    const progress = Array.isArray(enrollment.progress) ? enrollment.progress : [];
    if (progress.length === 0) return 0;
    const completedLessons = progress.filter((item) => item.completed).length;
    return Math.round((completedLessons / progress.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Learning Progress</h1>
          <p className="text-lg text-gray-600 mt-2">
            Track how far you have come in each enrolled course.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <p className="text-sm text-gray-500">Enrolled Courses</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.totalCourses}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <p className="text-sm text-gray-500">Completed Courses</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.completedCourses}</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        ) : enrollments.length > 0 ? (
          <div className="space-y-4">
            {enrollments.map((enrollment) => {
              const progressPercentage = getProgressPercentage(enrollment);

              return (
                <div
                  key={enrollment._id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {enrollment.course?.title || "Untitled course"}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {enrollment.course?.level || "N/A"} · {Number(enrollment.course?.duration || 0)} min
                      </p>
                    </div>

                    <Link
                      to={enrollment.course?._id ? `/courses/${enrollment.course._id}` : "/courses"}
                      className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Open course
                    </Link>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span>Progress</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900">No course progress yet</h2>
            <p className="text-gray-600 mt-2">
              Enroll in a course to start tracking your progress.
            </p>
            <Link
              to="/courses"
              className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
            >
              Browse courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
