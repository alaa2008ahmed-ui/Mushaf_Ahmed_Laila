import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function disableHmrClientPlugin(): Plugin {
  return {
    name: 'disable-hmr-client-ws',
    enforce: 'post',
    transform(code, id) {
      if (!id.endsWith('/vite/dist/client/client.mjs') && !id.endsWith('\\vite\\dist\\client\\client.mjs')) {
        return null;
      }
      return code
        .replace(
          'transport.connect(createHMRHandler(handleMessage));',
          '/* HMR disabled: skip WebSocket connection */'
        )
        .replace(
          'ws.send(JSON.stringify(data));',
          'if (ws && ws.readyState === 1) { ws.send(JSON.stringify(data)); }'
        );
    },
  };
}

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: false,
        watch: {
          ignored: ['**/android/**', '**/dist/**'],
        },
      },
      optimizeDeps: {
        entries: ['index.html'],
      },
      plugins: [react(), tailwindcss(), disableHmrClientPlugin()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true,
      },
    };
});