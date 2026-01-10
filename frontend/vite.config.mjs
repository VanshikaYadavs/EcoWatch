import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 2000,
  },
  plugins: [tsconfigPaths(), react(), tagger()],
  resolve: {
    alias: [
      { find: /^components\/(.*)/, replacement: '/src/components/$1' },
      { find: /^pages\/(.*)/, replacement: '/src/pages/$1' },
      { find: /^auth\/(.*)/, replacement: '/src/auth/$1' },
      { find: /^layouts\/(.*)/, replacement: '/src/layouts/$1' },
      { find: /^services\/(.*)/, replacement: '/src/services/$1' },
      { find: /^utils\/(.*)/, replacement: '/src/utils/$1' }
    ]
  },
  server: {
    port: "5173",
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: ['.amazonaws.com', '.builtwithrocket.new']
  }
});