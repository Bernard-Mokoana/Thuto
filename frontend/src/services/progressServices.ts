import api from "./api";
import type { EnrollmentProgress } from "../types/models";

export const progressAPI = {
  getProgress: (courseId: string) => api.get(`/progress/course/${courseId}`),
  updateProgress: (progressData: EnrollmentProgress) =>
    api.post("/progress", progressData),
  markLessonComplete: (lessonId: string) =>
    api.post(`/progress/lesson/${lessonId}/complete`),
};
