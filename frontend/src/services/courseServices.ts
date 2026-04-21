import api from "./api";
import type { Course } from "../types/models";

export const courseAPI = {
  getCourses: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    level?: string;
    sortBy?: string;
  }) => api.get("/courses", { params }),
  getTutorCourses: () => api.get("/courses/tutor"),
  getTutorCourse: (id: string) => api.get(`/courses/tutor/${id}`),
  getAdminCourses: () => api.get("/courses/admin/all"),
  getCourse: (id: string) => api.get(`/courses/${id}`),
  createCourse: (courseData: FormData) =>
    api.post("/courses", courseData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  updateCourse: (id: string, courseData: Partial<Course> | FormData) =>
    api.put(`/courses/${id}`, courseData, {
      ...(courseData instanceof FormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : {}),
    }),
  deleteCourse: (id: string) => api.delete(`/course/${id}`),
  adminTogglePublish: (id: string, isPublished: boolean) =>
    api.patch(`courses/admin/${id}/publish`, { isPublished }),
};
