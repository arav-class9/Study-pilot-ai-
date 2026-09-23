import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes.ts';

dotenv.config();

// Global crash prevention for unhandled async errors
process.on('uncaughtException', (err) => {
  console.error('[SERVER CRITICAL] Uncaught exception caught safely:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.warn('[SERVER CRITICAL] Unhandled promise rejection caught safely:', reason);
});

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Resilience headers & CORS
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Instant Health Check Endpoints
  const healthHandler = (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'StudyPilot AI Core Server',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  };

  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);
  app.get('/api/ai/health', healthHandler);

  // SEO Endpoints: Robots.txt & Dynamic XML Sitemap
  app.get('/robots.txt', (req: Request, res: Response) => {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    res.type('text/plain');
    res.sendFile(robotsPath);
  });

  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    res.type('application/xml');
    res.sendFile(sitemapPath);
  });

  // Mount API router
  app.use('/api/ai', apiRouter);

  // Global Express Error Handler Middleware (prevents any route throw from crashing server)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[EXPRESS ROUTE ERROR HANDLER]:', err);
    if (res.headersSent) {
      return next(err);
    }
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Internal Server Error occurred while processing request.',
      code: err.code || 'INTERNAL_ERROR',
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend assets from dist in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    // Fallback to index.html for SPA client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 StudyPilot AI Server listening on port ${PORT} (Zero-Crash Architecture Enabled)`);
  });

  // Keep sockets alive and prevent hanging connections
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  // Graceful shutdown handling
  const shutdown = (signal: string) => {
    console.log(`Received ${signal}, gracefully shutting down StudyPilot AI server...`);
    server.close(() => {
      console.log('HTTP server closed cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();

