import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/ai.routes.js';

const app = express();

// ✅ allow requests from your frontend
app.use(
  cors({
    origin: 'http://localhost:5173', // frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(express.json());
app.get('/', (req, res) => res.send('Hello World!'));
app.use('/ai', aiRoutes);

export default app;
