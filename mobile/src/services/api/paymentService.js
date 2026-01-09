import apiClient from './apiClient';

export const paymentService = {
  getPlans: async () => {
    const response = await apiClient.get('/payment/plans');
    return response.data;
  },

  createOrder: async (amount, planType) => {
    const response = await apiClient.post('/payment/create-order', {
      amount,
      planType,
    });
    return response.data;
  },

  verifyPayment: async (merchantTransactionId, transactionId) => {
    const response = await apiClient.post('/payment/verify', {
      merchantTransactionId,
      transactionId,
    });
    return response.data;
  },

  checkPremiumStatus: async () => {
    const response = await apiClient.get('/payment/status');
    return response.data;
  },
};

