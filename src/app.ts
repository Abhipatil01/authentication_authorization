import cookieParser from 'cookie-parser';
import express from 'express';
import authRoutes from './routes/auth';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);

export default app;
