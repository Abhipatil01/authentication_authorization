import { Request, Response, Router } from 'express';
import requireAuth from '../middlewares/requireAuth';
import requireRole from '../middlewares/requireRole';
import User from '../models/user.model';

const router = Router();

router.get(
  '/users',
  requireAuth,
  requireRole('admin'),
  async (_req: Request, res: Response) => {
    try {
      const users = await User.find(
        {},
        {
          email: 1,
          role: 1,
          isEmailVerified: 1,
          createdAt: 1,
        }
      ).sort({ createdAt: -1 });

      const result = users.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      }));

      return res.json({
        users: result,
      });
    } catch (error) {
      console.log(`Error while checking role. Error: ${error}`);
      return res.status(401).json({
        message: "You don't have the access",
      });
    }
  }
);

export default router;
