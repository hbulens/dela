import { FastifyRequest, FastifyReply } from 'fastify';
import { serverStore } from '../store/serverStore.js';

export class WebhookController {
  /**
   * POST /webhook - Process incoming webhook data
   */
  static async createWebhook(request: FastifyRequest, reply: FastifyReply) {
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

      // Store the webhook data and add block to queue
      await serverStore.addWebhookData(body);
      await serverStore.addBlockToQueue(body);

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
   * GET /webhook - Retrieve all webhook data
   */
  static async getWebhooks(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.send(serverStore.getWebhookData());
    } catch (error) {
      console.error('Error retrieving webhook data:', error);
      return reply.status(500).send({
        success: false,
        message: 'Error retrieving webhook data'
      });
    }
  }

  /**
   * POST /webhook/addWarningToAppointment - Add warning to appointment
   */
  static async addWarningToAppointment(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Check if request has body and correct content type
      const contentType = request.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        return reply.status(400).send({
          success: false,
          message: 'Content-Type must be application/json'
        });
      }

      // Validate required fields
      const body = request.body as any;
      if (!body || typeof body !== 'object') {
        return reply.status(400).send({
          success: false,
          message: 'Request body must be a valid JSON object'
        });
      }

      // Log the incoming data for debugging
      console.log('Add warning to appointment webhook received:', body);

      // Store the webhook data and add block to queue
      await serverStore.addWebhookData({
        type: 'addWarningToAppointment',
        ...body
      });
      await serverStore.addBlockToQueue({
        type: 'addWarningToAppointment',
        ...body
      });

      // Return success response
      return reply.send({
        success: true,
        message: 'Warning added to appointment successfully',
        data: body
      });
    } catch (error) {
      console.error('Error adding warning to appointment:', error);
      return reply.status(500).send({
        success: false,
        message: 'Error adding warning to appointment'
      });
    }
  }

  /**
   * POST /webhook/updateCategoryOfAppointment - Update category of appointment
   */
  static async updateCategoryOfAppointment(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Check if request has body and correct content type
      const contentType = request.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        return reply.status(400).send({
          success: false,
          message: 'Content-Type must be application/json'
        });
      }

      // Validate required fields
      const body = request.body as any;
      if (!body || typeof body !== 'object') {
        return reply.status(400).send({
          success: false,
          message: 'Request body must be a valid JSON object'
        });
      }

      // Log the incoming data for debugging
      console.log('Update category of appointment webhook received:', body);

      // Store the webhook data and add block to queue
      await serverStore.addWebhookData({
        type: 'updateCategoryOfAppointment',
        ...body
      });
      await serverStore.addBlockToQueue({
        type: 'updateCategoryOfAppointment',
        ...body
      });

      // Return success response
      return reply.send({
        success: true,
        message: 'Appointment category updated successfully',
        data: body
      });
    } catch (error) {
      console.error('Error updating appointment category:', error);
      return reply.status(500).send({
        success: false,
        message: 'Error updating appointment category'
      });
    }
  }

  /**
   * POST /webhook/createAbsence - Create absence
   */
  static async createAbsence(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Check if request has body and correct content type
      const contentType = request.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        return reply.status(400).send({
          success: false,
          message: 'Content-Type must be application/json'
        });
      }

      // Validate required fields
      const body = request.body as any;
      if (!body || typeof body !== 'object') {
        return reply.status(400).send({
          success: false,
          message: 'Request body must be a valid JSON object'
        });
      }

      // Log the incoming data for debugging
      console.log('Create absence webhook received:', body);

      // Store the webhook data and add block to queue
      await serverStore.addWebhookData({
        type: 'createAbsence',
        ...body
      });
      await serverStore.addBlockToQueue({
        type: 'createAbsence',
        ...body
      });

      // Return success response
      return reply.send({
        success: true,
        message: 'Absence created successfully',
        data: body
      });
    } catch (error) {
      console.error('Error creating absence:', error);
      return reply.status(500).send({
        success: false,
        message: 'Error creating absence'
      });
    }
  }
}
