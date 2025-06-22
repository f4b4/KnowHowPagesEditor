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

  // In-memory count shared across requests
  let count = 0;

  /**
   * Register all application routes under the "/knowhow-api" prefix so the
   * server is effectively hosted at that sub-directory (e.g. /knowhow-api/).
   * This keeps the rest of the application code clean and avoids repeating
   * the prefix for every single route declaration.
   */
  fastify.register(async (api) => {
    // Basic health-check / hello route => GET /knowhow-api/
    api.get('/', async () => {
      return { message: 'Hello from KnowHowPagesEditor server! 🎉' };
    });

    // Increments and returns the current count => POST /knowhow-api/count
    api.post('/count', async () => {
      count++;
      return { count };
    });
  }, { prefix: '/knowhow-api' });

  return fastify;
}
