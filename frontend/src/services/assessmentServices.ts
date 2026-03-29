import api from "./api";
import type { CreateAssessment } from "../types/models";

export const assessmentAPI = {
  getAssessments: (courseId: string) =>
    api.get(`assessments/course/${courseId}`),
  getAssessment: (id: string) => api.get(`assessments/${id}`),
  createAssessment: (assessmentData: CreateAssessment) =>
    api.post("/assessments", assessmentData),
  updateAssessment: (id: string, assessmentData: CreateAssessment) =>
    api.put(`/assessments/${id}`, assessmentData),
  deleteAssessment: (id: string) => api.delete(`/assessments/${id}`),
};
