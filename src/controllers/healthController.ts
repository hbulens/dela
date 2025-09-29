import { FastifyRequest, FastifyReply } from 'fastify';

export class HealthController {
  /**
   * GET /health - Health check endpoint
   */
  static async getHealth(request: FastifyRequest, reply: FastifyReply) {
    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    
    return reply.send({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      emailService: sendGridApiKey ? 'initialized' : 'disabled'
    });
  }
}
