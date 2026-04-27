import api from "./api";

export const statsAPI = {
  getStats: () => api.get("/stats"),
  getCourseStats: (courseId: string) => api.get(`/stats/course/${courseId}`),
  getUserStats: (userId: string) => api.get(`/stats/user/${userId}`),
};
