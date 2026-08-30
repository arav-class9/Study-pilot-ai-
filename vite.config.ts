import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
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
    plugins: [react(), tailwindcss(), studyPilotApiPlugin()],
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
