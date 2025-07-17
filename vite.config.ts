import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Usunięto 'lucide-react' z listy wykluczeń
    exclude: [], 
  },
});