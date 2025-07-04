import { defineConfig } from 'vite';

export default defineConfig({
  base: '/racinggame/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        game: 'game.html'
      }
    }
  },
});
