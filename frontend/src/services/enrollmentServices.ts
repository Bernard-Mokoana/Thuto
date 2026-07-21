import api from "./api";
import type { Enrollment } from "../types/models";

export const enrollmentAPI = {
  getEnrollments: () => api.get("/enrollments"),
  createEnrollment: (enrollmentData: { pathId?: string; courseId?: string; userId: string }) =>
    api.post("/enrollments/enroll", enrollmentData),
  enrollInPath: (pathId: string, userId: string) =>
    api.post(`/enrollments/paths/${pathId}/enroll`, { userId }),
  updateEnrollment: (id: string, enrollmentData: Enrollment) =>
    api.put(`/enrollments/${id}`, enrollmentData),
  deleteEnrollment: (id: string) => api.delete(`/enrollments/${id}`),
};
