import api from "./api";

export const certificateAPI = {
  getCertificates: (userId: string) => api.get(`/certificates/${userId}`),
  generateCertificate: (userId: string, courseId: string) =>
    api.post(`/certificates/generate/${userId}/${courseId}`),
};
