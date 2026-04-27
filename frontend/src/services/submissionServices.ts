import api from "./api";
import type { SubmissonData } from "../types/models";

export const submissionAPI = {
  getSubmission: () => api.get("submission"),
  createSubmisson: (submissionData: SubmissonData) =>
    api.post("/submissin", submissionData),
  updateSubmission: (id: string, submissionData: SubmissonData) =>
    api.put(`/submisson/${id}`, submissionData),
  gradeSubmission: (id: string, grade: number) =>
    api.put(`/submission/${id}/grade`, { grade }),
};
