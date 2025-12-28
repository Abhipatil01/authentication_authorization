import { Router } from 'express';
import {
  forgotPassword,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  verifyEmail,
} from '../controllers/auth/auth.controller';

const router = Router();

router.post('/register', registerUser);
router.get('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);

export default router;
