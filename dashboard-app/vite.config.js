import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
  },
  base: '/',
  // base: process.env.VITE_BASE_PATH || '/Airdrop-Checker',
  // build: {
  //   outDir: 'dist', // Explicitly set for Vercel
  //   emptyOutDir: true, // Clears dist folder on each build
  // },
  // preview: {
  //   port: 3000 // Match Vercel's default port
  // }
});
