import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI, categoryAPI, lessonAPI } from '../services/api';
import { toast } from 'react-toastify';

interface Category {
  _id: string;
  name: string;
}

interface LessonDraft {
  title: string;
  content: string;
  order: number;
  video: File | null;
  materials: File[];
}

const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    level: 'beginner',
    thumbnail: null as File | null,
  });
  const [lessons, setLessons] = useState<LessonDraft[]>([
    { title: '', content: '', order: 1, video: null, materials: [] },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getCategories();
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Could not fetch categories.');
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({
        ...formData,
        thumbnail: e.target.files[0],
      });
    }
  };

  const handleLessonChange = (
    index: number,
    field: keyof LessonDraft,
    value: string | number | File | File[] | null
  ) => {
    setLessons((prev) =>
      prev.map((lesson, i) =>
        i === index ? { ...lesson, [field]: value } : lesson
      )
    );
  };

  const addLesson = () => {
    setLessons((prev) => [
      ...prev,
      { title: '', content: '', order: prev.length + 1, video: null, materials: [] },
    ]);
  };

  const removeLesson = (index: number) => {
    setLessons((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const courseData = new FormData();
      courseData.append('title', formData.title);
      courseData.append('description', formData.description);
      courseData.append('price', formData.price);
      courseData.append('category', formData.category);
      courseData.append('level', formData.level);
      if (formData.thumbnail) {
        courseData.append('thumbnail', formData.thumbnail);
      }

      const response = await courseAPI.createCourse(courseData);
      const createdCourse = response.data.course;
      const courseId = createdCourse?._id;

      if (courseId) {
        const validLessons = lessons.filter(
          (lesson) => lesson.title.trim() && lesson.order !== undefined
        );

        for (const lesson of validLessons) {
          const lessonData = new FormData();
          lessonData.append('title', lesson.title);
          lessonData.append('content', lesson.content);
          lessonData.append('order', String(lesson.order));
          if (lesson.video) {
            lessonData.append('video', lesson.video);
          }
          if (lesson.materials.length > 0) {
            lesson.materials.forEach((file) => lessonData.append('materials', file));
          }
          await lessonAPI.createLesson(courseId, lessonData);
        }
      }

      toast.success('Course created successfully!');
      if (courseId) {
        navigate(`/courses/${courseId}/publish`, {
          state: { course: createdCourse },
        });
      } else {
        navigate('/tutor-dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred while creating the course.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Create a New Course</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="price" className="block text-gray-700 font-medium mb-2">Price (R)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-gray-700 font-medium mb-2">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="level" className="block text-gray-700 font-medium mb-2">Level</label>
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

          <div className="mb-6">
            <label htmlFor="thumbnail" className="block text-gray-700 font-medium mb-2">Thumbnail</label>
            <input
              type="file"
              id="thumbnail"
              name="thumbnail"
              onChange={handleFileChange}
              className="w-full text-gray-700"
              accept="image/*"
            />
            <p className="text-xs text-gray-500 mt-1">Upload a course thumbnail image (e.g., JPG, PNG).</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Lessons</h2>
              <button
                type="button"
                onClick={addLesson}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Add lesson
              </button>
            </div>

            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div key={`lesson-${index}`} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">Lesson {index + 1}</p>
                    {lessons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLesson(index)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) =>
                        handleLessonChange(index, 'title', e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Content
                    </label>
                    <textarea
                      value={lesson.content}
                      onChange={(e) =>
                        handleLessonChange(index, 'content', e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Video
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          handleLessonChange(
                            index,
                            'video',
                            e.target.files?.[0] || null
                          )
                        }
                        className="w-full text-gray-700"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload lesson video.
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Materials (optional)
                      </label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) =>
                          handleLessonChange(
                            index,
                            'materials',
                            e.target.files ? Array.from(e.target.files) : []
                          )
                        }
                        className="w-full text-gray-700"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        PDFs, slides, or other resources.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/tutor/dashboard')}
              className="mr-4 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCoursePage;
