import api from "./api";

export const certificateAPI = {
  getCertificates: () => api.get("/certificates"),
  getCertificate: (id: string) => api.get(`certificates/${id}`),
  generateCertificate: (courseId: string) =>
    api.post(`certificates/generate/${courseId}`),
};
