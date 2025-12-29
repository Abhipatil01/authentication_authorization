import cookieParser from 'cookie-parser';
import express from 'express';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

export default app;
