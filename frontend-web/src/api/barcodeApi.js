import { firebaseService } from '../services/firebaseService';

export const barcodeApi = {
  lookup: (data) => firebaseService.lookupBarcode(data),
  assign: (data) => firebaseService.assignBarcode(data),
  unassign: (productId) => firebaseService.unassignBarcode(productId),
};
