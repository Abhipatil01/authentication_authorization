import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  host: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || 'localhost',
};

export default config;
