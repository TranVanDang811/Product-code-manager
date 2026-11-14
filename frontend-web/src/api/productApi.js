import axiosClient from './axiosClient';

export const productApi = {
  getProducts: (params = {}) => {
    return axiosClient.get('/products', { params });
  },

  getProductById: (id) => {
    return axiosClient.get(`/products/${id}`);
  },

  getProductByCode: (productCode) => {
    return axiosClient.get(`/products/code/${productCode}`);
  },

  createProduct: (data) => {
    return axiosClient.post('/products', data);
  },

  updateProduct: (id, data) => {
    return axiosClient.put(`/products/${id}`, data);
  },

  updateProductStatus: (id, status) => {
    return axiosClient.patch(`/products/${id}/status`, { status });
  },

  archiveProduct: (id) => {
    return axiosClient.delete(`/products/${id}`);
  },

  uploadImage: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`/products/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteImage: (id) => {
    return axiosClient.delete(`/products/${id}/image`);
  },
};

