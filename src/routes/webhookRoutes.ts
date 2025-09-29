import { FastifyInstance } from 'fastify';
import { WebhookController } from '../controllers/webhookController.js';

export async function webhookRoutes(fastify: FastifyInstance) {
  // POST /webhook - Process incoming webhook data
  fastify.post('/webhook', WebhookController.createWebhook);
  
  // GET /webhook - Retrieve all webhook data
  fastify.get('/webhook', WebhookController.getWebhooks);
}
