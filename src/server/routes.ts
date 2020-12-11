import { fastify } from 'fastify';
import dotenv from 'dotenv';

dotenv.config();

console.log(process.env);

const app = fastify({
  logger: process.env.NODE_ENV === 'development',
});

app.get('/', async (req, res) => {
  console.log(req);
  res.type('application/json').code(200);
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