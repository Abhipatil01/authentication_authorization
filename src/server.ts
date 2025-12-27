import http from 'http';
import app from './app';
import config from './config/config';
import { connectToDB } from './config/db';

async function startServer() {
  await connectToDB();

  const server = http.createServer(app);

  server.listen(config.port, () => {
    console.log(`Server is running at: http://${config.host}:${config.port}`);
  });
}

startServer().catch((err) => {
  console.error('Error while starting the server');
  console.log(err);
  process.exit(1);
});
