import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true
  },
  preview: {
    port: 4173
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js']
  }
});
