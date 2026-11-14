import axiosClient from './axiosClient';

export const scanHistoryApi = {
  getHistories: (params = {}) => axiosClient.get('/scan-histories', { params }),
};

