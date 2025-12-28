import jwt from 'jsonwebtoken';
import config from '../config/config';

export function createAccessToken(
  userId: string,
  role: 'user' | 'admin',
  tokenVersion: number
) {
  const payload = {
    sub: userId,
    role,
    tokenVersion,
  };

  return jwt.sign(payload, config.jwtAuthSecret, {
    expiresIn: '30m',
  });
}

export function createRefreshToken(userId: string, tokenVersion: number) {
  const payload = {
    sub: userId,
    tokenVersion,
  };

  return jwt.sign(payload, config.jwtAuthSecret, {
    expiresIn: '7d',
  });
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, config.jwtAuthSecret);
}
