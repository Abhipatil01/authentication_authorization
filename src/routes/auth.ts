import { Router } from 'express';
import {
  loginUser,
  registerUser,
  verifyEmail,
} from '../controllers/auth/auth.controller';

const router = Router();

router.post('/register', registerUser);
router.get('/verify-email', verifyEmail);
router.post('/login', loginUser);

export default router;
