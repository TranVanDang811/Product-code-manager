import { firebaseService } from '../services/firebaseService';

export const dashboardApi = {
  getStats: () => firebaseService.getStats(),
};
