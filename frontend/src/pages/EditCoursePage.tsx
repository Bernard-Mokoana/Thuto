import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { categoryAPI, courseAPI, lessonAPI } from "../services/api";

interface Category {
  _id: string;
  name: string;
}

interface EditableLesson {
  localId: string;
  _id?: string;
  title: string;
  content: string;
  order: number;
  videoUrl: string;
  isNew: boolean;
}

const EditCoursePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState<EditableLesson[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    level: "beginner",
    thumbnail: null as File | null,
    existingThumbnail: "",
  });

  useEffect(() => {
    if (!id) {
      toast.error("Missing course id.");
      navigate("/tutor-dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseResponse, categoryResponse] = await Promise.all([
          courseAPI.getTutorCourse(id),
          categoryAPI.getCategories(),
        ]);
        const lessonsResponse = await lessonAPI.getLessons(id);

        const course = courseResponse.data.course;
        const fetchedLessons = (lessonsResponse.data?.Lessons ||
          []) as EditableLesson[];

        setCategories(categoryResponse.data.categories || []);
        setLessons(
          fetchedLessons
            .map((lesson) => ({
              localId: lesson._id || `lesson-${Math.random().toString(36).slice(2)}`,
              _id: lesson._id,
              title: lesson.title || "",
              content: lesson.content || "",
              order: lesson.order ?? 1,
              videoUrl: lesson.videoUrl || "",
              isNew: false,
            }))
            .sort((a, b) => a.order - b.order)
        );
        setFormData((prev) => ({
          ...prev,
          title: course?.title || "",
          description: course?.description || "",
          price: String(course?.price ?? ""),
          category: course?.category?._id || course?.category || "",
          level: course?.level || "beginner",
          existingThumbnail: course?.thumbnail || "",
        }));
      } catch (error: any) {
        const message =
          error.response?.data?.message || "Failed to load course details.";
        toast.error(message);
        navigate("/tutor-dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setFormData((prev) => ({ ...prev, thumbnail: e.target.files![0] }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("price", formData.price);
      payload.append("category", formData.category);
      payload.append("level", formData.level);
      if (formData.thumbnail) {
        payload.append("thumbnail", formData.thumbnail);
      }

      await courseAPI.updateCourse(id, payload);

      const existingLessons = lessons.filter((lesson) => !lesson.isNew);
      const newLessons = lessons.filter((lesson) => lesson.isNew);

      await Promise.all(
        existingLessons.map((lesson) =>
          lessonAPI.updateLesson(lesson._id!, {
            title: lesson.title,
            content: lesson.content,
            order: lesson.order,
            videoUrl: lesson.videoUrl || undefined,
          })
        )
      );

      for (const lesson of newLessons) {
        const newLessonData = new FormData();
        newLessonData.append("title", lesson.title);
        newLessonData.append("content", lesson.content);
        newLessonData.append("order", String(lesson.order));
        if (lesson.videoUrl.trim()) {
          newLessonData.append("videoUrl", lesson.videoUrl.trim());
        }
        await lessonAPI.createLesson(id, newLessonData);
      }

      toast.success("Course updated successfully.");
      navigate(`/courses/${id}/publish`);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to update course.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleLessonChange = (
    localId: string,
    field: keyof Omit<EditableLesson, "_id" | "isNew">,
    value: string | number
  ) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.localId === localId ? { ...lesson, [field]: value } : lesson
      )
    );
  };

  const addLesson = () => {
    setLessons((prev) => {
      const nextOrder =
        prev.length > 0 ? Math.max(...prev.map((lesson) => lesson.order)) + 1 : 1;
      return [
        ...prev,
        {
          localId: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: "",
          content: "",
          order: nextOrder,
          videoUrl: "",
          isNew: true,
        },
      ];
    });
  };

  const removeLesson = async (localId: string) => {
    const lesson = lessons.find((item) => item.localId === localId);
    if (!lesson) return;

    if (lesson._id) {
      const confirmed = window.confirm("Delete this lesson?");
      if (!confirmed) return;

      try {
        await lessonAPI.deleteLesson(lesson._id);
        setLessons((prev) => prev.filter((item) => item.localId !== localId));
        toast.success("Lesson deleted.");
      } catch (error: any) {
        const message =
          error.response?.data?.message || "Failed to delete lesson.";
        toast.error(message);
      }
      return;
    }

    setLessons((prev) => prev.filter((item) => item.localId !== localId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-900">Edit course</h1>
          <p className="text-gray-600 mt-1">Update your course details and save changes.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price (R)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail
            </label>
            <input
              id="thumbnail"
              name="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-gray-700"
            />
            {formData.existingThumbnail?.trim() && (
              <img
                src={formData.existingThumbnail}
                alt="Current thumbnail"
                className="mt-3 h-36 w-full max-w-sm object-cover rounded-md border border-gray-200"
              />
            )}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Lessons</h2>
              <button
                type="button"
                onClick={addLesson}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Add lesson
              </button>
            </div>

            {lessons.length === 0 ? (
              <p className="text-sm text-gray-500 mb-4">
                No lessons yet. Add your first lesson.
              </p>
            ) : null}

            <div className="space-y-4">
              {lessons
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((lesson) => (
                  <div key={lesson.localId} className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        Lesson {lesson.order} {lesson.isNew ? "(new)" : ""}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeLesson(lesson.localId)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div className="md:col-span-4">
                        <label className="block text-sm text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) =>
                            handleLessonChange(lesson.localId, "title", e.target.value)
                          }
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Order</label>
                        <input
                          type="number"
                          min="1"
                          value={lesson.order}
                          onChange={(e) =>
                            handleLessonChange(
                              lesson.localId,
                              "order",
                              Number(e.target.value || 1)
                            )
                          }
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm text-gray-700 mb-1">Content</label>
                      <textarea
                        value={lesson.content}
                        onChange={(e) =>
                          handleLessonChange(lesson.localId, "content", e.target.value)
                        }
                        rows={3}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm text-gray-700 mb-1">
                        Video URL (optional)
                      </label>
                      <input
                        type="url"
                        value={lesson.videoUrl}
                        onChange={(e) =>
                          handleLessonChange(lesson.localId, "videoUrl", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/courses/${id}/publish`)}
              className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCoursePage;
