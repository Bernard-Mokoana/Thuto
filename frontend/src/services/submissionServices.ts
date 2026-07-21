import api from "./api";
import type { SubmissonData } from "../types/models";

export const submissionAPI = {
  getSubmission: () => api.get("/submission"),
  createSubmisson: (submissionData: SubmissonData) =>
    api.post("/submission/attempt", submissionData),
  createAttempt: (submissionData: SubmissonData) =>
    api.post("/submission/attempt", submissionData),
  updateSubmission: (id: string, submissionData: SubmissonData) =>
    api.put(`/submission/${id}`, submissionData),
  gradeSubmission: (id: string, isCorrect: boolean, xpEarned = 0) =>
    api.put(`/submission/${id}/grade`, { isCorrect, xpEarned }),
};
