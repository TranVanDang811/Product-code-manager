import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('pcm_token');
let user = null;
try {
  const storedUser = localStorage.getItem('pcm_user');
  if (storedUser) {
    user = JSON.parse(storedUser);
  }
} catch {
  user = null;
}

const initialState = {
  token: token || null,
  user: user,
  isAuthenticated: !!token,
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
      localStorage.setItem('pcm_token', token);
      localStorage.setItem('pcm_user', JSON.stringify(user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('pcm_token');
      localStorage.removeItem('pcm_user');
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('pcm_user', JSON.stringify(action.payload));
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, setUser } = authSlice.actions;
export default authSlice.reducer;

