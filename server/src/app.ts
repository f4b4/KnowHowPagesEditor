import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import { 
  buildContentTree, 
  readMarkdownFile, 
  writeMarkdownFile, 
  TreeNode 
} from './fs-router';

// Zod schemas for validation
const FileRequestSchema = z.object({
  path: z.string().min(1)
});

const FileWriteSchema = z.object({
  path: z.string().min(1),
  content: z.string()
});

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
   * Register all application routes under the "/knowhow-api" prefix.
   */
  fastify.register(async (api) => {
    // Basic health-check / hello route => GET /knowhow-api/
    api.get('/', async () => {
      return { message: 'Hello from KnowHowPagesEditor server! 🎉' };
    });

    // Get content tree structure => GET /api/tree
    api.get('/tree', async (request, reply) => {
      try {
        const tree: TreeNode = await buildContentTree();
        return { tree };
      } catch (error) {
        request.log.error('Failed to build content tree:', error);
        reply.status(500);
        return { 
          error: 'Failed to build content tree',
          message: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    // Get markdown file content => GET /api/file?path=relative/path/to/file.md
    api.get('/file', async (request, reply) => {
      try {
        const validation = FileRequestSchema.safeParse(request.query);
        
        if (!validation.success) {
          reply.status(400);
          return { 
            error: 'Invalid request', 
            details: validation.error.issues 
          };
        }

        const { path } = validation.data;
        const content = await readMarkdownFile(path);
        
        return { 
          path,
          content 
        };
      } catch (error) {
        request.log.error('Failed to read file:', error);
        reply.status(500);
        return { 
          error: 'Failed to read file',
          message: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    // Save markdown file content => PUT /api/file
    api.put('/file', async (request, reply) => {
      try {
        const validation = FileWriteSchema.safeParse(request.body);
        
        if (!validation.success) {
          reply.status(400);
          return { 
            error: 'Invalid request body', 
            details: validation.error.issues 
          };
        }

        const { path, content } = validation.data;
        await writeMarkdownFile(path, content);
        
        return { 
          success: true,
          path,
          message: 'File saved successfully'
        };
      } catch (error) {
        request.log.error('Failed to write file:', error);
        reply.status(500);
        return { 
          error: 'Failed to write file',
          message: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    // Increments and returns the current count => POST /api/count
    api.post('/count', async () => {
      count++;
      return { count };
    });
  }, { prefix: '/knowhow-api' });

  return fastify;
}
