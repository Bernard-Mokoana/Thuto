import api from "./api";

export const userAPI = {
  getUsers: () => api.get("/users"),
  getUser: (id: string) => api.get(`/users/${id}`),
  getProfile: (id: string) => api.get(`/users/profile/${id}`),
  updateUser: (id: string, userData: any) =>
    api.put(`users/profile/${id}`, userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  updateUserRole: (id: string, role: "Student" | "Tutor" | "Admin") =>
    api.patch(`/users/${id}/role`, { role }),
  deleteMe: () => api.delete("/users/me"),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};
