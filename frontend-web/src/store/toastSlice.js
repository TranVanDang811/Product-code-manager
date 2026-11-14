import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toasts: [],
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (state, action) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const toast = {
        id,
        type: action.payload.type || 'info', // 'success' | 'error' | 'info' | 'warning'
        message: action.payload.message || '',
        duration: action.payload.duration || 4000,
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;

