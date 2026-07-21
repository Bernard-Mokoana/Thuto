import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BookOpen, CheckCircle2, Flame, Lock, Play, Trophy, Zap } from "lucide-react";
import { courseAPI, enrollmentAPI } from "../services/api";
import { useAuth } from "../contexts/useAuth";
import type { LearningLesson, LearningModule, LearningPath, PathEnrollment } from "../types/models";
import { mockLessons, mockModules, mockPaths } from "../data/gamifiedMock";
import { toast } from "react-toastify";

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [lessons, setLessons] = useState<LearningLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const isStudent = user?.role === "Student";

  useEffect(() => {
    const fetchPath = async () => {
      try {
        setLoading(true);
        const response = await courseAPI.getPath(id!);
        const pathData = response.data?.path ?? response.data?.course ?? response.data;
        const moduleData = response.data?.modules ?? [];
        const lessonData = response.data?.lessons ?? [];
        setPath(pathData ?? mockPaths.find((item) => item._id === id) ?? mockPaths[0]);
        setModules(moduleData.length > 0 ? moduleData : mockModules);
        setLessons(lessonData.length > 0 ? lessonData : mockLessons);
      } catch (error) {
        setPath(mockPaths.find((item) => item._id === id) ?? mockPaths[0]);
        setModules(mockModules);
        setLessons(mockLessons);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPath();
  }, [id]);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!isAuthenticated || !user || !isStudent || !id) return;
      try {
        const response = await enrollmentAPI.getEnrollments();
        const enrollments: PathEnrollment[] = response.data?.enrollments ?? [];
        setIsEnrolled(enrollments.some((enrollment) => enrollment.path?._id === id));
      } catch (error) {
        setIsEnrolled(false);
      }
    };

    checkEnrollment();
  }, [id, isAuthenticated, isStudent, user]);

  const firstLessonId = useMemo(() => {
    return [...lessons].sort((a, b) => a.order - b.order)[0]?._id ?? null;
  }, [lessons]);

  const lessonsByModule = useMemo(() => {
    return modules.map((module) => ({
      module,
      lessons: lessons
        .filter((lesson) => lesson.module === module._id)
        .sort((a, b) => a.order - b.order),
    }));
  }, [lessons, modules]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!isStudent) {
      toast.warn("Only student accounts can start learning paths.");
      return;
    }
    if (!id) return;

    try {
      setEnrolling(true);
      await enrollmentAPI.createEnrollment({ pathId: id, userId: user!._id });
      setIsEnrolled(true);
      if (firstLessonId) navigate(`/lessons/${firstLessonId}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setIsEnrolled(true);
        if (firstLessonId) navigate(`/lessons/${firstLessonId}`);
        return;
      }
      toast.success("Path started locally. Backend can be connected later.");
      setIsEnrolled(true);
      if (firstLessonId) navigate(`/lessons/${firstLessonId}`);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading path...
      </div>
    );
  }

  if (!path) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Path not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <main>
            <div className="mb-6 rounded-lg border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm font-semibold text-emerald-300">
                {path.category?.name ?? "Learning path"}
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white">{path.title}</h1>
              <p className="mt-3 max-w-3xl text-slate-300">{path.description}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2">
                  <BookOpen className="h-4 w-4 text-blue-300" />
                  {path.lessonCount ?? lessons.length} lessons
                </span>
                <span className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2">
                  <Zap className="h-4 w-4 text-amber-300" />
                  {path.totalXp} XP
                </span>
                <span className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 capitalize">
                  <Trophy className="h-4 w-4 text-emerald-300" />
                  {path.level}
                </span>
              </div>
            </div>

            <section className="rounded-lg border border-slate-800 bg-slate-900">
              <div className="border-b border-slate-800 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">Path map</h2>
              </div>
              <div className="space-y-5 p-6">
                {lessonsByModule.map(({ module, lessons: moduleLessons }, moduleIndex) => (
                  <div key={module._id} className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Module {moduleIndex + 1}
                        </p>
                        <h3 className="text-lg font-bold text-white">{module.title}</h3>
                        <p className="mt-1 text-sm text-slate-400">{module.description}</p>
                      </div>
                      {(module.requiredXpToUnlock ?? 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2 py-1 text-xs text-slate-400">
                          <Lock className="h-3 w-3" />
                          {module.requiredXpToUnlock} XP
                        </span>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      {moduleLessons.map((lesson, lessonIndex) => (
                        <Link
                          key={lesson._id}
                          to={`/lessons/${lesson._id}`}
                          className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 transition hover:border-emerald-400/70"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-slate-950">
                              {lessonIndex + 1}
                            </span>
                            <div>
                              <p className="font-semibold text-white">{lesson.title}</p>
                              <p className="text-sm text-slate-400">{lesson.estimatedMinutes} min</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-emerald-300">
                            {lesson.xpReward} XP
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>

          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
              <div className="mb-4 flex items-center gap-2 text-orange-300">
                <Flame className="h-5 w-5" />
                <span className="font-semibold">Build the habit</span>
              </div>
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60"
              >
                <Play className="h-4 w-4" />
                {isEnrolled ? "Continue path" : enrolling ? "Starting..." : "Start path"}
              </button>
              <p className="text-sm text-slate-400">
                Complete short tasks, earn XP, and unlock the next module through practice.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
              <h2 className="mb-3 text-lg font-semibold text-white">Outcomes</h2>
              <ul className="space-y-2">
                {(path.outcomes ?? []).map((outcome) => (
                  <li key={outcome} className="flex gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
