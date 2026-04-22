import api from "./api";

export const categoryAPI = {
  getCategories: () => api.get("/categories"),
  createCategory: (categoryData: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    parentCategory?: string;
    sortOrder?: number;
  }) => api.post("/categories", categoryData),
};
