import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_PORT || '5173', 10),
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_TARGET || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
            'zxing-vendor': ['@zxing/browser', '@zxing/library'],
          },
        },
      },
    },
  };
});
