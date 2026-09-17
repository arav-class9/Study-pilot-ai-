import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { solveDoubt } from './server/services/doubtSolver.js';
import { generateQuiz } from './server/services/quizGenerator.js';
import { generateNotes } from './server/services/notesGenerator.js';
import { generateWeaknessRecoveryPlan } from './server/services/weaknessRecovery.js';
import { generateStudyPlan } from './server/services/studyPlanner.js';

dotenv.config();

function studyPilotApiPlugin(): Plugin {
  return {
    name: 'studypilot-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/ai/')) {
          return next();
        }

        // Parse JSON body
        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const parsedBody = body ? JSON.parse(body) : {};
            res.setHeader('Content-Type', 'application/json');

            if (req.url === '/api/ai/doubt' && req.method === 'POST') {
              const result = await solveDoubt(parsedBody);
              res.end(JSON.stringify({ success: true, data: result }));
              return;
            }

            if (req.url === '/api/ai/quiz' && req.method === 'POST') {
              const result = await generateQuiz(parsedBody);
              res.end(JSON.stringify({ success: true, data: result }));
              return;
            }

            if (req.url === '/api/ai/notes' && req.method === 'POST') {
              const result = await generateNotes(parsedBody);
              res.end(JSON.stringify({ success: true, data: result }));
              return;
            }

            if (req.url === '/api/ai/weakness-plan' && req.method === 'POST') {
              const result = await generateWeaknessRecoveryPlan(parsedBody);
              res.end(JSON.stringify({ success: true, data: result }));
              return;
            }

            if (req.url === '/api/ai/study-plan' && req.method === 'POST') {
              const result = await generateStudyPlan(parsedBody);
              res.end(JSON.stringify({ success: true, data: result }));
              return;
            }

            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Endpoint not found' }));
          } catch (error: any) {
            console.error('API middleware error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: error.message || 'Internal server error' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      studyPilotApiPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
          'favicon.ico',
          'favicon.png',
          'favicon-32x32.png',
          'favicon-64x64.png',
          'manifest.webmanifest',
          'manifest.json'
        ],
        manifest: {
          id: '/',
          name: 'StudyPilot AI',
          short_name: 'StudyPilot AI',
          description: 'AI-powered study coach featuring official NCERT school books, interactive quizzes, handwritten solution grader, and AI tutor.',
          theme_color: '#2563eb',
          background_color: '#1e1b4b',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any'
            }
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
