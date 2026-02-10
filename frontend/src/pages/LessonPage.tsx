import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lessonAPI } from "../services/api";

interface Lesson {
  _id: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  duration: number;
}

const LessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await lessonAPI.getLesson(id!);
        const lessonData = response.data?.lesson ?? response.data;
        setLesson(lessonData ?? null);
      } catch (error) {
        console.error("Error fetching lesson:", error);
        setLesson(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLesson();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Lesson not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Lesson {lesson.order}</p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{lesson.title}</h1>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Back
            </button>
          </div>

          {lesson.videoUrl ? (
            <div className="mb-6">
              <video
                className="w-full rounded-lg"
                controls
                src={lesson.videoUrl}
              />
            </div>
          ) : null}

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{lesson.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
