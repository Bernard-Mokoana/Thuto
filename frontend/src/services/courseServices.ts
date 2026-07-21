import api from "./api";
import type { LearningPath } from "../types/models";

type PathQueryParams = {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  level?: string;
  sortBy?: string;
};

type PathPayload = Partial<Omit<LearningPath, "category">> & { category: string };

export const courseAPI = {
  getPaths: (params?: PathQueryParams) => api.get("/courses", { params }),
  getCourses: (params?: PathQueryParams) => courseAPI.getPaths(params),
  getTutorPaths: () => api.get("/courses/tutor"),
  getTutorCourses: () => courseAPI.getTutorPaths(),
  getTutorPath: (id: string) => api.get(`/courses/tutor/${id}`),
  getTutorCourse: (id: string) => courseAPI.getTutorPath(id),
  getAdminPaths: () => api.get("/courses/admin/all"),
  getAdminCourses: () => courseAPI.getAdminPaths(),
  getPath: (id: string) => api.get(`/courses/${id}`),
  getCourse: (id: string) => courseAPI.getPath(id),
  createPath: (pathData: PathPayload) =>
    api.post("/courses", pathData),
  createCourse: (pathData: PathPayload | FormData) =>
    api.post("/courses", pathData),
  updatePath: (id: string, pathData: Partial<LearningPath>) =>
    api.put(`/courses/${id}`, pathData),
  updateCourse: (id: string, pathData: Partial<LearningPath> | FormData) =>
    api.put(`/courses/${id}`, pathData),
  deletePath: (id: string) => api.delete(`/courses/${id}`),
  deleteCourse: (id: string) => courseAPI.deletePath(id),
  adminTogglePublish: (id: string, isPublished: boolean) =>
    api.patch(`courses/admin/${id}/publish`, { isPublished }),
};
