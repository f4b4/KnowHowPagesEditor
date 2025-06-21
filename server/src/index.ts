import { buildServer } from './app';

const server = buildServer();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

server
  .listen({ port: PORT, host: '0.0.0.0' })
  .then(() => {
    server.log.info(`Fastify Server ready on http://localhost:${PORT}`);
  })
  .catch((err) => {
    server.log.error(err);
    process.exit(1);
  });
