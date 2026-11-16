import { firebaseService } from '../services/firebaseService';

export const productApi = {
  getProducts: (params = {}) => firebaseService.getProducts(params),
  getProductById: (id) => firebaseService.getProductById(id),
  getProductByCode: (productCode) => firebaseService.getProductByCode(productCode),
  createProduct: (data) => firebaseService.createProduct(data),
  updateProduct: (id, data) => firebaseService.updateProduct(id, data),
  updateProductStatus: (id, status) => firebaseService.updateProductStatus(id, status),
  archiveProduct: (id) => firebaseService.archiveProduct(id),
  deleteProduct: (id) => firebaseService.deleteProduct(id),
  uploadImage: (id, file) => firebaseService.uploadImage(id, file),
  deleteImage: (id) => firebaseService.deleteImage(id),
};
