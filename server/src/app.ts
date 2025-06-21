import Fastify from 'fastify';
import cors from '@fastify/cors';

/**
 * Creates and returns a pre-configured Fastify instance.
 * The instance exposes one public route GET / that returns a plain JSON message.
 */
export function buildServer() {
  const fastify = Fastify({
    logger: true,
  });

  // Register CORS for convenience during local dev — allow all origins.
  fastify.register(cors, { origin: true });

  // Basic health-check / hello route
  fastify.get('/', async () => {
    return { message: 'Hello from KnowHowPagesEditor server! 🎉' };
  });

  return fastify;
}
