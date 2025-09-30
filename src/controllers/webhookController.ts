import { FastifyRequest, FastifyReply } from 'fastify';

export class WebhookController {
  /**
   * POST /webhook - Process incoming webhook data
   */
  async createWebhook(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Check if request has body and correct content type
      const contentType = request.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        return reply.status(400).send({
          success: false,
          message: 'Content-Type must be application/json'
        });
      }

      // Try to parse JSON, handle empty body gracefully
      let body;
      try {
        const rawBody = request.body;
        if (!rawBody || (typeof rawBody === 'object' && Object.keys(rawBody).length === 0)) {
          body = {};
        } else {
          body = rawBody;
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return reply.status(400).send({
          success: false,
          message: 'Invalid JSON format'
        });
      }

      // Log the incoming data for debugging
      console.log('Webhook received:', body);

      // Return success response
      return reply.send({
        success: true,
        message: 'Webhook data received successfully',
        data: body
      });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return reply.status(500).send({
        success: false,
        message: 'Error processing webhook'
      });
    }
  }

  /**
   * GET /webhook - Retrieve webhook data (placeholder)
   */
  async getWebhooks(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.send({
        success: true,
        message: 'Webhook data storage has been removed',
        data: []
      });
    } catch (error) {
      console.error('Error retrieving webhook data:', error);
      return reply.status(500).send({
        success: false,
        message: 'Error retrieving webhook data'
      });
    }
  }

}
