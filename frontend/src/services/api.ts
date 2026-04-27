import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

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

export default api;

export { assessmentAPI } from "./assessmentServices";
export { authAPI } from "./authServices";
export { categoryAPI } from "./categoryAPI";
export { certificateAPI } from "./certificateServices";
export { courseAPI } from "./courseServices";
export { enrollmentAPI } from "./enrollmentServices";
export { lessonAPI } from "./lessonServices";
export { progressAPI } from "./progressServices";
export { statsAPI } from "./statsServices";
export { submissionAPI } from "./submissionServices";
export { transactionAPI } from "./transactionServices";
export { userAPI } from "./userServices";
