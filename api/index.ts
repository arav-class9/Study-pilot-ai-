import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { apiRouter } from '../server/routes.js';

dotenv.config();

const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount router on multiple prefixes to support all Vercel rewrite patterns
app.use('/api/ai', apiRouter);
app.use('/api', apiRouter);
app.use('/ai', apiRouter);
app.use('/', apiRouter);

// Global serverless error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[VERCEL API ERROR]:', err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Server error processing request on Vercel',
    code: err.code || 'INTERNAL_ERROR',
  });
});

export default app;

