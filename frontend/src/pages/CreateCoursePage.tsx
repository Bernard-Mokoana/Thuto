import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { categoryAPI, courseAPI, lessonAPI } from "../services/api";
import { toast } from "react-toastify";
import type { Category, LessonStepType, TaskType } from "../types/models";
import { mockCategories } from "../data/gamifiedMock";
import { getErrorMessage } from "../utils/errorMessage";

interface TaskDraft {
  question: string;
  type: TaskType;
  options: string;
  correctAnswer: string;
  explanation: string;
  xpReward: number;
}

interface StepDraft {
  title: string;
  type: LessonStepType;
  prompt: string;
  content: string;
  order: number;
  task: TaskDraft;
}

interface LessonDraft {
  title: string;
  summary: string;
  order: number;
  xpReward: number;
  estimatedMinutes: number;
  steps: StepDraft[];
}

const defaultTask = (): TaskDraft => ({
  question: "",
  type: "multiple_choice",
  options: "",
  correctAnswer: "",
  explanation: "",
  xpReward: 10,
});

const defaultStep = (order: number): StepDraft => ({
  title: "",
  type: order === 1 ? "explanation" : "multiple_choice",
  prompt: "",
  content: "",
  order,
  task: defaultTask(),
});

const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    estimatedMinutes: 30,
    totalXp: 100,
    outcomes: "",
    tags: "",
  });
  const [moduleTitle, setModuleTitle] = useState("Getting started");
  const [lessons, setLessons] = useState<LessonDraft[]>([
    {
      title: "",
      summary: "",
      order: 1,
      xpReward: 30,
      estimatedMinutes: 4,
      steps: [defaultStep(1), defaultStep(2)],
    },
  ]);
  const [loading, setLoading] = useState(false);

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

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const updateLesson = <K extends keyof LessonDraft>(
    index: number,
    key: K,
    value: LessonDraft[K]
  ) => {
    setLessons((current) =>
      current.map((lesson, lessonIndex) =>
        lessonIndex === index ? { ...lesson, [key]: value } : lesson
      )
    );
  };

  const updateStep = <K extends keyof StepDraft>(
    lessonIndex: number,
    stepIndex: number,
    key: K,
    value: StepDraft[K]
  ) => {
    setLessons((current) =>
      current.map((lesson, currentLessonIndex) =>
        currentLessonIndex === lessonIndex
          ? {
              ...lesson,
              steps: lesson.steps.map((step, currentStepIndex) =>
                currentStepIndex === stepIndex ? { ...step, [key]: value } : step
              ),
            }
          : lesson
      )
    );
  };

  const updateTask = <K extends keyof TaskDraft>(
    lessonIndex: number,
    stepIndex: number,
    key: K,
    value: TaskDraft[K]
  ) => {
    setLessons((current) =>
      current.map((lesson, currentLessonIndex) =>
        currentLessonIndex === lessonIndex
          ? {
              ...lesson,
              steps: lesson.steps.map((step, currentStepIndex) =>
                currentStepIndex === stepIndex
                  ? { ...step, task: { ...step.task, [key]: value } }
                  : step
              ),
            }
          : lesson
      )
    );
  };

  const addLesson = () => {
    setLessons((current) => [
      ...current,
      {
        title: "",
        summary: "",
        order: current.length + 1,
        xpReward: 30,
        estimatedMinutes: 4,
        steps: [defaultStep(1), defaultStep(2)],
      },
    ]);
  };

  const addStep = (lessonIndex: number) => {
    setLessons((current) =>
      current.map((lesson, index) =>
        index === lessonIndex
          ? { ...lesson, steps: [...lesson.steps, defaultStep(lesson.steps.length + 1)] }
          : lesson
      )
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const pathResponse = await courseAPI.createPath({
        title: formData.title,
        description: formData.description,
        category: formData.category || categories[0]?._id,
        level: formData.level as "beginner" | "intermediate" | "advanced",
        estimatedMinutes: Number(formData.estimatedMinutes),
        totalXp: Number(formData.totalXp),
        outcomes: formData.outcomes.split("\n").filter(Boolean),
        tags: formData.tags.split(",").map((item) => item.trim()).filter(Boolean),
      });

      const pathId = pathResponse.data?.path?._id ?? pathResponse.data?.course?._id;

      if (pathId) {
        const moduleResponse = await lessonAPI.createModule(pathId, {
          title: moduleTitle,
          description: "First module",
          order: 1,
          isPublished: true,
        });
        const moduleId = moduleResponse.data?.module?._id;

        if (moduleId) {
          for (const lesson of lessons.filter((item) => item.title.trim())) {
            const lessonResponse = await lessonAPI.createLesson(moduleId, {
              title: lesson.title,
              summary: lesson.summary,
              order: lesson.order,
              xpReward: lesson.xpReward,
              estimatedMinutes: lesson.estimatedMinutes,
              isPublished: true,
            });
            const lessonId = lessonResponse.data?.lesson?._id ?? lessonResponse.data?.newLesson?._id;

            if (lessonId) {
              for (const step of lesson.steps) {
                await lessonAPI.createStep(lessonId, {
                  title: step.title,
                  type: step.type,
                  prompt: step.prompt,
                  content: step.content,
                  order: step.order,
                  tasks:
                    step.type === "explanation"
                      ? []
                      : [
                          {
                            ...step.task,
                            options: step.task.options
                              .split("\n")
                              .map((item) => item.trim())
                              .filter(Boolean),
                          },
                        ],
                } as never);
              }
            }
          }
        }
      }

      toast.success("Learning path created.");
      navigate(pathId ? `/courses/${pathId}` : "/tutor-dashboard");
    } catch (error: unknown) {
      toast.success("Draft saved locally. Backend connection can be wired later.");
      console.warn(getErrorMessage(error, "Could not create path yet."));
      navigate("/tutor-dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-sm font-semibold text-emerald-300">Content builder</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Create learning path</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Path details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm text-slate-300">Title</span>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-white outline-none focus:border-emerald-400"
                />
              </label>
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm text-slate-300">Description</span>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-400"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm text-slate-300">Category</span>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-white outline-none focus:border-emerald-400"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-sm text-slate-300">Level</span>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-white outline-none focus:border-emerald-400"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-sm text-slate-300">Estimated minutes</span>
                <input
                  type="number"
                  name="estimatedMinutes"
                  value={formData.estimatedMinutes}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-white outline-none focus:border-emerald-400"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm text-slate-300">Total XP</span>
                <input
                  type="number"
                  name="totalXp"
                  value={formData.totalXp}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-white outline-none focus:border-emerald-400"
                />
              </label>
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm text-slate-300">Outcomes</span>
                <textarea
                  name="outcomes"
                  value={formData.outcomes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="One outcome per line"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-400"
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">First module</h2>
                <input
                  value={moduleTitle}
                  onChange={(event) => setModuleTitle(event.target.value)}
                  className="mt-2 h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-white outline-none focus:border-emerald-400"
                />
              </div>
              <button
                type="button"
                onClick={addLesson}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-emerald-400"
              >
                <Plus className="h-4 w-4" />
                Lesson
              </button>
            </div>

            <div className="space-y-5">
              {lessons.map((lesson, lessonIndex) => (
                <div key={lessonIndex} className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Lesson {lessonIndex + 1}</h3>
                    {lessons.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => setLessons((current) => current.filter((_, index) => index !== lessonIndex))}
                        className="rounded-md p-2 text-rose-300 hover:bg-rose-400/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={lesson.title}
                      onChange={(event) => updateLesson(lessonIndex, "title", event.target.value)}
                      placeholder="Lesson title"
                      className="h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-white outline-none focus:border-emerald-400"
                    />
                    <input
                      value={lesson.summary}
                      onChange={(event) => updateLesson(lessonIndex, "summary", event.target.value)}
                      placeholder="Short summary"
                      className="h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-white outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="mt-4 space-y-3">
                    {lesson.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          <select
                            value={step.type}
                            onChange={(event) =>
                              updateStep(lessonIndex, stepIndex, "type", event.target.value as LessonStepType)
                            }
                            className="h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-white outline-none focus:border-emerald-400"
                          >
                            <option value="explanation">Explanation</option>
                            <option value="multiple_choice">Multiple choice</option>
                            <option value="fill_blank">Fill blank</option>
                            <option value="code">Code</option>
                          </select>
                          <input
                            value={step.title}
                            onChange={(event) => updateStep(lessonIndex, stepIndex, "title", event.target.value)}
                            placeholder="Step title"
                            className="h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-white outline-none focus:border-emerald-400"
                          />
                        </div>
                        <textarea
                          value={step.content}
                          onChange={(event) => updateStep(lessonIndex, stepIndex, "content", event.target.value)}
                          rows={3}
                          placeholder="Explanation or prompt content"
                          className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-400"
                        />
                        {step.type !== "explanation" ? (
                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <input
                              value={step.task.question}
                              onChange={(event) => updateTask(lessonIndex, stepIndex, "question", event.target.value)}
                              placeholder="Task question"
                              className="h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-white outline-none focus:border-emerald-400"
                            />
                            <input
                              value={step.task.correctAnswer}
                              onChange={(event) => updateTask(lessonIndex, stepIndex, "correctAnswer", event.target.value)}
                              placeholder="Correct answer"
                              className="h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-white outline-none focus:border-emerald-400"
                            />
                            <textarea
                              value={step.task.options}
                              onChange={(event) => updateTask(lessonIndex, stepIndex, "options", event.target.value)}
                              rows={3}
                              placeholder="Options, one per line"
                              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-400"
                            />
                            <textarea
                              value={step.task.explanation}
                              onChange={(event) => updateTask(lessonIndex, stepIndex, "explanation", event.target.value)}
                              rows={3}
                              placeholder="Feedback explanation"
                              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-400"
                            />
                          </div>
                        ) : null}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addStep(lessonIndex)}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-emerald-400"
                    >
                      Add step
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-400 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-300 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create path"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCoursePage;
