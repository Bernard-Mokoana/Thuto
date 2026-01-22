import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "Student" | "Tutor" | "Admin";
  }) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/profile"),
};

export const courseAPI = {
  getCourses: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    level?: string;
  }) => api.get("/courses", { params }),
  getCourse: (id: string) => api.get(`/courses/${id}`),
  createCourse: (courseData: any) => api.post("/courses", courseData),
  updateCourse: (id: string, courseData: any) =>
    api.put(`/courses/${id}`, courseData),
  deleteCourse: (id: string) => api.delete(`/courses/${id}`),
};

export const userAPI = {
  getUsers: () => api.get("/users"),
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

export const enrollmentAPI = {
  getEnrollments: () => api.get("/enrollments"),
  createEnrollment: (enrollmentData: { course: string; student: string }) =>
    api.post("/enrollments", enrollmentData),
  updateEnrollment: (id: string, enrollmentData: any) =>
    api.put(`/enrollments/${id}`, enrollmentData),
  deleteEnrollment: (id: string) => api.delete(`/enrollments/${id}`),
};

// Lesson API
export const lessonAPI = {
  getLessons: (courseId: string) => api.get(`/lessons/course/${courseId}`),
  getLesson: (id: string) => api.get(`/lessons/${id}`),
  createLesson: (lessonData: any) => api.post("/lessons", lessonData),
  updateLesson: (id: string, lessonData: any) =>
    api.put(`/lessons/${id}`, lessonData),
  deleteLesson: (id: string) => api.delete(`/lessons/${id}`),
};

export const categoryAPI = {
  getCategories: () => api.get("/categories"),
};

export const progressAPI = {
  getProgress: (courseId: string) => api.get(`/progress/course/${courseId}`),
  updateProgress: (progressData: any) => api.post("/progress", progressData),
  markLessonComplete: (lessonId: string) =>
    api.post(`/progress/lesson/${lessonId}/complete`),
};

export const transactionAPI = {
  getTransactions: () => api.get("/transaction"),
  createTransaction: (transactionData: any) =>
    api.post("/transaction", transactionData),
  getTransaction: (id: string) => api.get(`/transaction/${id}`),
};

export const assessmentAPI = {
  getAssessments: (courseId: string) =>
    api.get(`/assessments/course/${courseId}`),
  getAssessment: (id: string) => api.get(`/assessments/${id}`),
  createAssessment: (assessmentData: any) =>
    api.post("/assessments", assessmentData),
  updateAssessment: (id: string, assessmentData: any) =>
    api.put(`/assessments/${id}`, assessmentData),
  deleteAssessment: (id: string) => api.delete(`/assessments/${id}`),
};

export const submissionAPI = {
  getSubmissions: () => api.get("/submission"),
  createSubmission: (submissionData: any) =>
    api.post("/submission", submissionData),
  updateSubmission: (id: string, submissionData: any) =>
    api.put(`/submission/${id}`, submissionData),
  gradeSubmission: (id: string, grade: number) =>
    api.put(`/submission/${id}/grade`, { grade }),
};

export const certificateAPI = {
  getCertificates: () => api.get("/certificates"),
  getCertificate: (id: string) => api.get(`/certificates/${id}`),
  generateCertificate: (courseId: string) =>
    api.post(`/certificates/generate/${courseId}`),
};

export const statsAPI = {
  getStats: () => api.get("/stats"),
  getCourseStats: (courseId: string) => api.get(`/stats/course/${courseId}`),
  getUserStats: (userId: string) => api.get(`/stats/user/${userId}`),
};

export default api;
