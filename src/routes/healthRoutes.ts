import { FastifyInstance } from 'fastify';
import { HealthController } from '../controllers/healthController.js';

export async function healthRoutes(fastify: FastifyInstance) {
  // GET /health - Health check endpoint
  fastify.get('/health', async (request, reply) => {
    const controller = new HealthController();
    return controller.getHealth(request, reply);
  });
}
