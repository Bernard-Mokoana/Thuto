import api from "./api";

export const lessonAPI = {
  getLessons: (courseId: string) => api.get(`/lessons/course/${courseId}`),
  getLesson: (id: string) => api.get(`/lessons/${id}`),
  createLesson: (courseId: string, lessonData: FormData) =>
    api.post(`/lessons/course/${courseId}`, lessonData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  updateLesson: (id: string, lessonData: FormData | Record<string, unknown>) =>
    api.put(`lessons/${id}`, lessonData, {
      ...(lessonData instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {}),
    }),
  deleteLesson: (id: string) => api.delete(`lessons/${id}`),
};
