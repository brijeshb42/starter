import { fastify } from 'fastify';
import dotenv from 'dotenv';

dotenv.config();

const app = fastify({
  logger: process.env.NODE_ENV === 'development',
});

app.get('/', async () => {
  return {
    hello: 'world',
  };
});

app.listen(process.env.SERVER_PORT!, (err, address) => {
  if (err) {
    throw err;
  }
  app.log.info(`Server running on: ${address}`);
});