import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// Custom plugin to handle ?import&react syntax (alias to ?react)
const svgImportPlugin = () => ({
  name: 'svg-import-alias',
  resolveId(id) {
    // Transform ?import&react to ?react for vite-plugin-svgr
    if (id.includes('?import&react')) {
      return id.replace('?import&react', '?react');
    }
    return null;
  },
});

const projectRoot = dirname(fileURLToPath(import.meta.url));
const marcadoRoot = resolve(projectRoot, '../marcado');
const marcadoPythonPath = resolve(marcadoRoot, 'src');

const marcadoRuntimePlugin = () => ({
  name: 'marcado-runtime-adapter',
  configureServer(server) {
    server.middlewares.use('/api/marcado/export', (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method Not Allowed');
        return;
      }

      const chunks: Buffer[] = [];
      req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      req.on('end', () => {
        let payload: { source?: string } = {};
        try {
          payload = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        } catch {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
          return;
        }

        execFile(
          'python3',
          [
            '-c',
            [
              'import json, os, sys',
              "sys.path.insert(0, os.environ['PYTHONPATH'])",
              'from marcado.parser import parse_text',
              'from marcado.export import export_document',
              'source = sys.stdin.read()',
              'parsed = parse_text(source)',
              'print(json.dumps(export_document(parsed), ensure_ascii=False))',
            ].join('; '),
          ],
          {
            cwd: marcadoRoot,
            env: { ...process.env, PYTHONPATH: marcadoPythonPath },
            encoding: 'utf8',
          },
          (error, stdout, stderr) => {
            if (error) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: stderr || error.message }));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(stdout);
          }
        ).stdin?.end(payload.source ?? '');
      });
    });
  },
});

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(), 
    tailwindcss(),
    svgImportPlugin(),
    svgr({
      // Support named ReactComponent export (for ?react syntax)
      svgrOptions: {
        exportType: 'named',
        namedExport: 'ReactComponent',
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg?react',
    }),
    {
        name: 'natively-runtime-script',
        transformIndexHtml(html) {
            if (command === 'build') {
                return html;
            }
            return html.replace(
                '</head>',
                `  <script type="module" src="/natively-runtime.js"></script>
</head>`
            );
        },
    },
    marcadoRuntimePlugin(),
  ],
  server: {
    allowedHosts: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Content-Security-Policy': 'frame-ancestors *',
    },
    hmr: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
  },
}))
