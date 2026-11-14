import { createSlice } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

const initialState = {
  token: null,
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { token, user } = action.payload;
      state.loading = false;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logoutAction: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    restoreAuth: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = !!token;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logoutAction, restoreAuth } =
  authSlice.actions;

// Async Thunks
export const performLogin = (credentials) => async (dispatch) => {
  const { authApi } = await import('../api/authApi');
  try {
    dispatch(loginStart());
    const res = await authApi.login(credentials);
    if (res && res.data) {
      const token = res.data.accessToken || res.data.token;
      const user = res.data.user;

      await SecureStore.setItemAsync('pcm_mobile_token', token);
      await SecureStore.setItemAsync('pcm_mobile_user', JSON.stringify(user));

      dispatch(loginSuccess({ token, user }));
      return { success: true };
    }
  } catch (err) {
    const msg = err.response?.data?.message || 'Đăng nhập không thành công';
    dispatch(loginFailure(msg));
    return { success: false, error: msg };
  }
};

export const performLogout = () => async (dispatch) => {
  const { authApi } = await import('../api/authApi');
  try {
    await authApi.logout();
  } catch {
    // ignore
  } finally {
    try {
      await SecureStore.deleteItemAsync('pcm_mobile_token');
      await SecureStore.deleteItemAsync('pcm_mobile_user');
    } catch {
      // ignore
    }
    dispatch(logoutAction());
  }
};

export const checkStoredAuth = () => async (dispatch) => {
  try {
    const token = await SecureStore.getItemAsync('pcm_mobile_token');
    const userStr = await SecureStore.getItemAsync('pcm_mobile_user');
    if (token) {
      const user = userStr ? JSON.parse(userStr) : null;
      dispatch(restoreAuth({ token, user }));
    }
  } catch (err) {
    console.warn('Failed to restore auth from SecureStore', err);
  }
};

export default authSlice.reducer;

