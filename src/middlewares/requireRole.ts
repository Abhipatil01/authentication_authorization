import { NextFunction, Request, Response } from 'express';

export default function requireRole(role: 'user' | 'admin') {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as any;
    const authUser = authReq.user;

    if (!authUser) {
      return res.status(401).json({
        message: 'You are not authorized user',
      });
    }

    if (role !== authUser.role) {
      return res.status(401).json({
        message: "You don't have access",
      });
    }
    next();
  };
}
