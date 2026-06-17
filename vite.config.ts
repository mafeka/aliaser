import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

// Plugin to write manifest and copy icons after build
function chromeExtensionPlugin() {
  return {
    name: 'chrome-extension',
    closeBundle() {
      // Write manifest — rewrite .ts entry paths to .js for the built output
      const manifest = JSON.parse(readFileSync('src/manifest.json', 'utf-8'));
      // Rewrite service_worker and content_scripts paths from .ts to .js
      if (manifest.background?.service_worker) {
        manifest.background.service_worker = manifest.background.service_worker.replace(/\.ts$/, '.js');
      }
      if (manifest.content_scripts) {
        manifest.content_scripts = manifest.content_scripts.map((cs: { matches: string[]; js: string[] }) => ({
          ...cs,
          js: cs.js.map((f: string) => f.replace(/\.ts$/, '.js')),
        }));
      }
      writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));

      // Copy icons
      mkdirSync('dist/icons', { recursive: true });
      for (const size of [16, 48, 128]) {
        copyFileSync(`src/icons/icon-${size}.png`, `dist/icons/icon-${size}.png`);
      }
    },
  };
}

export default defineConfig({
  // Set src as the root so HTML files resolve relative to src/
  root: resolve(__dirname, 'src'),
  plugins: [chromeExtensionPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        options: resolve(__dirname, 'src/options/options.html'),
        background: resolve(__dirname, 'src/background/service-worker.ts'),
        content: resolve(__dirname, 'src/content/detector.ts'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background/service-worker.js';
          if (chunk.name === 'content') return 'content/detector.js';
          return '[name]/[name].js';
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (info) => {
          const name = info.names?.[0] ?? info.name ?? 'asset';
          // Put CSS files next to their respective JS
          if (name === 'popup.css') return 'popup/popup.css';
          if (name === 'options.css') return 'options/options.css';
          return '[name][extname]';
        },
      },
    },
  },
});
