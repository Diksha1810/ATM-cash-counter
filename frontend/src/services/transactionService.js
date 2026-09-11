import { apiClient } from './apiClient';

export const transactionService = {
  async getTransactions(page = 1, limit = 10) {
    return await apiClient.get('/transactions', {
      params: { page, limit },
    });
  },

  async getTransactionById(id) {
    return await apiClient.get(`/transactions/${id}`);
  },
};
