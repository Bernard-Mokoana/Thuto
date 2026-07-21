import api from "./api";
import type { LearningLesson, LearningModule, LessonStep } from "../types/models";

export const lessonAPI = {
  getModules: (pathId: string) => api.get(`/lessons/path/${pathId}/modules`),
  createModule: (pathId: string, moduleData: Partial<LearningModule>) =>
    api.post(`/lessons/path/${pathId}/modules`, moduleData),
  getLessonsByModule: (moduleId: string) => api.get(`/lessons/module/${moduleId}`),
  getLessons: (pathId: string) => api.get(`/lessons/course/${pathId}`),
  getLesson: (id: string) => api.get(`/lessons/${id}`),
  createLesson: (moduleId: string, lessonData: Partial<LearningLesson> | FormData) =>
    api.post(`/lessons/module/${moduleId}`, lessonData),
  updateLesson: (id: string, lessonData: Partial<LearningLesson> | FormData | Record<string, unknown>) =>
    api.put(`lessons/${id}`, lessonData),
  deleteLesson: (id: string) => api.delete(`lessons/${id}`),
  getSteps: (lessonId: string) => api.get(`/lessons/${lessonId}/steps`),
  createStep: (lessonId: string, stepData: Partial<LessonStep>) =>
    api.post(`/lessons/${lessonId}/steps`, stepData),
};
