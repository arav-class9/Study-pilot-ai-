import express from 'express';
import { apiRouter } from '../server/routes.js';

const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use('/api/ai', apiRouter);

app.get(['/google8011449c284f5ad1.html', '/api/google8011449c284f5ad1.html'], (_req, res) => {
  res.type('text/html').send('google-site-verification: google8011449c284f5ad1.html');
});

export default app;
