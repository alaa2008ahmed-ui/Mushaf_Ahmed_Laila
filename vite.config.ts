import fs from 'fs';
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

function qpcMadinahAssetsPlugin(): Plugin {
  const dataRoot = path.resolve(__dirname, 'data');
  let isBuild = false;

  return {
    name: 'qpc-madinah-assets',
    configResolved(resolved) {
      isBuild = resolved.command === 'build';
    },
    configureServer(server) {
      server.middlewares.use('/data', (req, res, next) => {
        const rawUrl = req.url || '';
        const queryIdx = rawUrl.indexOf('?');
        const cleanUrl = queryIdx >= 0 ? rawUrl.slice(0, queryIdx) : rawUrl;
        const query = queryIdx >= 0 ? rawUrl.slice(queryIdx) : '';
        if (query.includes('url') || query.includes('import') || query.includes('raw')) {
          return next();
        }
        if (!cleanUrl.startsWith('/fonts/') && cleanUrl !== '/qpc-v1-glyph-codes-wbw.json' && cleanUrl !== '/qpc-v1-15-lines.json') {
          return next();
        }
        const relPath = cleanUrl.replace(/^\/+/, '');
        const targetPath = path.resolve(dataRoot, relPath);
        if (!targetPath.startsWith(dataRoot + path.sep) || !fs.existsSync(targetPath)) {
          return next();
        }
        if (targetPath.endsWith('.woff2')) {
          res.setHeader('Content-Type', 'font/woff2');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (targetPath.endsWith('.json')) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=3600');
        }
        fs.createReadStream(targetPath).pipe(res);
      });
    },
    closeBundle() {
      if (!isBuild) return;
      const distDataDir = path.resolve(__dirname, 'dist', 'data');
      for (const fileName of ['qpc-v1-glyph-codes-wbw.json', 'qpc-v1-15-lines.json']) {
        const srcFile = path.join(dataRoot, fileName);
        if (fs.existsSync(srcFile)) {
          fs.mkdirSync(distDataDir, { recursive: true });
          fs.copyFileSync(srcFile, path.join(distDataDir, fileName));
        }
      }
    },
  };
}

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: false,
        ws: false as const,
        watch: {
          ignored: ['**/android/**', '**/dist/**', '**/public/**', '**/data/fonts/**'],
        },
      },
      optimizeDeps: {
        entries: ['index.html'],
      },
      plugins: [react(), tailwindcss(), disableHmrClientPlugin(), qpcMadinahAssetsPlugin()],
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