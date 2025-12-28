import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config/config';
import { sendEmail } from '../../lib/email';
import { checkPassword, hashPassword } from '../../lib/hash';
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from '../../lib/token';
import User from '../../models/user.model';
import { loginSchema, registerSchema } from './auth.schema';

export async function registerUser(req: Request, res: Response) {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Invalid data!',
        errors: result.error.flatten(),
      });
    }

    const { name, email, password } = result.data;
    const normalizedEmail = email.toLocaleLowerCase().trim();
    const isExistingUser = await User.findOne({ email: normalizedEmail });

    if (isExistingUser) {
      return res.status(409).json({
        message:
          'Email address already in use. Please use different email address',
      });
    }

    const passwordHash = await hashPassword(password);
    const newUser = await User.create({
      name,
      email: normalizedEmail,
      role: 'user',
      password: passwordHash,
      isEmailVerified: false,
      isTwoFactorEnabled: false,
    });

    const verifyToken = jwt.sign(
      {
        sub: newUser.id,
      },
      config.jwtAuthSecret,
      {
        expiresIn: '1d',
      }
    );
    const verifyUrl = `${config.appUrl}/auth/verify-email?token=${verifyToken}`;

    await sendEmail(
      newUser.email,
      'Verify your email',
      `<p>Click below to verify email:</p>
       <p><a href=${verifyUrl}>Verify Email</a></p>
      `
    );

    return res.status(201).json({
      message: 'User registerd sucessfully!',
      user: {
        id: newUser.id,
        email: newUser.email,
        isEmailVerified: newUser.isEmailVerified,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.log(`Error while registering user. Error: ${error}`);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  const token = req.query.token as string;

  if (!token) {
    return res.status(400).json({
      message: 'Verification token is missing',
    });
  }

  try {
    const payload = jwt.verify(token, config.jwtAuthSecret) as {
      sub: string;
    };

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(400).json({
        message: 'User does not found',
      });
    }

    if (user.isEmailVerified) {
      return res.json({
        message: 'Email already verified',
      });
    }

    user.isEmailVerified = true;
    await user.save();
    return res.json({
      message: 'Email verified sucessfully',
    });
  } catch (error) {
    console.log(`Error while verifying email. Error: ${error}`);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Invalid data!',
        errors: result.error.flatten(),
      });
    }

    const { email, password } = result.data;
    const normalizedEmail = email.toLocaleLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({
        message: 'Invalid email or password',
      });
    }

    const isPasswordMatched = await checkPassword(password, user.password);

    if (!isPasswordMatched) {
      return res.status(400).json({
        message: 'Invalid email or password',
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your before login',
      });
    }

    const accessToken = createAccessToken(
      user.id,
      user.role,
      user.tokenVersion
    );
    const refreshToken = createRefreshToken(user.id, user.tokenVersion);

    const isProd = config.nodeEnvironment === 'production';

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Login sucessfully',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    });
  } catch (error) {
    console.log(`Error while login user. Error: ${error}`);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const token = req.cookies?.refreshToken as string | undefined;

    if (!token) {
      return res.status(401).json({
        message: 'Refresh token is missing',
      });
    }

    const payload = verifyRefreshToken(token) as {
      sub: string;
      tokenVersion: number;
    };

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({
        message: 'Invalid refresh token',
      });
    }

    const accessToken = createAccessToken(
      user.id,
      user.role,
      user.tokenVersion
    );
    const refreshToken = createRefreshToken(user.id, user.tokenVersion);
    const isProd = config.nodeEnvironment === 'production';

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Token refreshed',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    });
  } catch (error) {
    console.log(`Error while refreshing token. Error: ${error}`);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}
