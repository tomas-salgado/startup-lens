import { config } from 'dotenv';
config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { QAService } from './qa';

const app = express();
const port = process.env.PORT || 3001;

// Initialize QA service
const qaService = new QAService();

// Middleware
app.use(express.json());
app.use(cors());

// Add timeout middleware
app.use((_: Request, res: Response, next: NextFunction) => {
  res.setTimeout(30000, () => {
    res.status(408).send('Request timeout');
  });
  next();
});

// Initialize QA service before starting server
(async () => {
  try {
    console.log('Starting server initialization...');
    await qaService.initialize();
    console.log('Server initialization complete');
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
})();

// Add new endpoint for getting sources
app.post('/api/sources', (async (req, res, next) => {
  try {
    const { question } = req.body as { question: string };
    
    if (!question) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    const sources = await qaService.getSources(question);
    res.json(sources);
  } catch (error) {
    next(error);
  }
}) as express.RequestHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 