import axiosClient from './axiosClient';

export const scanHistoryApi = {
  getHistories: (params = {}) => {
    return axiosClient.get('/scan-histories', { params });
  },

  getHistoryById: (id) => {
    return axiosClient.get(`/scan-histories/${id}`);
  },
};

