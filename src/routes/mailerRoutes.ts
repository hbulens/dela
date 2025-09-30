import { FastifyInstance } from 'fastify';
import { MailerController } from '../controllers/mailerController.js';

export async function mailerRoutes(fastify: FastifyInstance) {
  // POST /mailer - Send emails using SendGrid
  fastify.post('/mailer', async (request, reply) => {
    const controller = new MailerController();
    return controller.sendEmail(request, reply);
  });
}
