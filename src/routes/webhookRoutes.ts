import { FastifyInstance } from 'fastify';
import { WebhookController } from '../controllers/webhookController.js';

export async function webhookRoutes(fastify: FastifyInstance) {
  // POST /webhook - Process incoming webhook data
  fastify.post('/webhook', WebhookController.createWebhook);
  
  // GET /webhook - Retrieve all webhook data
  fastify.get('/webhook', WebhookController.getWebhooks);
  
  // POST /webhook/addWarningToAppointment - Add warning to appointment
  fastify.post('/webhook/addWarningToAppointment', WebhookController.addWarningToAppointment);
  
  // POST /webhook/updateCategoryOfAppointment - Update category of appointment
  fastify.post('/webhook/updateCategoryOfAppointment', WebhookController.updateCategoryOfAppointment);
  
  // POST /webhook/createAbsence - Create absence
  fastify.post('/webhook/createAbsence', WebhookController.createAbsence);
}
