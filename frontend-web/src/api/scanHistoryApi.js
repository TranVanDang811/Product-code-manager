import { firebaseService } from '../services/firebaseService';

export const scanHistoryApi = {
  getHistories: (params = {}) => firebaseService.getScanHistories(params),
  getHistoryById: (id) => firebaseService.getHistoryById(id),
};
