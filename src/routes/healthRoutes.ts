import { FastifyInstance } from 'fastify';
import { HealthController } from '../controllers/healthController.js';

export async function healthRoutes(fastify: FastifyInstance) {
  // GET /health - Health check endpoint
  fastify.get('/health', HealthController.getHealth);
}
