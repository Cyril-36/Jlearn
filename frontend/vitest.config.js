/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // 👈 this simulates the browser
    globals: true,         // optional: allows global 'describe', 'it', etc.
  },
});


