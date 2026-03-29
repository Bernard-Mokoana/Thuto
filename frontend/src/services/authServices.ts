import api from "./api";

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),
  register: (userData: FormData) =>
    api.post("/users/register", userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  logout: () => api.post("/auth/logout"),
};
