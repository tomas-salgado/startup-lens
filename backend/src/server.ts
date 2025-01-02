import { config } from 'dotenv';
config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { QAService } from './qa';
import emailSubscriptionService from './services/emailSubscription';

const app = express();
const port = process.env.PORT || 3001;

// Initialize QA service
const qaService = new QAService();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://startuplens-test.vercel.app',
    'https://startuplens.app'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

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

    console.log('Received question:', question);
    const sources = await qaService.getSources(question);
    console.log('Sources:', sources);
    res.json(sources);
  } catch (error) {
    next(error);
  }
}) as express.RequestHandler);

// Email subscription endpoints
app.post('/api/subscribe', (async (req, res, next) => {
  try {
    const { email } = req.body as { email: string };
    
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const success = await emailSubscriptionService.addSubscriber(email);
    if (success) {
      res.json({ message: 'Successfully subscribed' });
    } else {
      res.json({ message: 'Already subscribed' });
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid email address') {
      res.status(400).json({ error: 'Invalid email address' });
    } else {
      next(error);
    }
  }
}) as express.RequestHandler);

app.post('/api/track-search', (async (req, res, next) => {
  try {
    const { email } = req.body as { email: string };
    
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    await emailSubscriptionService.updateSearchCount(email);
    res.json({ message: 'Search count updated' });
  } catch (error) {
    next(error);
  }
}) as express.RequestHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 