import axiosClient from './axiosClient';

export const barcodeApi = {
  lookup: (data) => axiosClient.post('/barcodes/lookup', data),
  assign: (data) => axiosClient.post('/barcodes/assign', data),
  unassign: (productId) => axiosClient.delete(`/barcodes/${productId}`),
};

