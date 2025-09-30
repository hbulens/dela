import { FastifyInstance } from 'fastify';
import { WebhookController } from '../controllers/webhookController.js';

export async function webhookRoutes(fastify: FastifyInstance) {
  // POST / - Process incoming webhook data
  fastify.post('/', async (request, reply) => {
    const controller = new WebhookController();
    return controller.createWebhook(request, reply);
  });

  // GET / - Retrieve all webhook data
  fastify.get('/', async (request, reply) => {
    const controller = new WebhookController();
    return controller.getWebhooks(request, reply);
  });
}
