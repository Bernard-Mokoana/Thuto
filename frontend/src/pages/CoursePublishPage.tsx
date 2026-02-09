import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { courseAPI } from "../services/api";

interface CourseState {
  _id: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  isPublished?: boolean;
}

interface LocationState {
  course?: CourseState;
}

const CoursePublishPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const state = (location.state as LocationState | null) || null;

  const courseFromState = useMemo(() => state?.course, [state]);
  const [course, setCourse] = useState<CourseState | undefined>(
    courseFromState
  );
  const [isPublished, setIsPublished] = useState<boolean>(
    courseFromState?.isPublished ?? false
  );
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!courseFromState);

  useEffect(() => {
    if (!id || courseFromState) return;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await courseAPI.getTutorCourse(id);
        setCourse(response.data.course);
        setIsPublished(response.data.course?.isPublished ?? false);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Failed to load course details.";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, courseFromState]);

  const handleToggle = async () => {
    if (!id) {
      toast.error("Missing course id.");
      return;
    }

    const nextValue = !isPublished;
    setSaving(true);
    try {
      await courseAPI.updateCourse(id, { isPublished: nextValue });
      setIsPublished(nextValue);
      toast.success(
        nextValue ? "Course published successfully." : "Course unpublished."
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update publish status. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <p className="text-sm text-gray-500">Course setup</p>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">
            Publish your course
          </h1>
          <p className="text-gray-600 mt-2">
            You can publish now or keep it as a draft and return later.
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Course
              </p>
              <h2 className="text-lg font-semibold text-gray-900 mt-2">
                {course?.title || "Untitled course"}
              </h2>
              <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                {course?.description ||
                  "Add lessons and details, then publish when ready."}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Publish status
                </p>
                <p className="text-xs text-gray-500">
                  {isPublished ? "Visible to students" : "Only you can see it"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggle}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  isPublished ? "bg-green-500" : "bg-gray-300"
                } ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
                aria-pressed={isPublished}
                aria-label="Toggle publish status"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                    isPublished ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              {course?.thumbnail?.trim() ? (
                <img
                  src={course.thumbnail}
                  alt={course.title || "Course thumbnail"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">No thumbnail</span>
              )}
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">
                Tip: Students are more likely to enroll when you add a clear
                thumbnail and detailed lessons.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(`/courses/${id}/edit`)}
            className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Edit course
          </button>
          <button
            type="button"
            onClick={() => navigate("/tutor-dashboard")}
            className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoursePublishPage;
