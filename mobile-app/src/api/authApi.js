import { firebaseService } from '../services/firebaseService';

export const authApi = {
  login: (credentials) => firebaseService.login(credentials),
  getMe: () => firebaseService.getMe(),
  logout: () => firebaseService.logout(),
};
