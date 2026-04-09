import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

function solarSizingTerminalLogger(): Plugin {
  return {
    name: 'solar-sizing-terminal-logger',
    configureServer(server) {
      server.middlewares.use('/__debug/sizing', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf-8');
            const payload = JSON.parse(rawBody) as {
              timestamp?: string;
              source?: string;
              formulas?: string[];
              inputs?: Record<string, unknown>;
              outputs?: Record<string, unknown>;
            };

            const divider = '='.repeat(78);
            console.log(`\n${divider}`);
            console.log('[Solar Debug][Terminal] New sizing trace');
            console.log(`time   : ${payload.timestamp ?? 'n/a'}`);
            console.log(`source : ${payload.source ?? 'unknown'}`);

            if (payload.formulas?.length) {
              console.log('\nFormulas:');
              payload.formulas.forEach((formula, index) => {
                console.log(`${index + 1}. ${formula}`);
              });
            }

            if (payload.inputs) {
              console.log('\nInputs:');
              Object.entries(payload.inputs).forEach(([key, value]) => {
                console.log(`- ${key}: ${JSON.stringify(value)}`);
              });
            }

            if (payload.outputs) {
              console.log('\nOutputs:');
              Object.entries(payload.outputs).forEach(([key, value]) => {
                console.log(`- ${key}: ${JSON.stringify(value)}`);
              });
            }

            console.log(divider);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ok: true}));
          } catch (error) {
            console.error('[Solar Debug][Terminal] Failed to parse payload', error);
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ok: false}));
          }
        });
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), solarSizingTerminalLogger()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
