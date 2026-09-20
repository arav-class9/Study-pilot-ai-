import express from 'express';
import { apiRouter } from '../server/routes.js';

const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use('/api/ai', apiRouter);

export default app;
