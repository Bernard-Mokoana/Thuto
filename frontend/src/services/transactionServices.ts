import api from "./api";
import type { Transaction } from "../types/models";

export const transactionAPI = {
  getTransactions: () => api.get("/transaction"),
  createTransaction: (transactionData: Transaction) =>
    api.post("/transaction", transactionData),
  getTransaction: (id: string) => api.get(`/transaction/${id}`),
};
