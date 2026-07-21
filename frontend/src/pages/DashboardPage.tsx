import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Heart, Play, Trophy, Zap } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import { useAuth } from "../contexts/useAuth";
import { enrollmentAPI } from "../services/api";
import type { PathEnrollment, UserGamification } from "../types/models";
import { mockEnrollments, mockGamification } from "../data/gamifiedMock";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<PathEnrollment[]>(mockEnrollments);
  const [gamification] = useState<UserGamification>(mockGamification);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await enrollmentAPI.getEnrollments();
        const rawEnrollments = response.data?.enrollments ?? [];
        setEnrollments(rawEnrollments.length > 0 ? rawEnrollments : mockEnrollments);
      } catch (error) {
        setEnrollments(mockEnrollments);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const completedLessons = enrollments.reduce(
    (total, enrollment) =>
      total + (enrollment.progress?.filter((item) => item.status === "completed").length ?? 0),
    0
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading your streak...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-emerald-300">Daily practice</p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Welcome back, {user?.firstName ?? "learner"}.
          </h1>
          <p className="mt-2 text-slate-300">Keep your streak alive with one short lesson.</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total XP" value={gamification.totalXp} />
          <StatCard label="Level" value={gamification.level} />
          <StatCard label="Streak" value={`${gamification.currentStreak} days`} />
          <StatCard label="Completed Lessons" value={completedLessons} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Continue learning</h2>
            </div>
            <div className="space-y-4 p-6">
              {enrollments.map((enrollment) => {
                const progress = enrollment.path.progress ?? enrollment.progress?.[0]?.score ?? 0;
                const lessonId = enrollment.currentLesson?._id;
                return (
                  <div
                    key={enrollment._id}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                          {enrollment.path.category?.name ?? "Path"}
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-white">
                          {enrollment.path.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                          Next: {enrollment.currentLesson?.title ?? "First lesson"}
                        </p>
                      </div>
                      <Link
                        to={lessonId ? `/lessons/${lessonId}` : `/courses/${enrollment.path._id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
                      >
                        <Play className="h-4 w-4" />
                        Continue
                      </Link>
                    </div>
                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-sm text-slate-400">
                        <span>Path progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full bg-emerald-400" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
              <h2 className="mb-4 text-lg font-semibold text-white">Today</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-slate-950 p-3">
                  <span className="inline-flex items-center gap-2 text-slate-300">
                    <Flame className="h-4 w-4 text-orange-300" />
                    Streak
                  </span>
                  <strong>{gamification.currentStreak}</strong>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-950 p-3">
                  <span className="inline-flex items-center gap-2 text-slate-300">
                    <Heart className="h-4 w-4 text-rose-300" />
                    Hearts
                  </span>
                  <strong>{gamification.hearts}/5</strong>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-950 p-3">
                  <span className="inline-flex items-center gap-2 text-slate-300">
                    <Zap className="h-4 w-4 text-amber-300" />
                    Daily goal
                  </span>
                  <strong>{gamification.dailyGoalXp} XP</strong>
                </div>
              </div>
            </div>
            <Link
              to="/courses"
              className="flex items-center justify-center gap-2 rounded-lg border border-emerald-400/60 px-4 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-400 hover:text-slate-950"
            >
              <Trophy className="h-4 w-4" />
              Browse paths
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
