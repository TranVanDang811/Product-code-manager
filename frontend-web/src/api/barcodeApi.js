import axiosClient from './axiosClient';

export const barcodeApi = {
  lookup: (data) => {
    return axiosClient.post('/barcodes/lookup', data);
  },

  assign: (data) => {
    return axiosClient.post('/barcodes/assign', data);
  },

  unassign: (productId) => {
    return axiosClient.delete(`/barcodes/${productId}`);
  },
};

