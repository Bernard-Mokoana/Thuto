import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Flame, Search, Sparkles, Trophy } from "lucide-react";
import { courseAPI, categoryAPI } from "../services/api";
import type { Category, LearningPath } from "../types/models";
import { mockCategories, mockPaths } from "../data/gamifiedMock";

const CoursesPage = () => {
  const [paths, setPaths] = useState<LearningPath[]>(mockPaths);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        setLoading(true);
        const response = await courseAPI.getPaths({
          search: searchTerm || undefined,
          level: selectedLevel || undefined,
          category: selectedCategory || undefined,
          sortBy: "newest",
        });
        const pathData = response.data?.paths ?? response.data?.course ?? [];
        setPaths(Array.isArray(pathData) && pathData.length > 0 ? pathData : mockPaths);
      } catch (error) {
        setPaths(mockPaths);
      } finally {
        setLoading(false);
      }
    };

    fetchPaths();
  }, [searchTerm, selectedLevel, selectedCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getCategories();
        const categoryData = response.data?.categories ?? [];
        setCategories(categoryData.length > 0 ? categoryData : mockCategories);
      } catch (error) {
        setCategories(mockCategories);
      }
    };

    fetchCategories();
  }, []);

  const filteredPaths = useMemo(() => {
    return paths.filter((path) => {
      const matchesSearch =
        !searchTerm ||
        path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        path.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = !selectedLevel || path.level === selectedLevel;
      const matchesCategory =
        !selectedCategory || path.category?._id === selectedCategory;
      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [paths, searchTerm, selectedLevel, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <Sparkles className="h-4 w-4" />
              Bite-sized learning paths
            </p>
            <h1 className="text-3xl font-bold text-white">Choose your path</h1>
            <p className="mt-2 max-w-2xl text-slate-300">
              Practice with short lessons, instant feedback, XP, streaks, and checkpoints.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
              <Trophy className="mx-auto mb-1 h-5 w-5 text-amber-300" />
              <p className="text-xs text-slate-400">XP paths</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
              <Flame className="mx-auto mb-1 h-5 w-5 text-orange-300" />
              <p className="text-xs text-slate-400">Streaks</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
              <BookOpen className="mx-auto mb-1 h-5 w-5 text-blue-300" />
              <p className="text-xs text-slate-400">Tasks</p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_180px_220px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-800 bg-slate-900 pl-10 pr-3 text-sm text-white outline-none ring-0 transition focus:border-emerald-400"
              placeholder="Search paths"
            />
          </label>
          <select
            value={selectedLevel}
            onChange={(event) => setSelectedLevel(event.target.value)}
            className="h-11 rounded-lg border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none focus:border-emerald-400"
          >
            <option value="">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="h-11 rounded-lg border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none focus:border-emerald-400"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">Loading paths...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPaths.map((path) => (
              <Link
                key={path._id}
                to={`/courses/${path._id}`}
                className="group rounded-lg border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-0.5 hover:border-emerald-400/70"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                      {path.category?.name ?? "Learning Path"}
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-white">{path.title}</h2>
                  </div>
                  <span className="rounded-md bg-slate-800 px-2 py-1 text-xs capitalize text-slate-300">
                    {path.level}
                  </span>
                </div>
                <p className="mb-5 line-clamp-3 text-sm leading-6 text-slate-300">
                  {path.description}
                </p>
                <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
                  <span>{path.lessonCount ?? 0} lessons</span>
                  <span>{path.totalXp} XP</span>
                  <span>{path.estimatedMinutes} min</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${path.progress ?? 0}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-semibold text-emerald-300">
                  Start practice
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
