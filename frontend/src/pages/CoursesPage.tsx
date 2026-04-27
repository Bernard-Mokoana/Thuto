import { useState, useEffect } from 'react';
import { courseAPI, categoryAPI } from '../services/api';
import type { Category, Course } from '../types/models';

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const params: Parameters<typeof courseAPI.getCourses>[0] = {
          search: searchTerm || undefined,
          level: selectedLevel || undefined,
          category: selectedCategory || undefined,
          sortBy,
        };
        const response = await courseAPI.getCourses(params);
        setCourses(response.data.course || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [searchTerm, selectedLevel, selectedCategory, sortBy]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getCategories();
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const careerPaths = courses.filter((c) => c.type === 'career-path');
  const normalCourses = courses.filter((c) => c.type !== 'career-path');

  // Helper to get progress percentage (default to 0)
  const getProgress = (course: Course) => course.progress ?? 0;

  return (
    <div className="min-h-screen bg-[#232347]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">All courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Career Paths */}
          {careerPaths.map((path) => (
            <div
              key={path._id}
              className="rounded-xl border border-[#7c6ee6] bg-[#3b3970] p-6 mb-2"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#b7aaff] tracking-widest">
                  CAREER PATH
                </span>
                <span>
                  <img src={path.icon || '/default-career-icon.svg'} alt="" className="w-10 h-10" />
                </span>
              </div>
              <div className="text-lg text-white font-semibold mb-1">{path.title}</div>
              <div className="text-sm text-[#b7aaff] mb-2">
                {getProgress(path)}% complete
              </div>
              <div className="text-xs text-[#b7aaff]">
                {path.completedCourses || 0}/{path.totalCourses || 1}
              </div>
            </div>
          ))}
          {/* Normal Courses with progress */}
          {normalCourses.map((course) => (
            <div
              key={course._id}
              className="rounded-xl border border-yellow-400 bg-[#232347] p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-300 tracking-widest">
                  COURSE
                </span>
                <span>
                  <img src={course.icon || '/default-course-icon.svg'} alt="" className="w-10 h-10" />
                </span>
              </div>
              <div className="text-lg text-white font-semibold mb-3">{course.title}</div>
              <div className="text-sm text-[#b7aaff] mb-2">
                {getProgress(course)}% complete
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;