import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Heart, X, Zap } from "lucide-react";
import { lessonAPI, submissionAPI } from "../services/api";
import type { LearningLesson, LessonStep, Task } from "../types/models";
import { mockLessons, mockSteps } from "../data/gamifiedMock";

const LessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LearningLesson | null>(null);
  const [steps, setSteps] = useState<LessonStep[]>(mockSteps);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [earnedXp, setEarnedXp] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await lessonAPI.getLesson(id!);
        const lessonData = response.data?.lesson ?? response.data;
        const stepData = response.data?.steps ?? [];
        setLesson(lessonData ?? mockLessons.find((item) => item._id === id) ?? mockLessons[0]);
        setSteps(stepData.length > 0 ? stepData : mockSteps);
      } catch (error) {
        setLesson(mockLessons.find((item) => item._id === id) ?? mockLessons[0]);
        setSteps(mockSteps);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLesson();
  }, [id]);

  const activeStep = steps[activeIndex];
  const activeTask: Task | undefined = activeStep?.tasks?.[0];
  const progress = steps.length ? Math.round(((activeIndex + 1) / steps.length) * 100) : 0;

  const localCorrectAnswer = useMemo(() => {
    if (activeTask?._id === "task-paragraph") return "<p>";
    if (activeTask?._id === "task-closing-p") return "p";
    return "";
  }, [activeTask]);

  const submitAnswer = async () => {
    if (!activeTask) {
      goNext();
      return;
    }

    const localCorrect =
      selectedAnswer.trim().toLowerCase() === localCorrectAnswer.trim().toLowerCase();

    try {
      const response = await submissionAPI.createAttempt({
        taskId: activeTask._id,
        submittedAnswer: selectedAnswer,
      });
      const isCorrect = response.data?.isCorrect ?? localCorrect;
      const xpEarned = response.data?.xpEarned ?? (isCorrect ? activeTask.xpReward : 0);
      setEarnedXp((current) => current + xpEarned);
      setHearts(response.data?.heartsRemaining ?? (isCorrect ? hearts : Math.max(0, hearts - 1)));
      setFeedback({
        correct: isCorrect,
        text: response.data?.feedback ?? activeTask.explanation ?? "",
      });
    } catch (error) {
      setEarnedXp((current) => current + (localCorrect ? activeTask.xpReward : 0));
      setHearts(localCorrect ? hearts : Math.max(0, hearts - 1));
      setFeedback({
        correct: localCorrect,
        text: activeTask.explanation ?? (localCorrect ? "Correct." : "Try again."),
      });
    }
  };

  const goNext = () => {
    setSelectedAnswer("");
    setFeedback(null);
    if (activeIndex < steps.length - 1) {
      setActiveIndex((current) => current + 1);
      return;
    }
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading lesson...
      </div>
    );
  }

  if (!lesson || !activeStep) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Lesson not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-6">
        <header className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="rounded-md p-2 text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-4 text-sm font-semibold">
              <span className="inline-flex items-center gap-1 text-rose-300">
                <Heart className="h-4 w-4" />
                {hearts}
              </span>
              <span className="inline-flex items-center gap-1 text-amber-300">
                <Zap className="h-4 w-4" />
                {earnedXp} XP
              </span>
            </div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </header>

        <main className="flex flex-1 flex-col rounded-lg border border-slate-800 bg-slate-900 p-6">
          <p className="mb-2 text-sm font-semibold text-emerald-300">{lesson.title}</p>
          <h1 className="mb-6 text-2xl font-bold text-white">
            {activeStep.title || activeStep.prompt || activeTask?.question}
          </h1>

          {activeStep.content ? (
            <pre className="mb-6 whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-200">
              {activeStep.content}
            </pre>
          ) : null}

          {activeStep.type === "explanation" ? (
            <button
              onClick={goNext}
              className="mt-auto rounded-lg bg-emerald-400 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-300"
            >
              Continue
            </button>
          ) : (
            <div className="mt-auto space-y-4">
              {activeTask?.options?.length ? (
                <div className="grid gap-3">
                  {activeTask.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedAnswer(option)}
                      className={`rounded-lg border px-4 py-3 text-left font-semibold transition ${
                        selectedAnswer === option
                          ? "border-emerald-400 bg-emerald-400/10 text-emerald-200"
                          : "border-slate-800 bg-slate-950 text-slate-200 hover:border-slate-600"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  value={selectedAnswer}
                  onChange={(event) => setSelectedAnswer(event.target.value)}
                  className="h-12 w-full rounded-lg border border-slate-800 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
                  placeholder="Type your answer"
                />
              )}

              {feedback ? (
                <div
                  className={`flex items-start gap-3 rounded-lg border p-4 ${
                    feedback.correct
                      ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-100"
                      : "border-rose-400/60 bg-rose-400/10 text-rose-100"
                  }`}
                >
                  {feedback.correct ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                  <p>{feedback.text}</p>
                </div>
              ) : null}

              <button
                onClick={feedback ? goNext : submitAnswer}
                disabled={!feedback && !selectedAnswer.trim()}
                className="w-full rounded-lg bg-emerald-400 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {feedback ? "Continue" : "Check"}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LessonPage;
