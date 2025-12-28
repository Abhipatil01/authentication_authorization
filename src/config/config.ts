import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  host: string;
  smtpHost: string;
  smtpClient: number;
  smtpUser: string;
  smtpPass: string;
  emailFrom: string;
  jwtAuthSecret: string;
  appUrl: string;
  nodeEnvironment: string;
}

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || 'localhost';

const config: Config = {
  port,
  host,
  jwtAuthSecret: process.env.JWT_ACCESS_SECRET!,
  smtpHost: process.env.SMTP_HOST!,
  smtpClient: Number(process.env.SMTP_CLIENT) || 587,
  smtpUser: process.env.SMTP_USER!,
  smtpPass: process.env.SMTP_PASS!,
  emailFrom: process.env.EMAIL_FROM!,
  appUrl: process.env.APP_URL || `http://${host}:${port}`,
  nodeEnvironment: process.env.NODE_ENV!,
};

export default config;
